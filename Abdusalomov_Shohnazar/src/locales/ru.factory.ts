/**
 * @file locales/ru.factory.ts
 * @pattern Abstract Factory Pattern - Concrete Factory & Concrete Products
 */

import type { IAlertTemplate, IReminderTemplate, IPromoTemplate } from './template.interface.ts';
import type { ILocaleFactory } from './locale-factory.interface.ts';
import type { LocaleType } from '../types/index.ts';

export class RuAlertTemplate implements IAlertTemplate {
  public readonly templateType = 'alert' as const;
  public getLocale(): string {
    return 'ru';
  }
  public render(content: string): string {
    return `⚠️ ВНИМАНИЕ: ${content}`;
  }
}

export class RuReminderTemplate implements IReminderTemplate {
  public readonly templateType = 'reminder' as const;
  public getLocale(): string {
    return 'ru';
  }
  public render(content: string): string {
    return `Напоминание: ${content}`;
  }
}

export class RuPromoTemplate implements IPromoTemplate {
  public readonly templateType = 'promo' as const;
  public getLocale(): string {
    return 'ru';
  }
  public render(content: string): string {
    return `🎉 Акция: ${content}`;
  }
}

export class RuLocaleFactory implements ILocaleFactory {
  public readonly locale: LocaleType = 'ru';

  public createAlertTemplate(): IAlertTemplate {
    return new RuAlertTemplate();
  }

  public createReminderTemplate(): IReminderTemplate {
    return new RuReminderTemplate();
  }

  public createPromoTemplate(): IPromoTemplate {
    return new RuPromoTemplate();
  }
}
