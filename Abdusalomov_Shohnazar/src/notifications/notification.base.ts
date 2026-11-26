/**
 * @file notifications/notification.base.ts
 * @pattern Bridge Pattern - Abstraction
 */

import type { IChannel } from '../channels/channel.interface.ts';
import type { IRecipient } from '../recipients/recipient.interface.ts';
import type { DecoratorType, LocaleType, NotificationType } from '../types/index.ts';
import type { INotificationTemplate } from '../locales/template.interface.ts';
import type { IMessage } from '../decorators/message.interface.ts';
import { BaseMessage } from '../decorators/base-message.ts';
import { TimestampDecorator } from '../decorators/timestamp.decorator.ts';
import { SignatureDecorator } from '../decorators/signature.decorator.ts';
import { EncryptDecorator } from '../decorators/encrypt.decorator.ts';
import { UrgentDecorator } from '../decorators/urgent.decorator.ts';
import { NotificationHistory } from '../core/history.singleton.ts';

export interface ISendResult {
  total: number;
  sent: number;
  failed: number;
  finalContent: string;
}

export abstract class Notification {
  protected channel: IChannel;

  constructor(channel: IChannel) {
    this.channel = channel;
  }

  public abstract readonly type: NotificationType;
  protected abstract getTemplate(locale: LocaleType): INotificationTemplate;

  public setChannel(channel: IChannel): void {
    this.channel = channel;
  }

  public getChannel(): IChannel {
    return this.channel;
  }

  protected applyDecorators(baseContent: string, decorators: DecoratorType[]): string {
    let message: IMessage = new BaseMessage(baseContent);

    for (const dec of decorators) {
      switch (dec) {
        case 'urgent':
          message = new UrgentDecorator(message);
          break;
        case 'timestamp':
          message = new TimestampDecorator(message);
          break;
        case 'signature':
          message = new SignatureDecorator(message);
          break;
        case 'encrypt':
          message = new EncryptDecorator(message);
          break;
      }
    }

    return message.getContent();
  }

  public send(
    recipient: IRecipient,
    rawText: string,
    locale: LocaleType = 'uz',
    decorators: DecoratorType[] = []
  ): ISendResult {
    const template = this.getTemplate(locale);
    const templatedContent = template.render(rawText);
    const finalContent = this.applyDecorators(templatedContent, decorators);
    const subscribers = recipient.getSubscribers();

    let sent = 0;
    let failed = 0;
    const history = NotificationHistory.getInstance();

    for (const user of subscribers) {
      let isSuccess = false;
      let errorMsg: string | undefined;

      try {
        isSuccess = this.channel.send(user, finalContent, this.type);
      } catch (err) {
        isSuccess = false;
        errorMsg = err instanceof Error ? err.message : String(err);
      }

      if (isSuccess) {
        sent++;
      } else {
        failed++;
      }

      history.record({
        notificationType: this.type,
        channel: this.channel.type,
        recipientName: user.getName(),
        recipientContact: user.getContactInfo(),
        originalText: rawText,
        renderedText: finalContent,
        success: isSuccess,
        errorMessage: errorMsg,
      });
    }

    return {
      total: subscribers.length,
      sent,
      failed,
      finalContent,
    };
  }
}
