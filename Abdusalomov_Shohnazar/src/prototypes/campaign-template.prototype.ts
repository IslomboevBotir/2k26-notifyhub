/**
 * @file prototypes/campaign-template.prototype.ts
 * @pattern Prototype Pattern
 */

import type { ChannelType, DecoratorType, LocaleType, NotificationType } from '../types/index.ts';
import type { IRecipient } from '../recipients/recipient.interface.ts';
import { NotificationBuilder } from '../core/notification.builder.ts';
import type { ISendResult } from '../notifications/notification.base.ts';

export interface IPrototype<T> {
  clone(): T;
}

export class CampaignTemplate implements IPrototype<CampaignTemplate> {
  public id: string;
  public name: string;
  public type: NotificationType;
  public locale: LocaleType;
  public channelType: ChannelType;
  public text: string;
  public decorators: DecoratorType[];
  public recipient?: IRecipient;

  constructor(params: {
    id: string;
    name: string;
    type: NotificationType;
    locale: LocaleType;
    channelType: ChannelType;
    text: string;
    decorators: DecoratorType[];
    recipient?: IRecipient;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
    this.locale = params.locale;
    this.channelType = params.channelType;
    this.text = params.text;
    this.decorators = [...params.decorators];
    this.recipient = params.recipient;
  }

  public clone(): CampaignTemplate {
    return new CampaignTemplate({
      id: `${this.id}-copy-${Date.now()}`,
      name: `${this.name} (Nusxa)`,
      type: this.type,
      locale: this.locale,
      channelType: this.channelType,
      text: this.text,
      decorators: [...this.decorators],
      recipient: this.recipient,
    });
  }

  public setText(text: string): this {
    this.text = text;
    return this;
  }

  public setRecipient(recipient: IRecipient): this {
    this.recipient = recipient;
    return this;
  }

  public setChannelType(channelType: ChannelType): this {
    this.channelType = channelType;
    return this;
  }

  public toBuilder(): NotificationBuilder {
    const builder = new NotificationBuilder()
      .setType(this.type)
      .setLocale(this.locale)
      .setChannel(this.channelType)
      .setText(this.text)
      .setDecorators(this.decorators);

    if (this.recipient) {
      builder.setTo(this.recipient);
    }

    return builder;
  }

  public send(recipient?: IRecipient): ISendResult {
    const targetRecipient = recipient ?? this.recipient;
    if (!targetRecipient) {
      throw new Error(`Shablon yuborish uchun qabul qiluvchi ko'rsatilmadi!`);
    }

    return this.toBuilder().setTo(targetRecipient).send();
  }
}
