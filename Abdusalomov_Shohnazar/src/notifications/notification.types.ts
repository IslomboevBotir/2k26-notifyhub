/**
 * @file notifications/notification.types.ts
 * @pattern Bridge Pattern - Refined Abstractions
 */

import { Notification } from './notification.base.ts';
import type { IChannel } from '../channels/channel.interface.ts';
import type { LocaleType, NotificationType } from '../types/index.ts';
import type { INotificationTemplate } from '../locales/template.interface.ts';
import { LocaleProvider } from '../locales/locale-provider.ts';

export class AlertNotification extends Notification {
  public readonly type: NotificationType = 'alert';

  constructor(channel: IChannel) {
    super(channel);
  }

  protected getTemplate(locale: LocaleType): INotificationTemplate {
    const factory = LocaleProvider.getFactory(locale);
    return factory.createAlertTemplate();
  }
}

export class ReminderNotification extends Notification {
  public readonly type: NotificationType = 'reminder';

  constructor(channel: IChannel) {
    super(channel);
  }

  protected getTemplate(locale: LocaleType): INotificationTemplate {
    const factory = LocaleProvider.getFactory(locale);
    return factory.createReminderTemplate();
  }
}

export class PromoNotification extends Notification {
  public readonly type: NotificationType = 'promo';

  constructor(channel: IChannel) {
    super(channel);
  }

  protected getTemplate(locale: LocaleType): INotificationTemplate {
    const factory = LocaleProvider.getFactory(locale);
    return factory.createPromoTemplate();
  }
}
