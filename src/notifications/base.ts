import type { Channel } from "../channels/base.js";
import { NotificationHistory } from "../core/history.js";
import {
  applyDecorators,
  PlainMessage,
  type MessageComponent,
} from "../decorators/message_decorators.js";
import type { LocaleFactory, MessageTemplate } from "../locales/factories.js";
import type { RecipientComponent, User } from "../recipients/recipients.js";
import type {
  DecoratorKind,
  DeliveryRecord,
  DispatchSummary,
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
    recipient: RecipientComponent,
    rawText: string,
    localeFactory: LocaleFactory,
    decorators: readonly DecoratorKind[] = [],
    options?: DecoratorOptions
  ): DispatchSummary {
    const renderedMessage = this.formatMessage(rawText, localeFactory, decorators, options);
    const users = recipient.getUsers();
    const history = NotificationHistory.getInstance();
    const records: DeliveryRecord[] = [];
    const sentAt = options?.date ?? new Date();

    let succeeded = 0;
    let failed = 0;

    for (const user of users) {
      const ok = this.channel.send(user, renderedMessage, this.type);
      if (ok) {
        succeeded += 1;
      } else {
        failed += 1;
      }

      const contact = this.resolveContact(user);
      const saved = history.record({
        timestamp: sentAt,
        type: this.type,
        locale: localeFactory.locale,
        channel: this.channel.name,
        recipientName: user.name,
        recipientContact: contact,
        message: renderedMessage,
        success: ok,
      });
      records.push(saved);
    }

    return {
      total: users.length,
      succeeded,
      failed,
      renderedMessage,
      records,
    };
  }

  private resolveContact(user: User): string {
    if (this.channel.name === "sms") {
      return user.phone;
    }
    if (this.channel.name === "telegram") {
      return user.telegramHandle ?? "yo'q";
    }
    return user.name;
  }
}
