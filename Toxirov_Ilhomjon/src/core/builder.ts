import type { Channel } from "../channels/channel.ts";
import {
  ConsoleChannel,
  FileChannel,
  TelegramChannel,
} from "../channels/channel.ts";
import { SmsChannelAdapter } from "../channels/sms-adapter.ts";
import type { MessageDecoratorType } from "../decorators/message.ts";
import {
  createLocaleFactory,
  createTemplate,
} from "../locales/templates.ts";
import type { Locale } from "../locales/templates.ts";
import type { NotificationType } from "../notifications/base.ts";
import { AlertNotification, ReminderNotification, PromoNotification } from "../notifications/types.ts";
import type { Notification } from "../notifications/base.ts";
import type { Recipient } from "../recipients/recipients.ts";

export type ChannelName = "console" | "file" | "telegram" | "sms";

export interface BroadcastRequest {
  readonly notification: Notification;
  readonly recipient: Recipient;
  readonly text: string;
  readonly decorators: MessageDecoratorType[];
}

// Builder: menyudan kelgan parametrlarni bir joyda yig'ib, tayyor tarqatma yaratadi.
export class NotificationBuilder {
  private notificationType?: NotificationType;
  private locale?: Locale;
  private channelName?: ChannelName;
  private recipient?: Recipient;
  private text?: string;
  private decorators: MessageDecoratorType[] = [];

  type(type: NotificationType): this {
    this.notificationType = type;
    return this;
  }

  language(locale: Locale): this {
    this.locale = locale;
    return this;
  }

  channel(name: ChannelName): this {
    this.channelName = name;
    return this;
  }

  to(recipient: Recipient): this {
    this.recipient = recipient;
    return this;
  }

  message(text: string): this {
    this.text = text;
    return this;
  }

  withDecorators(decorators: MessageDecoratorType[]): this {
    this.decorators = [...decorators];
    return this;
  }

  build(): BroadcastRequest {
    const type = this.notificationType;
    const locale = this.locale;
    const channelName = this.channelName;
    const recipient = this.recipient;
    const text = this.text?.trim();

    if (!type || !locale || !channelName || !recipient || !text) {
      throw new Error("Tarqatma uchun tur, til, kanal, qabul qiluvchi va matn kerak.");
    }

    const channel = createChannel(channelName);
    const factory = createLocaleFactory(locale);
    const template = createTemplate(factory, type);
    const notification = createNotification(type, channel, template);

    return { notification, recipient, text, decorators: this.decorators };
  }
}

function createChannel(name: ChannelName): Channel {
  switch (name) {
    case "console":
      return new ConsoleChannel();
    case "file":
      return new FileChannel();
    case "telegram":
      return new TelegramChannel();
    case "sms":
      return new SmsChannelAdapter();
  }
}

function createNotification(
  type: NotificationType,
  channel: Channel,
  template: ReturnType<typeof createTemplate>,
): Notification {
  switch (type) {
    case "alert":
      return new AlertNotification(channel, template);
    case "reminder":
      return new ReminderNotification(channel, template);
    case "promo":
      return new PromoNotification(channel, template);
  }
}
