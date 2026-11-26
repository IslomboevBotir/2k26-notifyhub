/**
 * @file notifications/types.ts
 *
 * PATTERN: Bridge (Refined Abstractions)
 *
 * MAQSAD:
 * Muayyan bildirishnoma turlari (Ogohlantirish, Eslatma, Reklama).
 * Har bir tur o'zining `type` va `priorityCode` xususiyatlariga ega:
 * - AlertNotification: priorityCode = 1 (Yuqori daraja)
 * - ReminderNotification: priorityCode = 2 (O'rta daraja)
 * - PromoNotification: priorityCode = 3 (Past daraja)
 *
 * Ular kanal turidan butunlay ajratilgan. Masalan:
 * new AlertNotification(new TelegramChannel())
 * new AlertNotification(new SmsChannelAdapter())
 */

import { Channel } from "../channels/base.js";
import { Notification } from "./base.js";

/**
 * Ogohlantirish bildirishnomasi (Alert)
 * Muhimlik darajasi: 1 (Yuqori)
 */
export class AlertNotification extends Notification {
  public readonly type: string = "alert";
  public readonly priorityCode: number = 1;

  constructor(channel: Channel) {
    super(channel);
  }
}

/**
 * Eslatma bildirishnomasi (Reminder)
 * Muhimlik darajasi: 2 (O'rta)
 */
export class ReminderNotification extends Notification {
  public readonly type: string = "reminder";
  public readonly priorityCode: number = 2;

  constructor(channel: Channel) {
    super(channel);
  }
}

/**
 * Reklama bildirishnomasi (Promo)
 * Muhimlik darajasi: 3 (Past)
 */
export class PromoNotification extends Notification {
  public readonly type: string = "promo";
  public readonly priorityCode: number = 3;

  constructor(channel: Channel) {
    super(channel);
  }
}

/**
 * Tur nomi bo'yicha bildirishnoma instansiyasini yaratuvchi yordamchi funksiya.
 */
export function createNotification(type: string, channel: Channel): Notification {
  const normalized = type.trim().toLowerCase();
  switch (normalized) {
    case "alert":
      return new AlertNotification(channel);
    case "reminder":
      return new ReminderNotification(channel);
    case "promo":
      return new PromoNotification(channel);
    default:
      throw new Error(`Noma'lum bildirishnoma turi: '${type}'. Mavjud turlar: alert, reminder, promo`);
  }
}
