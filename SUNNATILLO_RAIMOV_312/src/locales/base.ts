/**
 * @file locales/base.ts
 *
 * PATTERN: Abstract Factory (Yaratuvchi / Creational) - 2-majburiy pattern
 *
 * MAQSAD:
 * O'zaro bog'liq yoki bir-biriga mos shablonlar (Alert, Reminder, Promo) oilasini yaratish uchun
 * umumiy interfeyslarni ta'minlaydi.
 * Bu orqali xabar tili (Uzbek, Russian, English) bo'yicha to'g'ri shablonlar oilasi yaratiladi
 * va bitta xabarda turli tillar aralashib ketishi oldi olinadi.
 */

/**
 * Abstract Product (Mavhum mahsulot):
 * Bildirishnoma shabloni uchun umumiy interfeys.
 */
export interface NotificationTemplate {
  render(content: string): string;
}

/**
 * Abstract Factory (Mavhum Fabrika):
 * Bitta til oilasiga tegishli shablonlarni yaratuvchi umumiy interfeys.
 */
export interface LocaleFactory {
  createAlertTemplate(): NotificationTemplate;
  createReminderTemplate(): NotificationTemplate;
  createPromoTemplate(): NotificationTemplate;
  getLanguageName(): string;
  getLanguageCode(): string;
}
