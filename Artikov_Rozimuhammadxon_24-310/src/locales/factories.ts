/**
 * ABSTRACT FACTORY pattern: tillar bo'yicha shablonlar to'plami.
 *
 * Har bir fabrika BITTA til uchun o'zaro mos obyektlar OILASINI yaratadi:
 * ogohlantirish, eslatma va reklama shablonlari hamda imzo matni.
 *
 *   LocaleFactory
 *   ├── UzFactory → UzAlertTemplate, UzReminderTemplate, UzPromoTemplate
 *   ├── RuFactory → RuAlertTemplate, RuReminderTemplate, RuPromoTemplate
 *   └── EnFactory → EnAlertTemplate, EnReminderTemplate, EnPromoTemplate
 *
 * Bildirishnoma faqat bitta fabrikani oladi va barcha qismlarni (shablon va
 * imzoni) shu fabrikadan so'raydi. Shu sababli bitta xabarda turli tillar
 * aralashib ketishi mumkin emas.
 */

import { LOCALE_CODES, type LocaleCode, type NotificationKind } from "../core/types";

// ---------------------------------------------------------------------------
// Mahsulotlar (Products)
// ---------------------------------------------------------------------------
export interface MessageTemplate {
  readonly locale: LocaleCode;
  readonly kind: NotificationKind;
  render(text: string): string;
}

abstract class PrefixTemplate implements MessageTemplate {
  abstract readonly locale: LocaleCode;
  abstract readonly kind: NotificationKind;
  protected abstract readonly prefix: string;

  render(text: string): string {
    return `${this.prefix}${text.trim()}`;
  }
}

// O'zbek tili oilasi
export class UzAlertTemplate extends PrefixTemplate {
  readonly locale = "uz";
  readonly kind = "alert";
  protected readonly prefix = "⚠️ DIQQAT: ";
}
export class UzReminderTemplate extends PrefixTemplate {
  readonly locale = "uz";
  readonly kind = "reminder";
  protected readonly prefix = "Eslatma: ";
}
export class UzPromoTemplate extends PrefixTemplate {
  readonly locale = "uz";
  readonly kind = "promo";
  protected readonly prefix = "🎁 Aksiya: ";
}

// Rus tili oilasi
export class RuAlertTemplate extends PrefixTemplate {
  readonly locale = "ru";
  readonly kind = "alert";
  protected readonly prefix = "⚠️ ВНИМАНИЕ: ";
}
export class RuReminderTemplate extends PrefixTemplate {
  readonly locale = "ru";
  readonly kind = "reminder";
  protected readonly prefix = "Напоминание: ";
}
export class RuPromoTemplate extends PrefixTemplate {
  readonly locale = "ru";
  readonly kind = "promo";
  protected readonly prefix = "🎁 Акция: ";
}

// Ingliz tili oilasi
export class EnAlertTemplate extends PrefixTemplate {
  readonly locale = "en";
  readonly kind = "alert";
  protected readonly prefix = "⚠️ ATTENTION: ";
}
export class EnReminderTemplate extends PrefixTemplate {
  readonly locale = "en";
  readonly kind = "reminder";
  protected readonly prefix = "Reminder: ";
}
export class EnPromoTemplate extends PrefixTemplate {
  readonly locale = "en";
  readonly kind = "promo";
  protected readonly prefix = "🎁 Promo: ";
}

// ---------------------------------------------------------------------------
// Abstrakt fabrika va aniq fabrikalar
// ---------------------------------------------------------------------------
export abstract class LocaleFactory {
  abstract readonly code: LocaleCode;
  abstract createAlertTemplate(): MessageTemplate;
  abstract createReminderTemplate(): MessageTemplate;
  abstract createPromoTemplate(): MessageTemplate;
  /** Imzo ham oilaning bir qismi: SignatureDecorator uni xabar tilida qo'yadi. */
  abstract createSignature(): string;
}

export class UzFactory extends LocaleFactory {
  readonly code = "uz";
  createAlertTemplate() { return new UzAlertTemplate(); }
  createReminderTemplate() { return new UzReminderTemplate(); }
  createPromoTemplate() { return new UzPromoTemplate(); }
  createSignature() { return "— NotifyHub jamoasi"; }
}

export class RuFactory extends LocaleFactory {
  readonly code = "ru";
  createAlertTemplate() { return new RuAlertTemplate(); }
  createReminderTemplate() { return new RuReminderTemplate(); }
  createPromoTemplate() { return new RuPromoTemplate(); }
  createSignature() { return "— Команда NotifyHub"; }
}

export class EnFactory extends LocaleFactory {
  readonly code = "en";
  createAlertTemplate() { return new EnAlertTemplate(); }
  createReminderTemplate() { return new EnReminderTemplate(); }
  createPromoTemplate() { return new EnPromoTemplate(); }
  createSignature() { return "— NotifyHub team"; }
}

const FACTORIES: Record<LocaleCode, () => LocaleFactory> = {
  uz: () => new UzFactory(),
  ru: () => new RuFactory(),
  en: () => new EnFactory(),
};

/** Til kodi bo'yicha kerakli fabrikani tanlaydi. */
export function getLocaleFactory(code: string): LocaleFactory {
  const key = code.trim().toLowerCase() as LocaleCode;
  const create = FACTORIES[key];
  if (!create) {
    throw new Error(`Noma'lum til: '${code}'. Mavjudlari: ${LOCALE_CODES.join(", ")}`);
  }
  return create();
}
