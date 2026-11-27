/** Butun loyiha uchun umumiy turlar va qiymatlar ro'yxati. */

export const NOTIFICATION_KINDS = ["alert", "reminder", "promo"] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export const LOCALE_CODES = ["uz", "ru", "en"] as const;
export type LocaleCode = (typeof LOCALE_CODES)[number];

export const EXTRA_NAMES = ["timestamp", "signature", "encrypt", "urgent"] as const;
export type ExtraName = (typeof EXTRA_NAMES)[number];

export const KIND_LABELS: Record<NotificationKind, string> = {
  alert: "Ogohlantirish",
  reminder: "Eslatma",
  promo: "Reklama",
};

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

export const EXTRA_LABELS: Record<ExtraName, string> = {
  timestamp: "Vaqt belgisi",
  signature: "Imzo",
  encrypt: "Shifrlash",
  urgent: "Shoshilinch",
};

export function isNotificationKind(value: string): value is NotificationKind {
  return (NOTIFICATION_KINDS as readonly string[]).includes(value);
}

export function isLocaleCode(value: string): value is LocaleCode {
  return (LOCALE_CODES as readonly string[]).includes(value);
}

export function isExtraName(value: string): value is ExtraName {
  return (EXTRA_NAMES as readonly string[]).includes(value);
}
