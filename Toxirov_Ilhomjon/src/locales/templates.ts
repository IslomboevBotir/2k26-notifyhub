import type { NotificationType } from "../notifications/base.ts";

export type Locale = "uz" | "ru" | "en";

export interface NotificationTemplate {
  render(text: string): string;
}

class TextTemplate implements NotificationTemplate {
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  render(text: string): string {
    return `${this.prefix} ${text}`;
  }
}

// Abstract Factory: har bir til fabrikasi uchala mos shablonni bir oilada yaratadi.
export interface LocaleFactory {
  createAlertTemplate(): NotificationTemplate;
  createReminderTemplate(): NotificationTemplate;
  createPromoTemplate(): NotificationTemplate;
}

export class UzFactory implements LocaleFactory {
  createAlertTemplate(): NotificationTemplate {
    return new TextTemplate("⚠️ DIQQAT:");
  }

  createReminderTemplate(): NotificationTemplate {
    return new TextTemplate("🔔 Eslatma:");
  }

  createPromoTemplate(): NotificationTemplate {
    return new TextTemplate("🎉 AKSIYA:");
  }
}

export class RuFactory implements LocaleFactory {
  createAlertTemplate(): NotificationTemplate {
    return new TextTemplate("⚠️ ВНИМАНИЕ:");
  }

  createReminderTemplate(): NotificationTemplate {
    return new TextTemplate("🔔 Напоминание:");
  }

  createPromoTemplate(): NotificationTemplate {
    return new TextTemplate("🎉 АКЦИЯ:");
  }
}

export class EnFactory implements LocaleFactory {
  createAlertTemplate(): NotificationTemplate {
    return new TextTemplate("⚠️ ALERT:");
  }

  createReminderTemplate(): NotificationTemplate {
    return new TextTemplate("🔔 Reminder:");
  }

  createPromoTemplate(): NotificationTemplate {
    return new TextTemplate("🎉 PROMOTION:");
  }
}

export function createLocaleFactory(locale: Locale): LocaleFactory {
  const factories: Record<Locale, LocaleFactory> = {
    uz: new UzFactory(),
    ru: new RuFactory(),
    en: new EnFactory(),
  };
  return factories[locale];
}

export function createTemplate(
  factory: LocaleFactory,
  type: NotificationType,
): NotificationTemplate {
  switch (type) {
    case "alert":
      return factory.createAlertTemplate();
    case "reminder":
      return factory.createReminderTemplate();
    case "promo":
      return factory.createPromoTemplate();
  }
}
