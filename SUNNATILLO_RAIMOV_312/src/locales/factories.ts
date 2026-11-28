/**
 * @file locales/factories.ts
 *
 * PATTERN: Abstract Factory (Yaratuvchi / Creational) - 2-majburiy pattern
 *
 * MAQSAD:
 * Muayyan til (O'zbek, Rus, Ingliz) uchun mos shablonlar oilasini yaratuvchi
 * aniq fabrikalar (Concrete Factories) va aniq mahsulotlar (Concrete Products).
 *
 * Talab: Bitta xabarda turli tillarning shablonlari aralashib ketmasligi kerak.
 * Masalan: UzFactory dan olingan barcha shablonlar sof o'zbek tilidagi prefikslarga ega.
 */

import { NotificationTemplate, LocaleFactory } from "./base.js";

// ============================================================================
// Concrete Products (O'zbek tili mahsulotlari)
// ============================================================================

export class UzAlertTemplate implements NotificationTemplate {
  public render(content: string): string {
    return `⚠️ DIQQAT: ${content}`;
  }
}

export class UzReminderTemplate implements NotificationTemplate {
  public render(content: string): string {
    return `⏰ Eslatma: ${content}`;
  }
}

export class UzPromoTemplate implements NotificationTemplate {
  public render(content: string): string {
    return `🎁 Aksiya: ${content}`;
  }
}

// ============================================================================
// Concrete Products (Rus tili mahsulotlari)
// ============================================================================

export class RuAlertTemplate implements NotificationTemplate {
  public render(content: string): string {
    return `⚠️ ВНИМАНИЕ: ${content}`;
  }
}

export class RuReminderTemplate implements NotificationTemplate {
  public render(content: string): string {
    return `⏰ Напоминание: ${content}`;
  }
}

export class RuPromoTemplate implements NotificationTemplate {
  public render(content: string): string {
    return `🎁 Акция: ${content}`;
  }
}

// ============================================================================
// Concrete Products (Ingliz tili mahsulotlari)
// ============================================================================

export class EnAlertTemplate implements NotificationTemplate {
  public render(content: string): string {
    return `⚠️ ALERT: ${content}`;
  }
}

export class EnReminderTemplate implements NotificationTemplate {
  public render(content: string): string {
    return `⏰ Reminder: ${content}`;
  }
}

export class EnPromoTemplate implements NotificationTemplate {
  public render(content: string): string {
    return `🎁 Promo: ${content}`;
  }
}

// ============================================================================
// Concrete Factories (Aniq Fabrikalar)
// ============================================================================

/**
 * O'zbek tili fabrikasi: faqat o'zbekcha shablonlar oilasini yaratadi.
 */
export class UzFactory implements LocaleFactory {
  public createAlertTemplate(): NotificationTemplate {
    return new UzAlertTemplate();
  }

  public createReminderTemplate(): NotificationTemplate {
    return new UzReminderTemplate();
  }

  public createPromoTemplate(): NotificationTemplate {
    return new UzPromoTemplate();
  }

  public getLanguageName(): string {
    return "O'zbekcha";
  }

  public getLanguageCode(): string {
    return "uz";
  }
}

/**
 * Rus tili fabrikasi: faqat ruscha shablonlar oilasini yaratadi.
 */
export class RuFactory implements LocaleFactory {
  public createAlertTemplate(): NotificationTemplate {
    return new RuAlertTemplate();
  }

  public createReminderTemplate(): NotificationTemplate {
    return new RuReminderTemplate();
  }

  public createPromoTemplate(): NotificationTemplate {
    return new RuPromoTemplate();
  }

  public getLanguageName(): string {
    return "Русский";
  }

  public getLanguageCode(): string {
    return "ru";
  }
}

/**
 * Ingliz tili fabrikasi: faqat inglizcha shablonlar oilasini yaratadi.
 */
export class EnFactory implements LocaleFactory {
  public createAlertTemplate(): NotificationTemplate {
    return new EnAlertTemplate();
  }

  public createReminderTemplate(): NotificationTemplate {
    return new EnReminderTemplate();
  }

  public createPromoTemplate(): NotificationTemplate {
    return new EnPromoTemplate();
  }

  public getLanguageName(): string {
    return "English";
  }

  public getLanguageCode(): string {
    return "en";
  }
}

/**
 * Til kodi bo'yicha tegishli Abstract Factory ni qaytaruvchi yordamchi funksiya.
 */
export function getLocaleFactory(langCode: string): LocaleFactory {
  const code = langCode.trim().toLowerCase();
  switch (code) {
    case "uz":
      return new UzFactory();
    case "ru":
      return new RuFactory();
    case "en":
      return new EnFactory();
    default:
      throw new Error(`Noma'lum til kodi: '${langCode}'. Qo'llab-quvvatlanadigan tillar: uz, ru, en`);
  }
}
