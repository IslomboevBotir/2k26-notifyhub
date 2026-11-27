import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, it } from "node:test";
import type { Channel } from "../src/channels/base.js";
import { ChannelFactory } from "../src/channels/factory.js";
import { FileChannel } from "../src/channels/file.js";
import { LegacySmsGateway, SmsChannelAdapter } from "../src/channels/sms_adapter.js";
import { TelegramChannel } from "../src/channels/telegram.js";
import { NotificationBuilder } from "../src/core/builder.js";
import { NotificationHistory } from "../src/core/history.js";
import { NotifyHub } from "../src/core/hub.js";
import { BroadcastTemplate } from "../src/core/prototype.js";
import {
  EncryptDecorator,
  PlainMessage,
  SignatureDecorator,
  TimestampDecorator,
  UrgentDecorator,
} from "../src/decorators/message_decorators.js";
import { EnFactory, RuFactory, UzFactory } from "../src/locales/factories.js";
import { AlertNotification, ReminderNotification } from "../src/notifications/types.js";
import { Group, User } from "../src/recipients/recipients.js";
import type { ChannelType, NotificationType } from "../src/types.js";

describe("NotifyHub Design Patterns", () => {
  beforeEach(() => {
    NotificationHistory.getInstance().clear();
  });

  it("Singleton: NotificationHistory har doim bitta nusxa qaytaradi", () => {
    const h1 = NotificationHistory.getInstance();
    const h2 = NotificationHistory.getInstance();
    assert.strictEqual(h1, h2);
  });

  it("Abstract Factory: har bir til oilasi o'z shablonlarini izchil yaratadi", () => {
    const uz = new UzFactory();
    const ru = new RuFactory();
    const en = new EnFactory();

    assert.equal(uz.createAlertTemplate().render("Server ishlamayapti"), "⚠️ DIQQAT: Server ishlamayapti");
    assert.equal(ru.createAlertTemplate().render("Сервер недоступен"), "⚠️ ВНИМАНИЕ: Сервер недоступен");
    assert.equal(en.createPromoTemplate().render("Sale 50%"), "🎁 Promo: Sale 50%");
  });

  it("Decorator: o'ramlarni istalgan tartibda qo'llaydi", () => {
    const fixedDate = new Date(2026, 10, 7, 15, 30);
    const msg = new SignatureDecorator(
      new TimestampDecorator(new PlainMessage("Dars ko'chirildi"), fixedDate),
      "— NotifyHub"
    );
    assert.equal(msg.getText(), "Dars ko'chirildi [07.11.2026 15:30] — NotifyHub");

    const urgent = new UrgentDecorator(new PlainMessage("tizim to'xtadi"));
    assert.equal(urgent.getText(), "🔴 TIZIM TO'XTADI");

    const encrypted = new EncryptDecorator(new PlainMessage("Salom"), "base64");
    assert.equal(encrypted.getText(), `[ENC:${Buffer.from("Salom", "utf-8").toString("base64")}]`);
  });

  it("Adapter: SmsChannelAdapter LegacySmsGateway ga to'g'ri moslaydi", () => {
    const captured: Array<{ phone: string; payload: string; priorityCode: number }> = [];

    class SpyGateway extends LegacySmsGateway {
      public override sendSms(phone: string, payload: Uint8Array, priorityCode: number): number {
        captured.push({
          phone,
          payload: Buffer.from(payload).toString("utf-8"),
          priorityCode,
        });
        return super.sendSms(phone, payload, priorityCode);
      }
    }

    const adapter = new SmsChannelAdapter(new SpyGateway());
    const validUser = new User("u1", "Ali", "+998901112233");
    const invalidUser = new User("u2", "Bobur", "bad-phone");

    assert.equal(adapter.send(validUser, "Test alert", "alert"), true);
    assert.equal(adapter.send(validUser, "Test reminder", "reminder"), true);
    assert.equal(adapter.send(validUser, "Test promo", "promo"), true);
    assert.equal(adapter.send(invalidUser, "Should fail", "alert"), false);

    assert.deepEqual(
      captured.map((c) => c.priorityCode),
      [1, 2, 3, 1]
    );
    assert.equal(captured[0].payload, "Test alert");
  });

  it("Bridge: istalgan bildirishnoma turi istalgan yangi kanal bilan ishlaydi", () => {
    const deliveries: Array<{ user: string; text: string; type: NotificationType }> = [];
    const customChannel: Channel = {
      name: "console" as ChannelType,
      send(user, text, notificationType) {
        deliveries.push({ user: user.name, text, type: notificationType });
        return true;
      },
    };

    const user = new User("u1", "Malika", "+998913334455");
    const alert = new AlertNotification(customChannel);
    const reminder = new ReminderNotification(customChannel);

    alert.send(user, "Xavf", new UzFactory());
    reminder.send(user, "Meeting", new EnFactory());

    assert.equal(deliveries.length, 2);
    assert.equal(deliveries[0].type, "alert");
    assert.equal(deliveries[0].text, "⚠️ DIQQAT: Xavf");
    assert.equal(deliveries[1].type, "reminder");
    assert.equal(deliveries[1].text, "📌 Reminder: Meeting");
  });

  it("Composite: ichma-ich guruhlarga yuborishda barcha foydalanuvchilar noyob yig'iladi", () => {
    const ali = new User("u1", "Ali", "+998901112233", "@ali");
    const vali = new User("u2", "Vali", "+998907778899", "@vali");
    const g301 = new Group("301", [ali, vali]);
    const g302 = new Group("302", [ali]); // Ali ikki guruhda ham bor
    const course = new Group("3-kurs", [g301, g302]);

    const users = course.getUsers();
    assert.equal(users.length, 2);
    assert.deepEqual(
      users.map((u) => u.name),
      ["Ali", "Vali"]
    );
  });

  it("Builder + Factory Method + FileChannel: to'liq zanjir ishlaydi", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "notifyhub-"));
    const logFile = path.join(tempDir, "out.log");
    const fileChannel = ChannelFactory.create("file", { filePath: logFile });
    assert.ok(fileChannel instanceof FileChannel);

    const user = new User("u1", "Ali", "+998901112233");
    const prepared = new NotificationBuilder()
      .type("reminder")
      .locale("uz")
      .channel(fileChannel)
      .to(user)
      .text("Ertaga imtihon")
      .withTimestamp(new Date(2026, 10, 7, 9, 0))
      .withSignature()
      .build();

    const summary = prepared.send();
    assert.equal(summary.total, 1);
    assert.equal(summary.succeeded, 1);

    const written = fs.readFileSync(logFile, "utf-8");
    assert.match(written, /📌 Eslatma: Ertaga imtihon \[07\.11\.2026 09:00\] — NotifyHub jamoasi/);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("Prototype: clone() asl shablonni o'zgartirmaydi", () => {
    const user = new User("u1", "Ali", "+998901112233", "@ali");
    const original = new BroadcastTemplate({
      id: "t1",
      name: "Haftalik",
      type: "reminder",
      locale: "uz",
      channel: "telegram",
      recipient: user,
      text: "Asl matn",
      decorators: ["timestamp"],
    });

    const copy = original.clone();
    copy.text = "Yangi matn";
    copy.decorators.push("signature");

    assert.equal(original.text, "Asl matn");
    assert.deepEqual(original.decorators, ["timestamp"]);
    assert.equal(copy.text, "Yangi matn");
    assert.deepEqual(copy.decorators, ["timestamp", "signature"]);
  });

  it("Facade + Singleton statistika: muvaffaqiyatli va xato yuborishlarni hisoblaydi", () => {
    const hub = new NotifyHub();
    const summary = hub.send({
      type: "alert",
      locale: "uz",
      channel: "sms",
      recipientName: "barcha",
      text: "Test",
    });

    // barcha guruhida 4 ta user bor: 3 ta to'g'ri raqam + 1 ta noto'g'ri raqam (Bobur)
    assert.equal(summary.total, 4);
    assert.equal(summary.succeeded, 3);
    assert.equal(summary.failed, 1);

    const stats = NotificationHistory.getInstance().getStats();
    assert.equal(stats.total, 4);
    assert.equal(stats.byChannel.sms, 4);
    assert.equal(stats.byType.alert, 4);
    assert.equal(stats.failed, 1);

    const tg = ChannelFactory.create("telegram");
    assert.ok(tg instanceof TelegramChannel);
  });
});
