import type { User } from "../recipients/recipients.js";
import type { ChannelType, NotificationType } from "../types.js";
import type { Channel } from "./base.js";

/**
 * PATTERN: Bridge (Ko'prik) — Concrete Implementation (TelegramChannel)
 * Nima uchun ishlatilgan:
 *   Telegram orqali xabar yuborishni imitatsiya qiladi. Haqiqiy tarmoq so'rovlari
 *   o'rniga foydalanuvchining Telegram username'i bilan konsolga chiqaradi.
 */
export class TelegramChannel implements Channel {
  public readonly name: ChannelType = "telegram";

  public send(recipient: User, text: string, _notificationType: NotificationType): boolean {
    const handle = recipient.telegramHandle?.trim();
    if (!handle || !handle.startsWith("@")) {
      console.log(`[TELEGRAM XATO → ${recipient.name}] Telegram username mavjud emas.`);
      return false;
    }

    console.log(`[TELEGRAM → ${handle}] ${text}`);
    return true;
  }
}
