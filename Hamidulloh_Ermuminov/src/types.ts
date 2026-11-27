/**
 * Asosiy domen turlari (bildirishnoma turlari, tillar, kanallar va dekoratorlar).
 */

export type NotificationType = "alert" | "reminder" | "promo";

export type LocaleCode = "uz" | "ru" | "en";

export type ChannelType = "console" | "file" | "telegram" | "sms";

export type DecoratorKind = "timestamp" | "signature" | "encrypt" | "urgent";

export interface DeliveryRecord {
  id: number;
  timestamp: Date;
  type: NotificationType;
  locale: LocaleCode;
  channel: ChannelType;
  recipientName: string;
  recipientContact: string;
  message: string;
  success: boolean;
}
