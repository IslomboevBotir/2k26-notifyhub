/**
 * @file types/index.ts
 * @description NotifyHub tizimida ishlatiladigan barcha umumiy turlar, enumlar va interfeyslar.
 */

import type { IRecipient } from '../recipients/recipient.interface.ts';

/**
 * Bildirishnoma turlari (Bridge abstraksiyasi bo'yicha)
 */
export type NotificationType = 'alert' | 'reminder' | 'promo';

/**
 * Bildirishnoma yuborish kanallari (Bridge realizatsiyasi bo'yicha)
 */
export type ChannelType = 'console' | 'file' | 'telegram' | 'sms';

/**
 * Qo'llab-quvvatlanadigan tillar (Abstract Factory bo'yicha)
 */
export type LocaleType = 'uz' | 'ru' | 'en';

/**
 * Xabarga qo'llanishi mumkin bo'lgan qo'shimcha ishlovchilar (Decorator bo'yicha)
 */
export type DecoratorType = 'timestamp' | 'signature' | 'encrypt' | 'urgent';

/**
 * Legacy SMS shlyuzi uchun ustuvorlik kodlari
 * Alert -> 1, Reminder -> 2, Promo -> 3
 */
export enum SmsPriorityCode {
  ALERT = 1,
  REMINDER = 2,
  PROMO = 3,
}

/**
 * Bildirishnoma tarixi yozuvi
 */
export interface IHistoryRecord {
  id: string;
  timestamp: Date;
  notificationType: NotificationType;
  channel: ChannelType;
  recipientName: string;
  recipientContact: string;
  originalText: string;
  renderedText: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Tizim statistikasi ma'lumotlari
 */
export interface INotificationStats {
  totalSent: number;
  successful: number;
  failed: number;
  byChannel: Record<ChannelType, number>;
  byType: Record<NotificationType, number>;
}

/**
 * Bildirishnoma yuborish so'rovi parametrlari
 */
export interface ISendNotificationParams {
  type: NotificationType;
  locale: LocaleType;
  channel: ChannelType;
  recipient: IRecipient;
  text: string;
  decorators?: DecoratorType[];
}
