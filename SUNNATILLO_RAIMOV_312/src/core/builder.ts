/**
 * @file core/builder.ts
 *
 * PATTERN: Builder (Yaratuvchi / Creational) - Bonus Pattern (+1 ball)
 *
 * MAQSAD:
 * Murakkab bildirishnoma obyektini qadamma-qadam (bosqichma-bosqich) qurish.
 * Konstruktorga o'nlab parametrlarni uzatish o'rniga, tushunarli zanjirsimon
 * metodlar (fluent interface / method chaining) orqali parametrlar sozlanadi:
 *
 * Misol:
 * new NotificationBuilder()
 *   .setType("alert")
 *   .setLocale("uz")
 *   .setChannel("sms")
 *   .setTo(group)
 *   .setText("Server ishlamayapti")
 *   .withTimestamp()
 *   .withSignature()
 *   .build();
 */

import { Channel } from "../channels/base.js";
import { ChannelFactory } from "../channels/factory.js";
import { Notification } from "../notifications/base.js";
import { createNotification } from "../notifications/types.js";
import { getLocaleFactory } from "../locales/factories.js";
import {
  MessageComponent,
  TextMessage,
  TimestampDecorator,
  SignatureDecorator,
  EncryptDecorator,
  UrgentDecorator,
} from "../decorators/message-decorators.js";
import { Recipient } from "../recipients/recipients.js";

export interface SendResult {
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  finalMessage: string;
}

export class NotificationBuilder {
  private notificationType: string = "reminder";
  private localeCode: string = "uz";
  private channelInstance?: Channel;
  private channelName: string = "console";
  private recipient?: Recipient;
  private rawText: string = "";

  // Decorator sozlamalari
  private hasTimestamp: boolean = false;
  private customDate?: Date;
  private hasSignature: boolean = false;
  private customSignature?: string;
  private hasEncrypt: boolean = false;
  private hasUrgent: boolean = false;

  public setType(type: "alert" | "reminder" | "promo" | string): this {
    this.notificationType = type;
    return this;
  }

  public setLocale(locale: "uz" | "ru" | "en" | string): this {
    this.localeCode = locale;
    return this;
  }

  public setChannel(channel: Channel | string): this {
    if (typeof channel === "string") {
      this.channelName = channel;
      this.channelInstance = ChannelFactory.create(channel);
    } else {
      this.channelInstance = channel;
      this.channelName = channel.name;
    }
    return this;
  }

  public setTo(recipient: Recipient): this {
    this.recipient = recipient;
    return this;
  }

  public setText(text: string): this {
    this.rawText = text;
    return this;
  }

  public withTimestamp(date?: Date): this {
    this.hasTimestamp = true;
    this.customDate = date;
    return this;
  }

  public withSignature(signature?: string): this {
    this.hasSignature = true;
    this.customSignature = signature;
    return this;
  }

  public withEncrypt(): this {
    this.hasEncrypt = true;
    return this;
  }

  public withUrgent(): this {
    this.hasUrgent = true;
    return this;
  }

  /**
   * Abstract Factory orqali til shablonini olib, matnni formatlaydi.
   */
  private renderLocalizedText(): string {
    const factory = getLocaleFactory(this.localeCode);
    let template;

    switch (this.notificationType.toLowerCase()) {
      case "alert":
        template = factory.createAlertTemplate();
        break;
      case "reminder":
        template = factory.createReminderTemplate();
        break;
      case "promo":
        template = factory.createPromoTemplate();
        break;
      default:
        template = factory.createReminderTemplate();
        break;
    }

    return template.render(this.rawText);
  }

  /**
   * Decorator pattern yordamida formatlangan matn ustiga o'ramlarni qo'shadi.
   */
  public buildDecoratedMessage(): string {
    const localized = this.renderLocalizedText();
    let message: MessageComponent = new TextMessage(localized);

    if (this.hasUrgent) {
      message = new UrgentDecorator(message);
    }
    if (this.hasTimestamp) {
      message = new TimestampDecorator(message, this.customDate);
    }
    if (this.hasSignature) {
      message = new SignatureDecorator(message, this.customSignature);
    }
    if (this.hasEncrypt) {
      message = new EncryptDecorator(message);
    }

    return message.getText();
  }

  /**
   * Bildirishnoma obyektini (Bridge abstraction) va yakuniy xabarni quradi.
   */
  public build(): {
    notification: Notification;
    recipient: Recipient;
    finalText: string;
    channel: Channel;
  } {
    if (!this.recipient) {
      throw new Error("Qabul qiluvchi (Recipient) belgilanmagan! setTo(...) chaqiring.");
    }

    const channel = this.channelInstance || ChannelFactory.create(this.channelName);
    const notification = createNotification(this.notificationType, channel);
    const finalText = this.buildDecoratedMessage();

    return {
      notification,
      recipient: this.recipient,
      finalText,
      channel,
    };
  }
}
