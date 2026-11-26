/**
 * @file core/notification.builder.ts
 * @pattern Builder Pattern
 */

import type { ChannelType, DecoratorType, LocaleType, NotificationType } from '../types/index.ts';
import type { IRecipient } from '../recipients/recipient.interface.ts';
import type { IChannel } from '../channels/channel.interface.ts';
import { ChannelFactory } from '../channels/channel.factory.ts';
import type { ISendResult } from '../notifications/notification.base.ts';
import { Notification } from '../notifications/notification.base.ts';
import {
  AlertNotification,
  PromoNotification,
  ReminderNotification,
} from '../notifications/notification.types.ts';

export interface IBuiltNotification {
  notification: Notification;
  recipient: IRecipient;
  text: string;
  locale: LocaleType;
  decorators: DecoratorType[];
  send(): ISendResult;
}

export class NotificationBuilder {
  private notificationType: NotificationType = 'reminder';
  private locale: LocaleType = 'uz';
  private channel: IChannel = ChannelFactory.create('console');
  private recipient?: IRecipient;
  private messageText: string = '';
  private readonly decorators: DecoratorType[] = [];

  public setType(type: NotificationType): this {
    this.notificationType = type;
    return this;
  }

  public type(type: NotificationType): this {
    return this.setType(type);
  }

  public setLocale(locale: LocaleType): this {
    this.locale = locale;
    return this;
  }

  public locale(locale: LocaleType): this {
    return this.setLocale(locale);
  }

  public setChannel(channelOrType: IChannel | ChannelType): this {
    if (typeof channelOrType === 'string') {
      this.channel = ChannelFactory.create(channelOrType);
    } else {
      this.channel = channelOrType;
    }
    return this;
  }

  public channel(channelOrType: IChannel | ChannelType): this {
    return this.setChannel(channelOrType);
  }

  public setTo(recipient: IRecipient): this {
    this.recipient = recipient;
    return this;
  }

  public to(recipient: IRecipient): this {
    return this.setTo(recipient);
  }

  public setText(text: string): this {
    this.messageText = text;
    return this;
  }

  public text(text: string): this {
    return this.setText(text);
  }

  public withTimestamp(): this {
    if (!this.decorators.includes('timestamp')) {
      this.decorators.push('timestamp');
    }
    return this;
  }

  public with_timestamp(): this {
    return this.withTimestamp();
  }

  public withSignature(): this {
    if (!this.decorators.includes('signature')) {
      this.decorators.push('signature');
    }
    return this;
  }

  public with_signature(): this {
    return this.withSignature();
  }

  public withEncryption(): this {
    if (!this.decorators.includes('encrypt')) {
      this.decorators.push('encrypt');
    }
    return this;
  }

  public with_encrypt(): this {
    return this.withEncryption();
  }

  public withUrgent(): this {
    if (!this.decorators.includes('urgent')) {
      this.decorators.push('urgent');
    }
    return this;
  }

  public with_urgent(): this {
    return this.withUrgent();
  }

  public setDecorators(decorators: DecoratorType[]): this {
    this.decorators.length = 0;
    this.decorators.push(...decorators);
    return this;
  }

  public buildNotification(): Notification {
    switch (this.notificationType) {
      case 'alert':
        return new AlertNotification(this.channel);
      case 'reminder':
        return new ReminderNotification(this.channel);
      case 'promo':
        return new PromoNotification(this.channel);
      default:
        return new ReminderNotification(this.channel);
    }
  }

  public build(): IBuiltNotification {
    if (!this.recipient) {
      throw new Error("Builder xatosi: Qabul qiluvchi (recipient) belgilanmadi! .setTo() orqali belgilang.");
    }
    if (!this.messageText) {
      throw new Error("Builder xatosi: Xabar matni bo'sh! .setText() orqali matn kiriting.");
    }

    const notification = this.buildNotification();
    const recipient = this.recipient;
    const text = this.messageText;
    const locale = this.locale;
    const decorators = [...this.decorators];

    return {
      notification,
      recipient,
      text,
      locale,
      decorators,
      send: () => notification.send(recipient, text, locale, decorators),
    };
  }

  public send(): ISendResult {
    return this.build().send();
  }
}
