/**
 * @file channels/legacy-sms-gateway.ts
 * @pattern Adapter Pattern - Adaptee (Uchinchi tomon kutubxonasi)
 * @description
 * DIQQAT: Ushbu klass uchinchi tomonning "eski" SMS shlyuzini ifodalaydi.
 * Topshiriq shartiga ko'ra UNI O'ZGARTIRISH MUMKIN EMAS!
 *
 * Python ekvivalenti:
 * class LegacySmsGateway:
 *     def send_sms(self, phone: str, payload: bytes, priority_code: int) -> int:
 *         """Muvaffaqiyatli bo'lsa 200, xato bo'lsa 400 qaytaradi."""
 */

import { Buffer } from 'node:buffer';

export class LegacySmsGateway {
  /**
   * Tashqi SMS shlyuz orqali xabar yuborish
   * @param phone Qabul qiluvchi telefon raqami
   * @param payload Xabar matni baytlarda (Buffer)
   * @param priorityCode Ustuvorlik kodi (1: High/Alert, 2: Medium/Reminder, 3: Low/Promo)
   * @returns HTTP status kodi: 200 (Success) yoki 400 (Bad Request / Error)
   */
  public sendSms(phone: string, payload: Buffer, priorityCode: number): number {
    if (!phone || phone.trim().length === 0 || !payload || payload.length === 0) {
      return 400;
    }

    if (![1, 2, 3].includes(priorityCode)) {
      return 400;
    }

    return 200;
  }

  /**
   * Python nomlanishiga (snake_case) to'liq mos kelishi uchun alias metod
   */
  public send_sms(phone: string, payload: Buffer, priority_code: number): number {
    return this.sendSms(phone, payload, priority_code);
  }
}
