import type { ChannelType, DeliveryRecord, LocaleCode, NotificationType } from "../types.js";

export interface HistoryStats {
  total: number;
  succeeded: number;
  failed: number;
  byChannel: Record<ChannelType, number>;
  byType: Record<NotificationType, number>;
}

/**
 * PATTERN: Singleton (Yagona nusxa)
 * Nima uchun ishlatilgan:
 *   Butun dastur davomida barcha yuborilgan xabarlar tarixi va statistikasini
 *   saqlovchi yagona markaziy obyekt (NotificationHistory.getInstance()).
 *   Konstruktor private qilingan, shuning uchun tasodifiy ikkinchi nusxa yaratilmaydi.
 */
export class NotificationHistory {
  private static instance: NotificationHistory | null = null;
  private records: DeliveryRecord[] = [];
  private nextId = 1;

  private constructor() {}

  public static getInstance(): NotificationHistory {
    if (NotificationHistory.instance === null) {
      NotificationHistory.instance = new NotificationHistory();
    }
    return NotificationHistory.instance;
  }

  public record(entry: Omit<DeliveryRecord, "id">): DeliveryRecord {
    const saved: DeliveryRecord = {
      id: this.nextId++,
      ...entry,
    };
    this.records.push(saved);
    return saved;
  }

  public getRecords(): readonly DeliveryRecord[] {
    return [...this.records];
  }

  public clear(): void {
    this.records = [];
    this.nextId = 1;
  }

  public getStats(): HistoryStats {
    const byChannel: Record<ChannelType, number> = {
      console: 0,
      file: 0,
      telegram: 0,
      sms: 0,
    };
    const byType: Record<NotificationType, number> = {
      alert: 0,
      reminder: 0,
      promo: 0,
    };

    let succeeded = 0;
    let failed = 0;

    for (const rec of this.records) {
      byChannel[rec.channel] += 1;
      byType[rec.type] += 1;
      if (rec.success) {
        succeeded += 1;
      } else {
        failed += 1;
      }
    }

    return {
      total: this.records.length,
      succeeded,
      failed,
      byChannel,
      byType,
    };
  }

  public formatHistory(): string {
    if (this.records.length === 0) {
      return "Tarix bo'sh. Hali bildirishnoma yuborilmagan.";
    }

    return this.records
      .map((rec) => {
        const status = rec.success ? "✅" : "❌";
        const time = rec.timestamp.toLocaleString("uz-UZ", { hour12: false });
        return `#${rec.id} ${status} [${time}] [${rec.type}/${rec.locale}/${rec.channel}] → ${rec.recipientName} (${rec.recipientContact}): ${rec.message}`;
      })
      .join("\n");
  }

  public formatStats(): string {
    const stats = this.getStats();
    return [
      `Jami yuborilgan: ${stats.total}`,
      `  console: ${stats.byChannel.console} | file: ${stats.byChannel.file} | telegram: ${stats.byChannel.telegram} | sms: ${stats.byChannel.sms}`,
      `  alert: ${stats.byType.alert} | reminder: ${stats.byType.reminder} | promo: ${stats.byType.promo}`,
      `  Muvaffaqiyatli: ${stats.succeeded} | Xatolar: ${stats.failed}`,
    ].join("\n");
  }
}
