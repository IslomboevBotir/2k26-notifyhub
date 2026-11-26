/**
 * @file core/hub.ts
 *
 * PATTERN: Facade (Tuzilmaviy / Structural) - Bonus Pattern (+1 ball)
 *
 * MAQSAD:
 * Butun quyi tizim (subsystem) murakkabligini bitta qulay interfeys ortiga yashirish.
 * Tashqi kod (masalan, `main.ts` yoki UI) ko'plab quyi modullar (Bridge, Abstract Factory,
 * Decorator, Adapter, Composite, Builder, Prototype, Singleton) bilan alohida ishlamaydi.
 * Buning o'rniga `NotifyHub` fasadining `send()`, `showHistory()`, `showStats()` kabi
 * oddiy va qulay metodlarini chaqiradi.
 */

import { ChannelFactory } from "../channels/factory.js";
import { NotificationHistory, NotificationRecord, NotificationStats } from "./history.js";
import { NotificationBuilder, SendResult } from "./builder.js";
import { Recipient, User, Group } from "../recipients/recipients.js";
import { TemplateRegistry, BroadcastTemplate } from "../templates/prototype.js";

export interface SendOptions {
  type: "alert" | "reminder" | "promo" | string;
  locale: "uz" | "ru" | "en" | string;
  channel: "console" | "file" | "telegram" | "sms" | string;
  recipientName: string;
  text: string;
  decorators?: ("timestamp" | "signature" | "encrypt" | "urgent" | string)[];
  customDate?: Date;
  customSignature?: string;
}

export class NotifyHub {
  private readonly history: NotificationHistory;
  private readonly templateRegistry: TemplateRegistry;
  private readonly recipients = new Map<string, Recipient>();

  constructor() {
    this.history = NotificationHistory.getInstance();
    this.templateRegistry = new TemplateRegistry();
    this.seedDefaultRecipients();
  }

  /**
   * Boshlang'ich test foydalanuvchilari va guruhlarini yaratish (Composite).
   */
  private seedDefaultRecipients(): void {
    // Alohida foydalanuvchilar (User - Leaf)
    const user1 = new User("Aziz Rahimov", "+998901112233");
    const user2 = new User("Malika Karimova", "+998907778899");
    const user3 = new User("Jasur Aliyev", "+998933334455");
    const user4 = new User("Dilnoza Umarova", "+998971110022");

    this.registerRecipient(user1);
    this.registerRecipient(user2);
    this.registerRecipient(user3);
    this.registerRecipient(user4);

    // Kichik guruhlar (Group - Composite)
    const group301 = new Group("301-guruh");
    group301.add(user1).add(user2);

    const group302 = new Group("302-guruh");
    group302.add(user3).add(user4);

    this.registerRecipient(group301);
    this.registerRecipient(group302);

    // Katta kompozit guruh (guruh ichida boshqa guruhlar)
    const course3 = new Group("3-kurs");
    course3.add(group301).add(group302);

    const allStudents = new Group("Barcha talabalar");
    allStudents.add(course3);

    this.registerRecipient(course3);
    this.registerRecipient(allStudents);
  }

  public registerRecipient(recipient: Recipient): void {
    this.recipients.set(recipient.getName().toLowerCase(), recipient);
  }

  public findRecipient(nameOrQuery: string): Recipient {
    const key = nameOrQuery.trim().toLowerCase();
    const found = this.recipients.get(key);
    if (found) {
      return found;
    }

    // Agar mavjud bo'lmasa, avtomatik yangi User yaratamiz
    // Agar telefon kiritilgan bo'lsa telefon sifatida, aks holda standart simulyatsiya raqami
    const isPhone = key.startsWith("+") || /^\d+$/.test(key);
    const contact = isPhone ? nameOrQuery.trim() : `+998900000000`;
    const newUser = new User(nameOrQuery.trim(), contact);
    this.registerRecipient(newUser);
    return newUser;
  }

  public getAllRecipients(): Recipient[] {
    return Array.from(this.recipients.values());
  }

  /**
   * Facade: Bildirishnoma yuborishning yagona markazlashgan qulay metodi.
   * Ichki Builder, Factory, Decorator, Bridge va Composite obyektlarini ishlatadi.
   */
  public send(options: SendOptions): SendResult {
    const recipient = this.findRecipient(options.recipientName);

    const builder = new NotificationBuilder()
      .setType(options.type)
      .setLocale(options.locale)
      .setChannel(options.channel)
      .setTo(recipient)
      .setText(options.text);

    const decorators = options.decorators || [];
    for (const dec of decorators) {
      const d = dec.trim().toLowerCase();
      if (d === "timestamp") {
        builder.withTimestamp(options.customDate);
      } else if (d === "signature") {
        builder.withSignature(options.customSignature);
      } else if (d === "encrypt") {
        builder.withEncrypt();
      } else if (d === "urgent") {
        builder.withUrgent();
      }
    }

    const { notification, finalText, channel } = builder.build();

    // Composite pattern: Guruh bo'lsa barcha User larni olamiz
    const users = recipient.getUsers();
    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      // Aloqa manziliga xabar yuborish
      const success = notification.send(user.getContact(), finalText);

      // Singleton tarixiga yozish
      this.history.log({
        recipientName: user.getName(),
        recipientContact: user.getContact(),
        channel: channel.name,
        type: notification.type,
        text: finalText,
        success,
      });

      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    console.log(`✅ Yuborildi: ${users.length} tadan ${successCount} tasi\n`);

    return {
      totalRecipients: users.length,
      successCount,
      failureCount,
      finalMessage: finalText,
    };
  }

  /**
   * Facade: Saqlangan shablon (Prototype) asosida yuborish.
   */
  public sendFromTemplate(
    templateId: string,
    overrides?: {
      content?: string;
      recipientName?: string;
      channel?: "console" | "file" | "telegram" | "sms";
    }
  ): SendResult {
    const template = this.templateRegistry.get(templateId);
    if (!template) {
      throw new Error(`Shablon topilmadi: ${templateId}`);
    }

    // Prototype pattern clone() chaqiriladi
    const cloned = template.clone(overrides);

    return this.send({
      type: cloned.type,
      locale: cloned.locale,
      channel: cloned.channel,
      recipientName: cloned.recipientName,
      text: cloned.content,
      decorators: cloned.decorators,
    });
  }

  /**
   * Facade: Tarixni formatlab ko'rsatish.
   */
  public getHistory(): NotificationRecord[] {
    return this.history.getHistory();
  }

  public printHistory(): void {
    const list = this.getHistory();
    console.log(`\n========= Bildirishnomalar tarixi (${list.length} ta) =========`);
    if (list.length === 0) {
      console.log("Hozircha yuborilgan xabarlar yo'q.");
      return;
    }

    for (const r of list) {
      const dateStr = r.timestamp.toLocaleString("uz-UZ");
      const statusIcon = r.success ? "✅" : "❌";
      console.log(
        `#${r.id} [${dateStr}] [${r.channel.toUpperCase()}] [${r.type.toUpperCase()}] ${statusIcon}`
      );
      console.log(`   Qabul qiluvchi: ${r.recipientName} (${r.recipientContact})`);
      console.log(`   Xabar: ${r.text}`);
      console.log("-----------------------------------------------------------------");
    }
  }

  /**
   * Facade: Statistikani ko'rsatish.
   */
  public getStats(): NotificationStats {
    return this.history.getStats();
  }

  public printStats(): void {
    const stats = this.getStats();
    console.log(`\n========= Statistika =========`);
    console.log(`Jami yuborilgan: ${stats.totalSent}`);
    console.log(
      `  console: ${stats.byChannel["console"] || 0} | file: ${stats.byChannel["file"] || 0} | telegram: ${stats.byChannel["telegram"] || 0} | sms: ${stats.byChannel["sms"] || 0}`
    );
    console.log(
      `  alert: ${stats.byType["alert"] || 0} | reminder: ${stats.byType["reminder"] || 0} | promo: ${stats.byType["promo"] || 0}`
    );
    console.log(`  Xatolar: ${stats.failures}`);
    console.log(`==============================\n`);
  }

  /**
   * Prototype shablonlar ro'yxatini olish.
   */
  public getTemplates(): BroadcastTemplate[] {
    return this.templateRegistry.getAll();
  }

  public getTemplateRegistry(): TemplateRegistry {
    return this.templateRegistry;
  }
}
