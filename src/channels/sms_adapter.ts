import type { User } from "../recipients/recipients.js";
import type { ChannelType, NotificationType } from "../types.js";
import type { Channel } from "./base.js";

/**
 * TASHQI / ESKI KUTUBXONA KLASSI — O'ZGARTIRISH MUMKIN EMAS!
 * LegacySmsGateway interfeysi bizning Channel.send(recipient, text, type) interfeysimizga
 * mos kelmaydi (u phone: string, payload: Uint8Array, priorityCode: number qabul qiladi
 * va boolean o'rniga 200/400 HTTP-kod qaytaradi).
 */
export class LegacySmsGateway {
  public sendSms(phone: string, payload: Uint8Array, priorityCode: number): number {
    // Muvaffaqiyatli bo'lsa 200, xato bo'lsa 400 qaytaradi.
    const isValidPhone = /^\+\d{9,15}$/.test(phone.trim());
    if (!isValidPhone || payload.length === 0 || priorityCode < 1 || priorityCode > 3) {
      return 400;
    }

    const decodedText = Buffer.from(payload).toString("utf-8");
    console.log(`[SMS → ${phone}] (P${priorityCode}) ${decodedText}`);
    return 200;
  }
}

/**
 * PATTERN: Adapter (Moslashtiruvchi)
 * Nima uchun ishlatilgan:
 *   O'zgartirib bo'lmaydigan LegacySmsGateway klassini tizimning umumiy Channel
 *   interfeysiga moslashtiradi:
 *   - matnni bytes (Uint8Array) ga o'giradi;
 *   - bildirishnoma turini priorityCode ga aylantiradi (alert -> 1, reminder -> 2, promo -> 3);
 *   - gateway javob kodini (200/400) boolean (true/false) ga o'zgartiradi.
 */
export class SmsChannelAdapter implements Channel {
  public readonly name: ChannelType = "sms";
  private readonly gateway: LegacySmsGateway;

  private static readonly PRIORITY_MAP: Record<NotificationType, number> = {
    alert: 1,
    reminder: 2,
    promo: 3,
  };

  constructor(gateway: LegacySmsGateway = new LegacySmsGateway()) {
    this.gateway = gateway;
  }

  public send(recipient: User, text: string, notificationType: NotificationType): boolean {
    const payload = new Uint8Array(Buffer.from(text, "utf-8"));
    const priorityCode = SmsChannelAdapter.PRIORITY_MAP[notificationType];
    const statusCode = this.gateway.sendSms(recipient.phone, payload, priorityCode);
    if (statusCode !== 200) {
      console.log(`[SMS XATO → ${recipient.name} (${recipient.phone})] Gateway kodi: ${statusCode}`);
    }
    return statusCode === 200;
  }
}
