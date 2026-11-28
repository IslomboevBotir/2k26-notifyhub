/**
 * @file core/history.ts
 *
 * PATTERN: Singleton (Yaratuvchi / Creational) - 5-majburiy pattern
 *
 * MAQSAD:
 * Butun dastur davomida yuborilgan barcha bildirishnomalar tarixi va statistikasini
 * yagona markazda to'plash.
 * `NotificationHistory` butun ilova uchun faqat bitta instansiyaga ega bo'ladi (`getInstance()`).
 *
 * Vazifalari:
 * 1. Barcha yuborilgan xabarlarni (`NotificationRecord`) saqlash;
 * 2. Tarixni ko'rsatish (`getHistory()`);
 * 3. Statistikani hisoblash (`getStats()`):
 *    - Jami yuborilgan;
 *    - Har bir kanal bo'yicha (console, file, telegram, sms);
 *    - Har bir tur bo'yicha (alert, reminder, promo);
 *    - Xatoliklar soni.
 */

export interface NotificationRecord {
  id: number;
  timestamp: Date;
  recipientName: string;
  recipientContact: string;
  channel: string;
  type: string;
  text: string;
  success: boolean;
}

export interface NotificationStats {
  totalSent: number;
  byChannel: Record<string, number>;
  byType: Record<string, number>;
  failures: number;
}

export class NotificationHistory {
  private static instance: NotificationHistory | null = null;
  private readonly records: NotificationRecord[] = [];
  private nextId: number = 1;

  /**
   * Singleton pattern talabiga ko'ra konstruktor private bo'ladi.
   */
  private constructor() {}

  /**
   * Yagona global instansiyani olish.
   */
  public static getInstance(): NotificationHistory {
    if (!NotificationHistory.instance) {
      NotificationHistory.instance = new NotificationHistory();
    }
    return NotificationHistory.instance;
  }

  /**
   * Yangi yuborilgan bildirishnoma yozuvini qo'shish.
   */
  public log(entry: {
    recipientName: string;
    recipientContact: string;
    channel: string;
    type: string;
    text: string;
    success: boolean;
    timestamp?: Date;
  }): NotificationRecord {
    const record: NotificationRecord = {
      id: this.nextId++,
      timestamp: entry.timestamp || new Date(),
      recipientName: entry.recipientName,
      recipientContact: entry.recipientContact,
      channel: entry.channel,
      type: entry.type,
      text: entry.text,
      success: entry.success,
    };
    this.records.push(record);
    return record;
  }

  /**
   * Barcha saqlangan bildirishnomalar tarixini olish.
   */
  public getHistory(): NotificationRecord[] {
    return [...this.records];
  }

  /**
   * Kanal va tur bo'yicha statistikani hisoblash.
   */
  public getStats(): NotificationStats {
    const byChannel: Record<string, number> = {
      console: 0,
      file: 0,
      telegram: 0,
      sms: 0,
    };

    const byType: Record<string, number> = {
      alert: 0,
      reminder: 0,
      promo: 0,
    };

    let failures = 0;

    for (const record of this.records) {
      // Kanallar bo'yicha hisob
      byChannel[record.channel] = (byChannel[record.channel] || 0) + 1;
      // Turlar bo'yicha hisob
      byType[record.type] = (byType[record.type] || 0) + 1;
      // Xatoliklar
      if (!record.success) {
        failures++;
      }
    }

    return {
      totalSent: this.records.length,
      byChannel,
      byType,
      failures,
    };
  }

  /**
   * Testlar va tozalash uchun yordamchi metod.
   */
  public clear(): void {
    this.records.length = 0;
    this.nextId = 1;
  }
}
