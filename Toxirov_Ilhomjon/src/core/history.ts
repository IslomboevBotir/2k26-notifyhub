import type { NotificationType } from "../notifications/base.ts";

export interface HistoryEntry {
  readonly date: Date;
  readonly recipient: string;
  readonly message: string;
  readonly type: NotificationType;
  readonly channel: string;
  readonly success: boolean;
}

// Singleton: butun dastur bitta tarix obyektiga yozadi va undan statistika oladi.
export class NotificationHistory {
  private static instance: NotificationHistory | undefined;
  private readonly entries: HistoryEntry[] = [];

  private constructor() {}

  static getInstance(): NotificationHistory {
    NotificationHistory.instance ??= new NotificationHistory();
    return NotificationHistory.instance;
  }

  add(entry: HistoryEntry): void {
    this.entries.push(entry);
  }

  getAll(): readonly HistoryEntry[] {
    return this.entries;
  }

  getStats(): {
    total: number;
    succeeded: number;
    failed: number;
    byChannel: Record<string, number>;
    byType: Record<NotificationType, number>;
  } {
    const stats = {
      total: this.entries.length,
      succeeded: 0,
      failed: 0,
      byChannel: {} as Record<string, number>,
      byType: { alert: 0, reminder: 0, promo: 0 },
    };

    for (const entry of this.entries) {
      if (entry.success) {
        stats.succeeded += 1;
        stats.byChannel[entry.channel] =
          (stats.byChannel[entry.channel] ?? 0) + 1;
        stats.byType[entry.type] += 1;
      } else {
        stats.failed += 1;
      }
    }

    return stats;
  }
}
