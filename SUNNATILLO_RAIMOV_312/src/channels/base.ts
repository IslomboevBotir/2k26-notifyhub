/**
 * @file channels/base.ts
 *
 * PATTERN: Bridge (Tuzilmaviy / Structural) - Realizatsiya interfeysi
 *
 * MAQSAD:
 * Yetkazish usuli (Implementor). Bildirishnomalarni jo'natish kanallari uchun
 * umumiy interfeysni belgilaydi.
 * Notification abstraksiyasi Channel interfeysiga murojaat qiladi,
 * shuning uchun yangi kanal qo'shilganda Notification klasslarini o'zgartirish shart emas.
 */

export interface Channel {
  readonly name: string;

  /**
   * Bildirishnomani qabul qiluvchiga jo'natish.
   * @param recipient Qabul qiluvchi manzili yoki telefon raqami
   * @param text Yuborilayotgan xabar matni
   * @param priorityCode Muhimlik darajasi (1 = Alert, 2 = Reminder, 3 = Promo)
   * @returns Yuborish muvaffaqiyatli bo'lsa true, aks holda false
   */
  send(recipient: string, text: string, priorityCode?: number): boolean;
}
