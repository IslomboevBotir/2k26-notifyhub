import type { Recipient } from "../recipients/recipients.js";
import type { ChannelType, NotificationType } from "../types.js";

/**
 * PATTERN: Bridge (Ko'prik) — Realizatsiya (Implementation) interfeysi
 * Nima uchun ishlatilgan:
 *   Notification (abstraksiya) va Channel (realizatsiya) iyerarxiyalarini
 *   bir-biridan ajratadi. Yangi kanal qo'shilganda bildirishnoma klasslarini
 *   o'zgartirish shart emas.
 */
export interface Channel {
  readonly name: ChannelType;
  send(recipient: Recipient, text: string, notificationType: NotificationType): boolean;
}
