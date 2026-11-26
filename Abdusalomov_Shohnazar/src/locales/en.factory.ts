/**
 * @file locales/en.factory.ts
 * @pattern Abstract Factory Pattern - Concrete Factory & Concrete Products
 */

import type { IAlertTemplate, IReminderTemplate, IPromoTemplate } from './template.interface.ts';
import type { ILocaleFactory } from './locale-factory.interface.ts';
import type { LocaleType } from '../types/index.ts';

export class EnAlertTemplate implements IAlertTemplate {
  public readonly templateType = 'alert' as const;
  public getLocale(): string {
    return 'en';
  }
  public render(content: string): string {
    return `⚠️ ALERT: ${content}`;
  }
}

export class EnReminderTemplate implements IReminderTemplate {
  public readonly templateType = 'reminder' as const;
  public getLocale(): string {
    return 'en';
  }
  public render(content: string): string {
    return `Reminder: ${content}`;
  }
}

export class EnPromoTemplate implements IPromoTemplate {
  public readonly templateType = 'promo' as const;
  public getLocale(): string {
    return 'en';
  }
  public render(content: string): string {
    return `🎉 Promo: ${content}`;
  }
}

export class EnLocaleFactory implements ILocaleFactory {
  public readonly locale: LocaleType = 'en';

  public createAlertTemplate(): IAlertTemplate {
    return new EnAlertTemplate();
  }

  public createReminderTemplate(): IReminderTemplate {
    return new EnReminderTemplate();
  }

  public createPromoTemplate(): IPromoTemplate {
    return new EnPromoTemplate();
  }
}
