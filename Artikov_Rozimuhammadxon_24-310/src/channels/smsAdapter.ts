/**
 * ADAPTER pattern: «eski» SMS-shlyuzni ulash.
 *
 * LegacySmsGateway tashqi kutubxona klassi, uni O'ZGARTIRIB BO'LMAYDI.
 * Uning interfeysi `sendSms(phone, payload: Uint8Array, priorityCode) -> 200/400`
 * bizning `Channel.send(recipient, text) -> boolean` interfeysimizga mos kelmaydi.
 *
 * SmsChannelAdapter Channel interfeysini amalga oshiradi va ichida shlyuzni chaqiradi:
 *   - matn (string)             → bytes (UTF-8, Uint8Array);
 *   - bildirishnoma turi (kind) → priorityCode (Alert → 1, Reminder → 2, Promo → 3);
 *   - javob kodi (200 / 400)    → true / false.
 *
 * Natijada SMS kanali Bridge'dagi boshqa kanallar bilan bir xil ishlatiladi.
 * Bildirishnomalar shlyuzning eski API'si haqida hech narsa bilmaydi.
 */

import { Channel } from "./base";
import { getEnvironment } from "../core/environment";
import type { NotificationKind } from "../core/types";
import type { User } from "../recipients/recipients";

// ---------------------------------------------------------------------------
// Tashqi kutubxona (Adaptee). Bu klass o'zgartirilmaydi.
// ---------------------------------------------------------------------------
export class LegacySmsGateway {
  /** Muvaffaqiyatli bo'lsa 200, xato bo'lsa 400 qaytaradi. */
  sendSms(phone: string, payload: Uint8Array, priorityCode: number): number {
    if (!/^\+998\d{9}$/.test(phone)) return 400;
    if (payload.length === 0 || ![1, 2, 3].includes(priorityCode)) return 400;
    getEnvironment().output.write(`[SMS → ${phone}] ${new TextDecoder().decode(payload)}`);
    return 200;
  }
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------
export class SmsChannelAdapter extends Channel {
  readonly name = "sms";

  static readonly PRIORITY_CODES: Record<NotificationKind, number> = {
    alert: 1,
    reminder: 2,
    promo: 3,
  };

  private static readonly SUCCESS_CODE = 200;

  /** Kompozitsiya: adapter shlyuzni o'z ichiga oladi, undan meros olmaydi. */
  constructor(private readonly gateway: LegacySmsGateway = new LegacySmsGateway()) {
    super();
  }

  send(recipient: User, text: string, kind: NotificationKind): boolean {
    const payload = new TextEncoder().encode(text); // string → bytes
    const priorityCode = SmsChannelAdapter.PRIORITY_CODES[kind]; // tur → kod
    const phone = recipient.phone ?? "";

    const status = this.gateway.sendSms(phone, payload, priorityCode);

    const ok = status === SmsChannelAdapter.SUCCESS_CODE; // 200/400 → boolean
    if (!ok) {
      this.output.write(
        `[SMS ✖ ${recipient.name}] shlyuz ${status} kodini qaytardi (raqam: ${phone || "kiritilmagan"})`,
        "error",
      );
    }
    return ok;
  }
}

/** Bridge diagrammasidagi nom bilan ham ishlatish mumkin. */
export { SmsChannelAdapter as SmsChannel };
