/**
 * @file locales/template.interface.ts
 * @pattern Abstract Factory Pattern - Abstract Products
 * @description
 * Ushbu interfeyslar Abstract Factory patternidagi "Abstract Product"lar hisoblanadi.
 * Har bir til fabrikasi mana shu mahsulotlar oilasini yaratib beradi:
 * - Alert shabloni
 * - Reminder shabloni
 * - Promo shabloni
 *
 * Talab: Bitta xabarda turli tillarning shablonlari aralashib ketmasligi kafolatlanadi.
 */

export interface INotificationTemplate {
  /**
   * Xom matnni qabul qilib, til va turga mos prefiks/shablon bilan formatlab qaytaradi
   */
  render(content: string): string;

  /**
   * Ushbu shablon tegishli bo'lgan til
   */
  getLocale(): string;
}

export interface IAlertTemplate extends INotificationTemplate {
  readonly templateType: 'alert';
}

export interface IReminderTemplate extends INotificationTemplate {
  readonly templateType: 'reminder';
}

export interface IPromoTemplate extends INotificationTemplate {
  readonly templateType: 'promo';
}
