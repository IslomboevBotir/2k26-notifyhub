/**
 * SINGLETON pattern: yuborishlar tarixi va statistikasi.
 *
 * NotificationHistory butun dastur uchun yagona obyekt. Konstruktor yopiq
 * (private), obyektni faqat `NotificationHistory.getInstance()` orqali olish
 * mumkin. Har bir bildirishnoma qayerda yaratilganidan qat'i nazar (menyu,
 * Builder, Prototype shabloni) natijasini aynan shu bitta obyektga yozadi.
 * Shuning uchun tarix va statistika har doim to'liq va izchil bo'ladi.
 */

import type { LocaleCode, NotificationKind } from "./types";

export interface HistoryRecord {
  readonly id: number;
  readonly sentAt: Date;
  readonly kind: NotificationKind;
  readonly channel: string;
  readonly locale: LocaleCode;
  /** Xabar aniq qaysi foydalanuvchiga borgani. */
  readonly recipient: string;
  /** Foydalanuvchi qaysi manzil orqali tanlangani (masalan, "3-kurs" guruhi). */
  readonly target: string;
  readonly text: string;
  readonly success: boolean;
}

export type NewRecord = Omit<HistoryRecord, "id" | "sentAt"> & { sentAt?: Date };

export interface Stats {
  total: number;
  succeeded: number;
  failed: number;
  byChannel: Record<string, number>;
  byKind: Record<string, number>;
  byLocale: Record<string, number>;
  failedByChannel: Record<string, number>;
}

export class NotificationHistory {
  private static instance: NotificationHistory | null = null;

  private records: HistoryRecord[] = [];
  private nextId = 1;

  /** Tashqaridan `new NotificationHistory()` qilib bo'lmaydi. */
  private constructor() {}

  static getInstance(): NotificationHistory {
    if (!NotificationHistory.instance) {
      NotificationHistory.instance = new NotificationHistory();
    }
    return NotificationHistory.instance;
  }

  record(entry: NewRecord): HistoryRecord {
    const record: HistoryRecord = { ...entry, id: this.nextId++, sentAt: entry.sentAt ?? new Date() };
    this.records.push(record);
    return record;
  }

  getRecords(): readonly HistoryRecord[] {
    return this.records;
  }

  get size(): number {
    return this.records.length;
  }

  getStats(): Stats {
    const stats: Stats = {
      total: this.records.length,
      succeeded: 0,
      failed: 0,
      byChannel: {},
      byKind: {},
      byLocale: {},
      failedByChannel: {},
    };
    const inc = (bucket: Record<string, number>, key: string) => {
      bucket[key] = (bucket[key] ?? 0) + 1;
    };
    for (const r of this.records) {
      inc(stats.byChannel, r.channel);
      inc(stats.byKind, r.kind);
      inc(stats.byLocale, r.locale);
      if (r.success) {
        stats.succeeded++;
      } else {
        stats.failed++;
        inc(stats.failedByChannel, r.channel);
      }
    }
    return stats;
  }

  /** Tarixni tozalash (testlarda har bir testni toza holatdan boshlash uchun). */
  clear(): void {
    this.records = [];
    this.nextId = 1;
  }
}
