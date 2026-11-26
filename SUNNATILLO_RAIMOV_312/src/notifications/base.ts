/**
 * @file notifications/base.ts
 *
 * PATTERN: Bridge (Tuzilmaviy / Structural) - 1-majburiy pattern (Abstraksiya)
 *
 * MAQSAD:
 * Bildirishnoma turi (Abstraksiya) va uni yetkazish usulini (Kanal - Realizatsiya)
 * ikki mustaqil ierarxiyaga ajratish.
 *
 * Notification (abstraksiya) o'zida Channel (realizatsiya) ga havolani saqlaydi.
 * Har qanday bildirishnoma (Alert, Reminder, Promo) istalgan kanal (Console, File, Telegram, SMS)
 * orqali yuborilishi mumkin.
 *
 * Talab: Yangi kanal qo'shilganda bildirishnoma klasslariga hech qanday o'zgartirish kiritilmaydi!
 */

import { Channel } from "../channels/base.js";

export abstract class Notification {
  /**
   * @param channel Bridge realizatori - xabarni yetkazuvchi kanal
   */
  constructor(protected channel: Channel) {}

  /** Bildirishnoma turi ("alert", "reminder", "promo") */
  public abstract readonly type: string;

  /** Muhimlik darajasi (1 = Alert, 2 = Reminder, 3 = Promo) */
  public abstract readonly priorityCode: number;

  /**
   * Bildirishnomani kanal orqali jo'natish.
   * Kanalning `send` metodini o'ziga xos `priorityCode` bilan chaqiradi.
   */
  public send(recipient: string, text: string): boolean {
    return this.channel.send(recipient, text, this.priorityCode);
  }

  public getChannel(): Channel {
    return this.channel;
  }

  public setChannel(channel: Channel): void {
    this.channel = channel;
  }
}
