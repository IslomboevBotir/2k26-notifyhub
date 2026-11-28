/**
 * @file channels/sms-adapter.ts
 *
 * PATTERN: Adapter (Tuzilmaviy / Structural) - 4-majburiy pattern
 *
 * MAQSAD:
 * Mavjud "eski" (legacy) tizim `LegacySmsGateway` ni NotifyHub ning umumiy `Channel`
 * interfeysiga moslashtirish.
 *
 * Talab:
 * `LegacySmsGateway` klassini o'zgartirish MUMKIN EMAS (tashqi kutubxona).
 * Uning metodi: `sendSms(phone: string, payload: Buffer, priorityCode: number): number`
 * (200 muvaffaqiyatli, 400 xatolik).
 *
 * `SmsChannelAdapter` Adapter vazifasini bajaradi:
 * 1. String matnni `Buffer` (baytlar) ko'rinishiga o'tkazadi;
 * 2. Bildirishnoma turini `priorityCode` (Alert=1, Reminder=2, Promo=3) ga aylantiradi;
 * 3. Javob kodini (200 / 400) `boolean` (true / false) ga aylantiradi.
 */

import { Channel } from "./base.js";

/**
 * Uchinchi tomon / eski tashqi kutubxona klassi.
 * BU KLASS O'ZGARTIRILMAYDI.
 */
export class LegacySmsGateway {
  /**
   * Muvaffaqiyatli bo'lsa 200, xato bo'lsa 400 qaytaradi.
   * @param phone Telefon raqami
   * @param payload Xabar baytlari
   * @param priorityCode Muhimlik kodi (1, 2, 3)
   */
  public sendSms(phone: string, payload: Buffer, priorityCode: number): number {
    // Telefon raqami bo'sh bo'lsa yoki noto'g'ri bo'lsa 400 xatolik qaytariladi
    if (!phone || phone.trim() === "") {
      return 400;
    }
    // Agar telefon raqami '+' bilan boshlanmasa yoki noto'g'ri bo'lsa simulyatsiya qilingan xato
    if (!phone.startsWith("+") && !/^\d+$/.test(phone)) {
      return 400;
    }
    // Muvaffaqiyatli yuborish
    return 200;
  }
}

/**
 * Adapter:
 * `LegacySmsGateway` ni `Channel` interfeysiga moslashtiruvchi klass.
 */
export class SmsChannelAdapter implements Channel {
  public readonly name: string = "sms";
  private readonly gateway: LegacySmsGateway;

  constructor(gateway?: LegacySmsGateway) {
    this.gateway = gateway || new LegacySmsGateway();
  }

  public send(recipient: string, text: string, priorityCode: number = 2): boolean {
    // 1. Matnni baytlarga (Buffer) o'giramiz
    const payload = Buffer.from(text, "utf-8");

    // 2. priorityCode tekshiriladi (agar berilmagan bo'lsa 2 - Reminder)
    const validPriority = priorityCode >= 1 && priorityCode <= 3 ? priorityCode : 2;

    // 3. Eski shlyuzga yuboramiz
    const statusCode = this.gateway.sendSms(recipient, payload, validPriority);

    // 4. Status kodini tekshirib, natijani qaytaramiz
    const isSuccess = statusCode === 200;

    if (isSuccess) {
      console.log(`[SMS → ${recipient}] ${text}`);
    } else {
      console.error(`[SMS Xatolik → ${recipient}] Yuborib bo'lmadi! Status: ${statusCode}`);
    }

    return isSuccess;
  }
}
