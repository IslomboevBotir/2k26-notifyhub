/**
 * @file tests/patterns.test.ts
 *
 * NotifyHub loyihasidagi barcha 5 ta majburiy va 5 ta bonus patternlarni
 * to'liq qamrab oluvchi avtomatlashtirilgan testlar to'plami.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Channels (Bridge Realization, Adapter, Factory Method)
import { ConsoleChannel } from "../src/channels/console.js";
import { FileChannel } from "../src/channels/file.js";
import { TelegramChannel } from "../src/channels/telegram.js";
import { LegacySmsGateway, SmsChannelAdapter } from "../src/channels/sms-adapter.js";
import { ChannelFactory } from "../src/channels/factory.js";

// Notifications (Bridge Abstraction)
import {
  AlertNotification,
  ReminderNotification,
  PromoNotification,
} from "../src/notifications/types.js";

// Locales (Abstract Factory)
import {
  UzFactory,
  RuFactory,
  EnFactory,
  getLocaleFactory,
} from "../src/locales/factories.js";

// Decorators (Decorator)
import {
  TextMessage,
  TimestampDecorator,
  SignatureDecorator,
  EncryptDecorator,
  UrgentDecorator,
} from "../src/decorators/message-decorators.js";

// Recipients (Composite)
import { User, Group } from "../src/recipients/recipients.js";

// Core (Singleton, Builder, Facade, Prototype)
import { NotificationHistory } from "../src/core/history.js";
import { NotificationBuilder } from "../src/core/builder.js";
import { BroadcastTemplate } from "../src/templates/prototype.js";
import { NotifyHub } from "../src/core/hub.js";

describe("1. Bridge Pattern Testlari", () => {
  it("Har qanday bildirishnoma turi istalgan kanal orqali yuborilishi kerak", () => {
    const consoleChan = new ConsoleChannel();
    const telegramChan = new TelegramChannel();

    const alert = new AlertNotification(consoleChan);
    const reminder = new ReminderNotification(telegramChan);

    assert.equal(alert.priorityCode, 1);
    assert.equal(reminder.priorityCode, 2);

    assert.equal(alert.send("TestUser", "Diqqat xabari"), true);
    assert.equal(reminder.send("TestUser", "Eslatma xabari"), true);
  });

  it("Kanalni dinamik ravishda o'zgartirish mumkin bo'lishi kerak", () => {
    const alert = new AlertNotification(new ConsoleChannel());
    assert.equal(alert.getChannel().name, "console");

    alert.setChannel(new TelegramChannel());
    assert.equal(alert.getChannel().name, "telegram");
  });
});

describe("2. Abstract Factory Pattern Testlari", () => {
  it("UzFactory o'zbek tilidagi shablonlar oilasini yaratishi kerak", () => {
    const uz = new UzFactory();
    assert.equal(uz.createAlertTemplate().render("Xatolik"), "⚠️ DIQQAT: Xatolik");
    assert.equal(uz.createReminderTemplate().render("Uchrashuv"), "⏰ Eslatma: Uchrashuv");
    assert.equal(uz.createPromoTemplate().render("Chegirma"), "🎁 Aksiya: Chegirma");
  });

  it("RuFactory rus tilidagi shablonlar oilasini yaratishi kerak", () => {
    const ru = new RuFactory();
    assert.equal(ru.createAlertTemplate().render("Ошибка"), "⚠️ ВНИМАНИЕ: Ошибка");
    assert.equal(ru.createReminderTemplate().render("Встреча"), "⏰ Напоминание: Встреча");
    assert.equal(ru.createPromoTemplate().render("Скидка"), "🎁 Акция: Скидка");
  });

  it("EnFactory ingliz tilidagi shablonlar oilasini yaratishi kerak", () => {
    const en = new EnFactory();
    assert.equal(en.createAlertTemplate().render("Error"), "⚠️ ALERT: Error");
    assert.equal(en.createReminderTemplate().render("Meeting"), "⏰ Reminder: Meeting");
    assert.equal(en.createPromoTemplate().render("Sale"), "🎁 Promo: Sale");
  });

  it("getLocaleFactory til kodi bo'yicha to'g'ri fabrikalarni qaytarishi kerak", () => {
    assert.equal(getLocaleFactory("uz").getLanguageCode(), "uz");
    assert.equal(getLocaleFactory("ru").getLanguageCode(), "ru");
    assert.equal(getLocaleFactory("en").getLanguageCode(), "en");
    assert.throws(() => getLocaleFactory("fr"));
  });
});

describe("3. Decorator Pattern Testlari", () => {
  it("Oddiy TextMessage xabarni o'zgarishsiz qaytarishi kerak", () => {
    const msg = new TextMessage("Salom");
    assert.equal(msg.getText(), "Salom");
  });

  it("TimestampDecorator va SignatureDecorator ketma-ket qo'llanganda to'g'ri formatlanishi kerak", () => {
    const date = new Date(2026, 10, 7, 15, 30); // 07.11.2026 15:30
    const raw = new TextMessage("Dars ko'chirildi");
    const withTimestamp = new TimestampDecorator(raw, date);
    const withSignature = new SignatureDecorator(withTimestamp, "— NotifyHub");

    assert.equal(withSignature.getText(), "Dars ko'chirildi [07.11.2026 15:30] — NotifyHub");
  });

  it("UrgentDecorator matnni katta harflarga o'tkazib 🔴 belgisini qo'yishi kerak", () => {
    const raw = new TextMessage("Shoshilinch xabar");
    const urgent = new UrgentDecorator(raw);
    assert.equal(urgent.getText(), "🔴 SHOSHILINCH XABAR");
  });

  it("EncryptDecorator Base64 shifrlash va deshifrlashni to'g'ri bajarishi kerak", () => {
    const raw = new TextMessage("Maxfiy Parol");
    const encrypted = new EncryptDecorator(raw);
    const cipherText = encrypted.getText();

    assert.match(cipherText, /^\[ENCRYPTED:[A-Za-z0-9+/=]+\]$/);
    assert.equal(EncryptDecorator.decrypt(cipherText), "Maxfiy Parol");
  });
});

describe("4. Adapter Pattern Testlari", () => {
  it("SmsChannelAdapter LegacySmsGateway bilan muvaffaqiyatli bog'lanishi kerak", () => {
    const legacy = new LegacySmsGateway();
    const adapter = new SmsChannelAdapter(legacy);

    // Muvaffaqiyatli holat
    const success = adapter.send("+998901234567", "Test SMS", 1);
    assert.equal(success, true);
  });

  it("Noto'g'ri telefon raqami yuborilganda LegacySmsGateway 400 qaytarib adapter false berishi kerak", () => {
    const legacy = new LegacySmsGateway();
    const adapter = new SmsChannelAdapter(legacy);

    const failure = adapter.send("not-a-phone-number", "Test SMS", 1);
    assert.equal(failure, false);
  });
});

describe("5. Singleton Pattern Testlari", () => {
  beforeEach(() => {
    NotificationHistory.getInstance().clear();
  });

  it("NotificationHistory butun dastur uchun yagona instansiya bo'lishi kerak", () => {
    const instance1 = NotificationHistory.getInstance();
    const instance2 = NotificationHistory.getInstance();
    assert.equal(instance1, instance2);
  });

  it("Statistika to'g'ri hisoblanishi va saqlanishi kerak", () => {
    const history = NotificationHistory.getInstance();
    history.log({
      recipientName: "Ali",
      recipientContact: "+998901111111",
      channel: "console",
      type: "alert",
      text: "Xabar 1",
      success: true,
    });
    history.log({
      recipientName: "Vali",
      recipientContact: "+998902222222",
      channel: "sms",
      type: "reminder",
      text: "Xabar 2",
      success: false,
    });

    const stats = history.getStats();
    assert.equal(stats.totalSent, 2);
    assert.equal(stats.byChannel["console"], 1);
    assert.equal(stats.byChannel["sms"], 1);
    assert.equal(stats.byType["alert"], 1);
    assert.equal(stats.byType["reminder"], 1);
    assert.equal(stats.failures, 1);
  });
});

describe("6. Composite Pattern Testlari (Bonus)", () => {
  it("Guruh ichidagi barcha a'zolar va ichki guruhlar rekursiv olinishi kerak", () => {
    const user1 = new User("User 1", "+998901");
    const user2 = new User("User 2", "+998902");
    const user3 = new User("User 3", "+998903");

    const groupA = new Group("Guruh A").add(user1).add(user2);
    const groupB = new Group("Guruh B").add(user3);

    const mainGroup = new Group("Asosiy guruh").add(groupA).add(groupB);

    const users = mainGroup.getUsers();
    assert.equal(users.length, 3);
    assert.deepEqual(
      users.map((u) => u.getName()),
      ["User 1", "User 2", "User 3"]
    );
  });

  it("Takrorlangan foydalanuvchilar faqat bir marta olinishi kerak", () => {
    const user1 = new User("User 1", "+998901");
    const group1 = new Group("G1").add(user1);
    const group2 = new Group("G2").add(user1);
    const main = new Group("Main").add(group1).add(group2);

    assert.equal(main.getUsers().length, 1);
  });
});

describe("7. Builder Pattern Testlari (Bonus)", () => {
  it("NotificationBuilder orqali zanjirsimon tarzda to'liq bildirishnoma qurilishi kerak", () => {
    const user = new User("Ali", "+998901112233");
    const customDate = new Date(2026, 10, 7, 15, 30);

    const built = new NotificationBuilder()
      .setType("reminder")
      .setLocale("uz")
      .setChannel("sms")
      .setTo(user)
      .setText("Ertaga imtihon soat 9:00 da")
      .withTimestamp(customDate)
      .withSignature("— NotifyHub")
      .build();

    assert.equal(built.notification.type, "reminder");
    assert.equal(built.channel.name, "sms");
    assert.equal(
      built.finalText,
      "⏰ Eslatma: Ertaga imtihon soat 9:00 da [07.11.2026 15:30] — NotifyHub"
    );
  });
});

describe("8. Prototype Pattern Testlari (Bonus)", () => {
  it("BroadcastTemplate clone metodi orqali parametrlar yangilanib klonlanishi kerak", () => {
    const original = new BroadcastTemplate({
      id: "tpl_1",
      name: "Original",
      type: "reminder",
      locale: "uz",
      channel: "sms",
      content: "Asl matn",
      recipientName: "Guruh 1",
      decorators: ["timestamp"],
    });

    const clone = original.clone({
      name: "Klon nusxa",
      content: "Yangi matn",
    });

    assert.notEqual(clone.id, original.id);
    assert.equal(clone.name, "Klon nusxa");
    assert.equal(clone.content, "Yangi matn");
    assert.equal(clone.locale, original.locale);
    assert.equal(clone.channel, original.channel);
  });
});

describe("9. Facade Pattern Testlari (Bonus)", () => {
  beforeEach(() => {
    NotificationHistory.getInstance().clear();
  });

  it("NotifyHub facade oddiy chaqiruv orqali barcha quyi tizimlarni muvaffaqiyatli ishlatishi kerak", () => {
    const hub = new NotifyHub();
    const result = hub.send({
      type: "reminder",
      locale: "uz",
      channel: "sms",
      recipientName: "301-guruh",
      text: "Ertaga laboratoriya ishi topshiriladi",
      decorators: ["timestamp", "signature"],
    });

    assert.equal(result.totalRecipients, 2);
    assert.equal(result.successCount, 2);
    assert.equal(result.failureCount, 0);

    const stats = hub.getStats();
    assert.equal(stats.totalSent, 2);
    assert.equal(stats.byChannel["sms"], 2);
  });
});

describe("10. Factory Method Pattern Testlari (Bonus)", () => {
  it("ChannelFactory berilgan nom bo'yicha mos kanal obyektini qaytarishi kerak", () => {
    assert.equal(ChannelFactory.create("console").name, "console");
    assert.equal(ChannelFactory.create("file").name, "file");
    assert.equal(ChannelFactory.create("telegram").name, "telegram");
    assert.equal(ChannelFactory.create("sms").name, "sms");
    assert.throws(() => ChannelFactory.create("unsupported"));
  });
});
