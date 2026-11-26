/**
 * @file core/history.singleton.ts
 * @pattern Singleton Pattern
 */

import type {
  ChannelType,
  IHistoryRecord,
  INotificationStats,
  NotificationType,
} from '../types/index.ts';

export class NotificationHistory {
  private static instance: NotificationHistory | null = null;
  private readonly records: IHistoryRecord[] = [];

  private constructor() {}

  public static getInstance(): NotificationHistory {
    if (!NotificationHistory.instance) {
      NotificationHistory.instance = new NotificationHistory();
    }
    return NotificationHistory.instance;
  }

  public static resetInstance(): void {
    NotificationHistory.instance = null;
  }

  public record(entry: Omit<IHistoryRecord, 'id' | 'timestamp'>): IHistoryRecord {
    const record: IHistoryRecord = {
      ...entry,
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
    };
    this.records.push(record);
    return record;
  }

  public getHistory(): ReadonlyArray<IHistoryRecord> {
    return [...this.records];
  }

  public get count(): number {
    return this.records.length;
  }

  public clear(): void {
    this.records.length = 0;
  }

  public getStatistics(): INotificationStats {
    const stats: INotificationStats = {
      totalSent: this.records.length,
      successful: 0,
      failed: 0,
      byChannel: {
        console: 0,
        file: 0,
        telegram: 0,
        sms: 0,
      },
      byType: {
        alert: 0,
        reminder: 0,
        promo: 0,
      },
    };

    for (const record of this.records) {
      if (record.success) {
        stats.successful++;
      } else {
        stats.failed++;
      }

      stats.byChannel[record.channel] = (stats.byChannel[record.channel] ?? 0) + 1;
      stats.byType[record.notificationType] = (stats.byType[record.notificationType] ?? 0) + 1;
    }

    return stats;
  }

  /**
   * Topshiriq konsol namunasiga 100% mos formatda statistikani chop etish:
   * Jami yuborilgan: 14
   *   console: 3 | file: 2 | telegram: 5 | sms: 4
   *   alert: 4 | reminder: 7 | promo: 3
   *   Xatolar: 1
   */
  public printStatistics(): void {
    const stats = this.getStatistics();
    console.log(`\nJami yuborilgan: ${stats.totalSent}`);
    console.log(
      `  console: ${stats.byChannel.console} | file: ${stats.byChannel.file} | telegram: ${stats.byChannel.telegram} | sms: ${stats.byChannel.sms}`
    );
    console.log(
      `  alert: ${stats.byType.alert} | reminder: ${stats.byType.reminder} | promo: ${stats.byType.promo}`
    );
    console.log(`  Xatolar: ${stats.failed}\n`);
  }

  public printHistory(): void {
    if (this.records.length === 0) {
      console.log('\n[Tarix bo\'sh] Hozircha hech qanday bildirishnoma yuborilmadi.\n');
      return;
    }

    console.log('\n--- 📜 Bildirishnomalar Tarixi ---');
    this.records.forEach((rec, index) => {
      const statusIcon = rec.success ? '✅' : '❌';
      const timeStr = rec.timestamp.toLocaleTimeString();
      console.log(
        `${index + 1}. [${timeStr}] ${statusIcon} [${rec.notificationType.toUpperCase()}] via [${rec.channel.toUpperCase()}] -> ${rec.recipientName} (${rec.recipientContact})`
      );
      console.log(`   Xabar: "${rec.renderedText}"`);
      if (rec.errorMessage) {
        console.log(`   Xatolik: ${rec.errorMessage}`);
      }
    });
    console.log('----------------------------------\n');
  }
}
