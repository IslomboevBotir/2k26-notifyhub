/**
 * @file core/hub.facade.ts
 * @pattern Facade Pattern
 */

import { RecipientRegistry } from '../recipients/recipient-registry.ts';
import { NotificationHistory } from './history.singleton.ts';
import { NotificationBuilder } from './notification.builder.ts';
import { CampaignTemplate } from '../prototypes/campaign-template.prototype.ts';
import type { ISendResult } from '../notifications/notification.base.ts';
import type { ISendNotificationParams } from '../types/index.ts';
import type { IRecipient } from '../recipients/recipient.interface.ts';

export class NotifyHub {
  private readonly recipientRegistry: RecipientRegistry;
  private readonly history: NotificationHistory;
  private readonly templatePrototypes: Map<string, CampaignTemplate> = new Map();

  constructor() {
    this.recipientRegistry = new RecipientRegistry();
    this.history = NotificationHistory.getInstance();
    this.seedDefaultPrototypes();
  }

  private seedDefaultPrototypes(): void {
    const defaultGroup = this.recipientRegistry.find('3-kurs');

    const weeklyReminder = new CampaignTemplate({
      id: 'weekly-reminder',
      name: 'Haftalik eslatma',
      type: 'reminder',
      locale: 'uz',
      channelType: 'sms',
      text: 'Ertaga haftalik oraliq nazorat soat 9:00 da',
      decorators: ['timestamp', 'signature'],
      recipient: defaultGroup,
    });

    const securityAlert = new CampaignTemplate({
      id: 'security-alert',
      name: 'Xavfsizlik ogohlantirishi',
      type: 'alert',
      locale: 'uz',
      channelType: 'telegram',
      text: 'Tizimda shubhali faollik aniqlandi. Parolingizni yangilang!',
      decorators: ['urgent', 'timestamp'],
      recipient: defaultGroup,
    });

    const holidayPromo = new CampaignTemplate({
      id: 'holiday-promo',
      name: 'Bayram aksiyasi',
      type: 'promo',
      locale: 'uz',
      channelType: 'console',
      text: 'Barcha ta\'lim kurslariga 50% bayram chegirmasi!',
      decorators: ['signature'],
      recipient: defaultGroup,
    });

    this.templatePrototypes.set(weeklyReminder.id, weeklyReminder);
    this.templatePrototypes.set(securityAlert.id, securityAlert);
    this.templatePrototypes.set(holidayPromo.id, holidayPromo);
  }

  public send(params: ISendNotificationParams): ISendResult {
    const builder = this.builder()
      .setType(params.type)
      .setLocale(params.locale)
      .setChannel(params.channel)
      .setTo(params.recipient)
      .setText(params.text);

    if (params.decorators && params.decorators.length > 0) {
      builder.setDecorators(params.decorators);
    }

    return builder.send();
  }

  public builder(): NotificationBuilder {
    return new NotificationBuilder();
  }

  public getRecipients(): RecipientRegistry {
    return this.recipientRegistry;
  }

  public showHistory(): void {
    this.history.printHistory();
  }

  public showStats(): void {
    this.history.printStatistics();
  }

  public getTemplates(): CampaignTemplate[] {
    return Array.from(this.templatePrototypes.values());
  }

  public getTemplate(id: string): CampaignTemplate | undefined {
    return this.templatePrototypes.get(id);
  }

  public cloneAndSendTemplate(
    templateId: string,
    overrides?: {
      newText?: string;
      newRecipient?: IRecipient;
    }
  ): ISendResult {
    const original = this.getTemplate(templateId);
    if (!original) {
      throw new Error(`Shablon topilmadi: ${templateId}`);
    }

    const cloned = original.clone();

    if (overrides?.newText) {
      cloned.setText(overrides.newText);
    }

    if (overrides?.newRecipient) {
      cloned.setRecipient(overrides.newRecipient);
    }

    return cloned.send();
  }

  public registerTemplate(template: CampaignTemplate): void {
    this.templatePrototypes.set(template.id, template);
  }
}
