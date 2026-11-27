import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, it } from "node:test";
import type { Channel } from "../src/channels/base.js";
import { FileChannel } from "../src/channels/file.js";
import { LegacySmsGateway, SmsChannelAdapter } from "../src/channels/sms_adapter.js";
import { TelegramChannel } from "../src/channels/telegram.js";
import { NotificationHistory } from "../src/core/history.js";
import {
  EncryptDecorator,
  PlainMessage,
  SignatureDecorator,
  TimestampDecorator,
  UrgentDecorator,
} from "../src/decorators/message_decorators.js";
import { EnFactory, RuFactory, UzFactory } from "../src/locales/factories.js";
import { AlertNotification, ReminderNotification } from "../src/notifications/types.js";
import { Recipient } from "../src/recipients/recipients.js";
import type { ChannelType, NotificationType } from "../src/types.js";

describe("NotifyHub — 5 ta majburiy pattern", () => {
  beforeEach(() => {
    NotificationHistory.getInstance().clear();
  });

  it("Singleton: NotificationHistory har doim bitta nusxa qaytaradi va statistikani hisoblaydi", () => {
    const h1 = NotificationHistory.getInstance();
    const h2 = NotificationHistory.getInstance();
    assert.strictEqual(h1, h2);

    const ali = new Recipient("u1", "Ali", "+998901112233", "@ali");
    const bobur = new Recipient("u2", "Bobur", "not-a-phone");

    const sms = new SmsChannelAdapter(new LegacySmsGateway());
    const alert = new AlertNotification(sms);

    alert.send(ali, "Server ishlamayapti", new UzFactory(), ["timestamp"]);
    alert.send(bobur, "Xato test", new UzFactory());

    const stats = h2.getStats();
    assert.equal(stats.total, 2);
    assert.equal(stats.succeeded, 1);
    assert.equal(stats.failed, 1);
    assert.equal(stats.byChannel.sms, 2);
    assert.equal(stats.byType.alert, 2);
  });

  it("Abstract Factory: har bir til oilasi o'z shablonlarini izchil yaratadi", () => {
    const uz = new UzFactory();
    const ru = new RuFactory();
    const en = new EnFactory();

    assert.equal(
      uz.createAlertTemplate().render("Server ishlamayapti"),
      "⚠️ DIQQAT: Server ishlamayapti"
    );
    assert.equal(
      ru.createAlertTemplate().render("Сервер недоступен"),
      "⚠️ ВНИМАНИЕ: Сервер недоступен"
    );
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
    assert.equal(
      encrypted.getText(),
      `[ENC:${Buffer.from("Salom", "utf-8").toString("base64")}]`
    );
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
    const validRecipient = new Recipient("u1", "Ali", "+998901112233");
    const invalidRecipient = new Recipient("u2", "Bobur", "bad-phone");

    assert.equal(adapter.send(validRecipient, "Test alert", "alert"), true);
    assert.equal(adapter.send(validRecipient, "Test reminder", "reminder"), true);
    assert.equal(adapter.send(validRecipient, "Test promo", "promo"), true);
    assert.equal(adapter.send(invalidRecipient, "Should fail", "alert"), false);

    assert.deepEqual(
      captured.map((c) => c.priorityCode),
      [1, 2, 3, 1]
    );
    assert.equal(captured[0].payload, "Test alert");
  });

  it("Bridge: istalgan bildirishnoma turi istalgan yangi kanal bilan ishlaydi", () => {
    const deliveries: Array<{ recipient: string; text: string; type: NotificationType }> = [];
    const customChannel: Channel = {
      name: "console" as ChannelType,
      send(recipient, text, notificationType) {
        deliveries.push({ recipient: recipient.name, text, type: notificationType });
        return true;
      },
    };

    const recipient = new Recipient("u1", "Malika", "+998913334455");
    const alert = new AlertNotification(customChannel);
    const reminder = new ReminderNotification(customChannel);

    alert.send(recipient, "Xavf", new UzFactory());
    reminder.send(recipient, "Meeting", new EnFactory());

    assert.equal(deliveries.length, 2);
    assert.equal(deliveries[0].type, "alert");
    assert.equal(deliveries[0].text, "⚠️ DIQQAT: Xavf");
    assert.equal(deliveries[1].type, "reminder");
    assert.equal(deliveries[1].text, "📌 Reminder: Meeting");
  });

  it("FileChannel va TelegramChannel: faylga yozish va Telegram tekshiruvi ishlaydi", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "notifyhub-"));
    const logFile = path.join(tempDir, "out.log");
    const fileChannel = new FileChannel(logFile);
    const telegramChannel = new TelegramChannel();

    const ali = new Recipient("u1", "Ali", "+998901112233", "@ali");
    const bobur = new Recipient("u2", "Bobur", "+998901112244");

    const fileReminder = new ReminderNotification(fileChannel);
    fileReminder.send(ali, "Ertaga imtihon", new UzFactory(), ["timestamp", "signature"], {
      date: new Date(2026, 10, 7, 9, 0),
    });

    const written = fs.readFileSync(logFile, "utf-8");
    assert.match(
      written,
      /📌 Eslatma: Ertaga imtihon \[07\.11\.2026 09:00\] — NotifyHub jamoasi/
    );
    fs.rmSync(tempDir, { recursive: true, force: true });

    assert.equal(telegramChannel.send(ali, "Salom", "alert"), true);
    assert.equal(telegramChannel.send(bobur, "Salom", "alert"), false);
  });
});
