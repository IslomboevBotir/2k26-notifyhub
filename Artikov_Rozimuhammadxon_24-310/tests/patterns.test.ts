import { beforeEach, describe, expect, it } from "vitest";
import { MemoryFileStorage, configureEnvironment, type OutputPort } from "../src/core/environment";
import { NotificationBuilder, describeChain, parseExtras } from "../src/core/builder";
import { NotificationHistory } from "../src/core/history";
import { NotifyHub } from "../src/core/hub";
import { DistributionTemplate } from "../src/core/templates";
import { Channel } from "../src/channels/base";
import { ChannelFactory } from "../src/channels/factory";
import { FileChannel } from "../src/channels/file";
import { LegacySmsGateway, SmsChannelAdapter } from "../src/channels/smsAdapter";
import { TelegramChannel } from "../src/channels/telegram";
import {
  EncryptDecorator,
  Message,
  SignatureDecorator,
  TimestampDecorator,
  UrgentDecorator,
} from "../src/decorators/messageDecorators";
import { EnFactory, RuFactory, UzFactory, getLocaleFactory } from "../src/locales/factories";
import { AlertNotification, PromoNotification, ReminderNotification } from "../src/notifications/types";
import { buildDefaultDirectory } from "../src/recipients/directory";
import { Group, User } from "../src/recipients/recipients";
import type { NotificationKind } from "../src/core/types";

class CollectingOutput implements OutputPort {
  lines: string[] = [];
  write(line: string) {
    this.lines.push(line);
  }
}

/** Test uchun kanal: yuborilganlarni yig'adi. */
class SpyChannel extends Channel {
  readonly name = "spy";
  sent: { to: string; text: string; kind: NotificationKind }[] = [];
  send(recipient: User, text: string, kind: NotificationKind) {
    this.sent.push({ to: recipient.name, text, kind });
    return true;
  }
}

const fixedClock = () => new Date(2026, 10, 7, 15, 30);
let output: CollectingOutput;

beforeEach(() => {
  output = new CollectingOutput();
  configureEnvironment({ output, fileStorage: new MemoryFileStorage() });
  NotificationHistory.getInstance().clear();
});

describe("Bridge", () => {
  it("istalgan tur istalgan kanal orqali ishlaydi", () => {
    const ali = new User("Ali", "+998901112233", "@ali");
    for (const NotificationClass of [AlertNotification, ReminderNotification, PromoNotification]) {
      for (const channel of [new SpyChannel(), new TelegramChannel(), new SmsChannelAdapter()]) {
        const report = new NotificationClass({ channel, text: "test" }).send(ali);
        expect(report.sent).toBe(1);
      }
    }
  });

  it("yangi kanal qo'shish bildirishnoma klasslarini o'zgartirishni talab qilmaydi", () => {
    const spy = new SpyChannel();
    new AlertNotification({ channel: spy, text: "Server ishlamayapti" }).send(new User("Ali"));
    expect(spy.sent).toEqual([{ to: "Ali", text: "⚠️ DIQQAT: Server ishlamayapti", kind: "alert" }]);
  });
});

describe("Abstract Factory", () => {
  it("topshiriqdagi misol", () => {
    expect(new UzFactory().createAlertTemplate().render("Server ishlamayapti")).toBe("⚠️ DIQQAT: Server ishlamayapti");
    expect(new RuFactory().createAlertTemplate().render("Сервер недоступен")).toBe("⚠️ ВНИМАНИЕ: Сервер недоступен");
  });

  it("bitta fabrikaning barcha mahsulotlari bir xil tilda", () => {
    for (const factory of [new UzFactory(), new RuFactory(), new EnFactory()]) {
      const templates = [factory.createAlertTemplate(), factory.createReminderTemplate(), factory.createPromoTemplate()];
      expect(new Set(templates.map((t) => t.locale))).toEqual(new Set([factory.code]));
    }
  });

  it("imzo xabar tilida qo'yiladi, tillar aralashmaydi", () => {
    const text = new NotificationBuilder().type("reminder").locale("ru").channel(new SpyChannel()).text("Пара перенесена").withSignature().build().render();
    expect(text).toBe("Напоминание: Пара перенесена — Команда NotifyHub");
  });

  it("noma'lum til xato beradi", () => {
    expect(() => getLocaleFactory("de")).toThrow(/Noma'lum til/);
  });
});

describe("Decorator", () => {
  it("Signature(Timestamp(Message))", () => {
    const message = new SignatureDecorator(new TimestampDecorator(new Message("Dars ko'chirildi"), fixedClock));
    expect(message.render()).toBe("Dars ko'chirildi [07.11.2026 15:30] — NotifyHub jamoasi");
  });

  it("tartib natijaga ta'sir qiladi", () => {
    const a = new UrgentDecorator(new SignatureDecorator(new Message("hi"), "— x")).render();
    const b = new SignatureDecorator(new UrgentDecorator(new Message("hi")), "— x").render();
    expect(a).toBe("🔴 HI — X");
    expect(b).toBe("🔴 HI — x");
  });

  it("bir dekoratorni bir necha marta qo'yish mumkin", () => {
    const twice = new UrgentDecorator(new UrgentDecorator(new Message("a"))).render();
    expect(twice).toBe("🔴 🔴 A");
  });

  it("Sezar shifri lotin va kirill harflarida qaytariladi", () => {
    const encrypted = new EncryptDecorator(new Message("Salom, Привет!")).render();
    expect(encrypted).toBe("🔒 Vdorp, Тулезх!");
    expect(EncryptDecorator.decryptCaesar(encrypted)).toBe("Salom, Привет!");
  });

  it("Base64 UTF-8 matnni to'g'ri kodlaydi", () => {
    const encrypted = new EncryptDecorator(new Message("Imtihon ertaga ✅"), "base64").render();
    expect(EncryptDecorator.fromBase64(encrypted)).toBe("Imtihon ertaga ✅");
  });
});

describe("Adapter", () => {
  class RecordingGateway extends LegacySmsGateway {
    calls: { phone: string; payload: Uint8Array; priorityCode: number }[] = [];
    constructor(private readonly status = 200) {
      super();
    }
    override sendSms(phone: string, payload: Uint8Array, priorityCode: number) {
      this.calls.push({ phone, payload, priorityCode });
      return this.status;
    }
  }

  it("matnni bytes'ga va turni priority_code'ga aylantiradi", () => {
    const gateway = new RecordingGateway();
    const adapter = new SmsChannelAdapter(gateway);
    const user = new User("Ali", "+998901112233");
    adapter.send(user, "Salom", "alert");
    adapter.send(user, "Salom", "reminder");
    adapter.send(user, "Salom", "promo");
    expect(gateway.calls.map((c) => c.priorityCode)).toEqual([1, 2, 3]);
    expect(gateway.calls[0].payload).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(gateway.calls[0].payload)).toBe("Salom");
  });

  it("200 → true, 400 → false", () => {
    const user = new User("Ali", "+998901112233");
    expect(new SmsChannelAdapter(new RecordingGateway(200)).send(user, "x", "alert")).toBe(true);
    expect(new SmsChannelAdapter(new RecordingGateway(400)).send(user, "x", "alert")).toBe(false);
  });

  it("haqiqiy shlyuz noto'g'ri raqamga 400 qaytaradi", () => {
    expect(new SmsChannelAdapter().send(new User("Madina", "90-123"), "x", "alert")).toBe(false);
  });
});

describe("Singleton", () => {
  it("har doim bitta obyekt", () => {
    expect(NotificationHistory.getInstance()).toBe(NotificationHistory.getInstance());
  });

  it("turli joylardan yuborilganlar bitta tarixga tushadi va statistika to'g'ri", () => {
    const hub = new NotifyHub();
    hub.send({ kind: "reminder", locale: "uz", channel: "sms", recipient: "3-kurs", text: "Imtihon" });
    hub.send({ kind: "alert", locale: "en", channel: "telegram", recipient: "302-guruh", text: "Down" });
    new PromoNotification({ channel: new SpyChannel(), text: "Aksiya" }).send(new User("X"));

    const stats = NotificationHistory.getInstance().getStats();
    expect(stats.total).toBe(4);
    expect(stats.failed).toBe(1); // Vali Karimovda Telegram yo'q
    expect(stats.byChannel).toEqual({ sms: 2, telegram: 1, spy: 1 });
    expect(stats.byKind).toEqual({ reminder: 2, alert: 1, promo: 1 });
    expect(stats.failedByChannel).toEqual({ telegram: 1 });
  });
});

describe("Composite", () => {
  it("guruhga yuborilgan xabar ichki guruhlar orqali har bir foydalanuvchiga boradi", () => {
    const directory = buildDefaultDirectory();
    expect(directory.find("3-kurs")!.getUsers().map((u) => u.name)).toEqual(["Ali Valiyev", "Vali Karimov"]);
    expect(directory.getUsers()).toHaveLength(6);
  });

  it("bir odam ikki guruhda bo'lsa, xabar unga bir marta boradi", () => {
    const ali = new User("Ali");
    const all = new Group("Hammasi", [new Group("A", [ali]), new Group("B", [ali])]);
    const spy = new SpyChannel();
    new AlertNotification({ channel: spy, text: "x" }).send(all);
    expect(spy.sent).toHaveLength(1);
  });

  it("siklni oldini oladi", () => {
    const parent = new Group("Ota");
    const child = new Group("Bola");
    parent.add(child);
    expect(() => child.add(parent)).toThrow(/sikl/);
  });
});

describe("Builder", () => {
  it("topshiriqdagi zanjir ishlaydi", () => {
    const group = new Group("g", [new User("Ali", "+998901112233")]);
    const notification = new NotificationBuilder()
      .type("alert").locale("uz").channel("sms").to(group).text("Server ishlamayapti").withTimestamp().build();
    expect(notification).toBeInstanceOf(AlertNotification);
    expect(notification.channel).toBeInstanceOf(SmsChannelAdapter);
    expect(notification.send().sent).toBe(1);
  });

  it("majburiy maydonlarni tekshiradi", () => {
    expect(() => new NotificationBuilder().channel("console").text("x").build()).toThrow(/turi/);
    expect(() => new NotificationBuilder().type("alert").text("x").build()).toThrow(/Kanal/);
    expect(() => new NotificationBuilder().type("alert").channel("console").build()).toThrow(/matni/);
    expect(() => new NotificationBuilder().type("spam")).toThrow(/Noma'lum tur/);
  });

  it("qo'shimchalarni tahlil qiladi va zanjirni tasvirlaydi", () => {
    expect(parseExtras("timestamp, signature encrypt:base64")).toEqual(["timestamp", "signature", "encrypt:base64"]);
    expect(() => parseExtras("glitter")).toThrow(/Noma'lum qo'shimcha/);
    expect(describeChain(["timestamp", "signature"])).toBe("Signature(Timestamp(Message))");
  });
});

describe("Prototype", () => {
  it("klon mustaqil, asl shablon o'zgarmaydi", () => {
    const group = new Group("3-kurs", [new User("Ali")]);
    const original = new DistributionTemplate({
      name: "Haftalik eslatma", kind: "reminder", locale: "uz", channel: "console",
      recipient: group, text: "Hisobot", extras: ["timestamp"],
    });
    const other = new Group("4-kurs", [new User("Vali")]);
    const copy = original.clone({ text: "Yangi matn", recipient: other });

    expect(copy).not.toBe(original);
    expect(copy.text).toBe("Yangi matn");
    expect(copy.recipient).toBe(other);
    expect(original.text).toBe("Hisobot");
    expect(original.recipient).toBe(group);
    expect(copy.extras).not.toBe(original.extras);
    expect(copy.extras).toEqual(original.extras);
  });

  it("reyestr har doim nusxa beradi", () => {
    const hub = new NotifyHub();
    const a = hub.templates.get("Haftalik eslatma");
    const b = hub.templates.get("Haftalik eslatma");
    expect(a).not.toBe(b);
    hub.sendTemplate("Haftalik eslatma", { text: "Boshqa matn", recipient: "4-kurs" });
    expect(hub.templates.get("Haftalik eslatma").text).toBe("Haftalik hisobotni juma kuni soat 18:00 gacha topshiring");
  });
});

describe("Factory Method", () => {
  it("nom bo'yicha kanal yaratadi", () => {
    expect(ChannelFactory.create("telegram")).toBeInstanceOf(TelegramChannel);
    expect(ChannelFactory.create("SMS")).toBeInstanceOf(SmsChannelAdapter);
    expect(ChannelFactory.create("file")).toBeInstanceOf(FileChannel);
    expect(() => ChannelFactory.create("pigeon")).toThrow(/Noma'lum kanal/);
  });
});

describe("Facade", () => {
  it("topshiriqdagi misol: 3-kursga SMS eslatma", () => {
    const hub = new NotifyHub();
    const report = hub.send({
      kind: "reminder", locale: "uz", channel: "sms", recipient: "3-kurs",
      text: "Ertaga imtihon soat 9:00 da", extras: ["timestamp", "signature"],
    });
    expect(report).toMatchObject({ total: 2, sent: 2, failed: 0 });
    expect(output.lines.some((l) => l.startsWith("[SMS → +998901112233] Eslatma: Ertaga imtihon soat 9:00 da ["))).toBe(true);
    expect(output.lines.at(-1)).toBe("✅ Yuborildi: 2 tadan 2 tasi");
  });

  it("fayl kanali faylga yozadi", () => {
    const storage = new MemoryFileStorage();
    configureEnvironment({ fileStorage: storage });
    new NotifyHub().send({ kind: "alert", locale: "uz", channel: "file", recipient: "Ali Valiyev", text: "Test" });
    expect(storage.read()).toContain("alert | Ali Valiyev | ⚠️ DIQQAT: Test");
  });

  it("noma'lum qabul qiluvchi xato beradi", () => {
    expect(() => new NotifyHub().send({ kind: "alert", locale: "uz", channel: "console", recipient: "Hech kim", text: "x" })).toThrow(/topilmadi/);
  });
});
