/**
 * @file locales/uz.factory.ts
 * @pattern Abstract Factory Pattern - Concrete Factory & Concrete Products
 * @description
 * O'zbek tili uchun shablonlar oilasi va fabrikasi.
 *
 * Talablar va namunalar:
 * - Alert: UzFactory().create_alert_template().render("Server ishlamayapti") -> "⚠️ DIQQAT: Server ishlamayapti"
 * - Reminder: "Eslatma: Ertaga imtihon soat 9:00 da"
 * - Promo: "🎉 Aksiya: Yangi kurslarimizga chegirma"
 */

import type { IAlertTemplate, IReminderTemplate, IPromoTemplate } from './template.interface.ts';
import type { ILocaleFactory } from './locale-factory.interface.ts';
import type { LocaleType } from '../types/index.ts';

export class UzAlertTemplate implements IAlertTemplate {
  public readonly templateType = 'alert' as const;
  public getLocale(): string {
    return 'uz';
  }
  public render(content: string): string {
    return `⚠️ DIQQAT: ${content}`;
  }
}

export class UzReminderTemplate implements IReminderTemplate {
  public readonly templateType = 'reminder' as const;
  public getLocale(): string {
    return 'uz';
  }
  public render(content: string): string {
    return `Eslatma: ${content}`;
  }
}

export class UzPromoTemplate implements IPromoTemplate {
  public readonly templateType = 'promo' as const;
  public getLocale(): string {
    return 'uz';
  }
  public render(content: string): string {
    return `🎉 Aksiya: ${content}`;
  }
}

export class UzLocaleFactory implements ILocaleFactory {
  public readonly locale: LocaleType = 'uz';

  public createAlertTemplate(): IAlertTemplate {
    return new UzAlertTemplate();
  }

  public createReminderTemplate(): IReminderTemplate {
    return new UzReminderTemplate();
  }

  public createPromoTemplate(): IPromoTemplate {
    return new UzPromoTemplate();
  }
}
