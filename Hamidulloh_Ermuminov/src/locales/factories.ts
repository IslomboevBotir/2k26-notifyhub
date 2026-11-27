import type { LocaleCode } from "../types.js";

/**
 * PATTERN: Abstract Factory (Abstrakt fabrika)
 * Nima uchun ishlatilgan:
 *   Bitta til (uz, ru, en) uchun o'zaro mos shablonlar oilasini (Alert, Reminder,
 *   Promo) yaratadi. Natijada bitta xabar ichida turli tillarning shablonlari
 *   aralashib ketishining oldi olinadi.
 */

export interface MessageTemplate {
  readonly locale: LocaleCode;
  render(text: string): string;
}

class PrefixedTemplate implements MessageTemplate {
  public readonly locale: LocaleCode;
  private readonly prefix: string;

  constructor(locale: LocaleCode, prefix: string) {
    this.locale = locale;
    this.prefix = prefix;
  }

  public render(text: string): string {
    return `${this.prefix} ${text}`;
  }
}

// --- O'zbekcha shablonlar oilasi ---
export class UzAlertTemplate extends PrefixedTemplate {
  constructor() {
    super("uz", "⚠️ DIQQAT:");
  }
}

export class UzReminderTemplate extends PrefixedTemplate {
  constructor() {
    super("uz", "📌 Eslatma:");
  }
}

export class UzPromoTemplate extends PrefixedTemplate {
  constructor() {
    super("uz", "🎁 Aksiya:");
  }
}

// --- Ruscha shablonlar oilasi ---
export class RuAlertTemplate extends PrefixedTemplate {
  constructor() {
    super("ru", "⚠️ ВНИМАНИЕ:");
  }
}

export class RuReminderTemplate extends PrefixedTemplate {
  constructor() {
    super("ru", "📌 Напоминание:");
  }
}

export class RuPromoTemplate extends PrefixedTemplate {
  constructor() {
    super("ru", "🎁 Акция:");
  }
}

// --- Inglizcha shablonlar oilasi ---
export class EnAlertTemplate extends PrefixedTemplate {
  constructor() {
    super("en", "⚠️ ALERT:");
  }
}

export class EnReminderTemplate extends PrefixedTemplate {
  constructor() {
    super("en", "📌 Reminder:");
  }
}

export class EnPromoTemplate extends PrefixedTemplate {
  constructor() {
    super("en", "🎁 Promo:");
  }
}

export interface LocaleFactory {
  readonly locale: LocaleCode;
  createAlertTemplate(): MessageTemplate;
  createReminderTemplate(): MessageTemplate;
  createPromoTemplate(): MessageTemplate;
}

export class UzFactory implements LocaleFactory {
  public readonly locale: LocaleCode = "uz";

  public createAlertTemplate(): MessageTemplate {
    return new UzAlertTemplate();
  }

  public createReminderTemplate(): MessageTemplate {
    return new UzReminderTemplate();
  }

  public createPromoTemplate(): MessageTemplate {
    return new UzPromoTemplate();
  }
}

export class RuFactory implements LocaleFactory {
  public readonly locale: LocaleCode = "ru";

  public createAlertTemplate(): MessageTemplate {
    return new RuAlertTemplate();
  }

  public createReminderTemplate(): MessageTemplate {
    return new RuReminderTemplate();
  }

  public createPromoTemplate(): MessageTemplate {
    return new RuPromoTemplate();
  }
}

export class EnFactory implements LocaleFactory {
  public readonly locale: LocaleCode = "en";

  public createAlertTemplate(): MessageTemplate {
    return new EnAlertTemplate();
  }

  public createReminderTemplate(): MessageTemplate {
    return new EnReminderTemplate();
  }

  public createPromoTemplate(): MessageTemplate {
    return new EnPromoTemplate();
  }
}

export function getLocaleFactory(locale: LocaleCode): LocaleFactory {
  switch (locale) {
    case "uz":
      return new UzFactory();
    case "ru":
      return new RuFactory();
    case "en":
      return new EnFactory();
    default: {
      const exhaustive: never = locale;
      throw new Error(`Qo'llab-quvvatlanmaydigan til: ${String(exhaustive)}`);
    }
  }
}
