import type { BroadcastRequest } from "./builder.ts";
import { NotificationHistory } from "./history.ts";

export interface SendResult {
  readonly recipient: string;
  readonly success: boolean;
}

// Facade: konsol dasturi Builder, kanallar va tarixni bevosita boshqarmaydi.
export class NotifyHub {
  private readonly history: NotificationHistory;

  constructor(history = NotificationHistory.getInstance()) {
    this.history = history;
  }

  send(request: BroadcastRequest): SendResult[] {
    const results: SendResult[] = [];
    const message = request.notification.renderMessage(
      request.text,
      request.decorators,
    );

    for (const user of request.recipient.getUsers()) {
      let success = false;

      try {
        success = request.notification.send(user, message);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        console.error(`Yuborishda xato (${user.name}): ${detail}`);
      }

      this.history.add({
        date: new Date(),
        recipient: user.name,
        message,
        type: request.notification.type,
        channel: request.notification.channelName,
        success,
      });
      results.push({ recipient: user.name, success });
    }

    return results;
  }

  showHistory(): void {
    const entries = this.history.getAll();
    if (entries.length === 0) {
      console.log("Tarix hozircha bo'sh.");
      return;
    }

    console.log("\n--- Xabarlar tarixi ---");
    for (const entry of entries) {
      const status = entry.success ? "✅" : "❌";
      console.log(
        `${status} ${entry.date.toLocaleString("uz-UZ")} | ${entry.type} | ${entry.channel} | ${entry.recipient} | ${entry.message}`,
      );
    }
  }

  showStats(): void {
    const stats = this.history.getStats();
    console.log(`\nJami urinishlar: ${stats.total}`);
    console.log(`Muvaffaqiyatli: ${stats.succeeded} | Xatolar: ${stats.failed}`);
    console.log(
      `  Kanallar (muvaffaqiyatli): ${formatCounts(stats.byChannel) || "hali yo'q"}`,
    );
    console.log(`  Turlar (muvaffaqiyatli): ${formatCounts(stats.byType)}`);
  }
}

function formatCounts(counts: Record<string, number>): string {
  return Object.entries(counts)
    .map(([name, count]) => `${name}: ${count}`)
    .join(" | ");
}
