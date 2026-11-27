import type { Channel } from "../channels/base.js";
import { NotificationHistory } from "../core/history.js";
import {
  applyDecorators,
  PlainMessage,
  type MessageComponent,
} from "../decorators/message_decorators.js";
import type { LocaleFactory, MessageTemplate } from "../locales/factories.js";
import type { Recipient } from "../recipients/recipients.js";
import type {
  DecoratorKind,
  DeliveryRecord,
  NotificationType,
} from "../types.js";

export interface DecoratorOptions {
  date?: Date;
  signature?: string;
  encryptMode?: "base64" | "caesar";
}

/**
 * PATTERN: Bridge (Ko'prik) — Abstraksiya (Abstraction)
 * Nima uchun ishlatilgan:
 *   Bildirishnoma turi (Alert, Reminder, Promo) va yuborish kanali (Channel)
 *   mustaqil rivojlanadi. Notification ichida channel havolasi saqlanadi va
 *   yetkazish vazifasi channel.send() ga delegatsiya qilinadi.
 */
export abstract class Notification {
  public abstract readonly type: NotificationType;
  protected readonly channel: Channel;

  constructor(channel: Channel) {
    this.channel = channel;
  }

  /**
   * Har bir bildirishnoma turi berilgan LocaleFactory dan o'ziga mos shablonni oladi.
   */
  protected abstract selectTemplate(factory: LocaleFactory): MessageTemplate;

  public formatMessage(
    rawText: string,
    localeFactory: LocaleFactory,
    decorators: readonly DecoratorKind[] = [],
    options?: DecoratorOptions
  ): string {
    const template = this.selectTemplate(localeFactory);
    const localized = template.render(rawText);
    const base: MessageComponent = new PlainMessage(localized);
    const decorated = applyDecorators(base, decorators, options);
    return decorated.getText();
  }

  public send(
    recipient: Recipient,
    rawText: string,
    localeFactory: LocaleFactory,
    decorators: readonly DecoratorKind[] = [],
    options?: DecoratorOptions
  ): DeliveryRecord {
    const renderedMessage = this.formatMessage(rawText, localeFactory, decorators, options);
    const sentAt = options?.date ?? new Date();
    const ok = this.channel.send(recipient, renderedMessage, this.type);

    return NotificationHistory.getInstance().record({
      timestamp: sentAt,
      type: this.type,
      locale: localeFactory.locale,
      channel: this.channel.name,
      recipientName: recipient.name,
      recipientContact: this.resolveContact(recipient),
      message: renderedMessage,
      success: ok,
    });
  }

  private resolveContact(recipient: Recipient): string {
    if (this.channel.name === "sms") {
      return recipient.phone;
    }
    if (this.channel.name === "telegram") {
      return recipient.telegramHandle ?? "yo'q";
    }
    return recipient.name;
  }
}
