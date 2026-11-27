/**
 * BRIDGE pattern: realizatsiya (Implementor) tomoni.
 *
 * Channel xabarni QANDAY yetkazishni biladi (konsol, fayl, Telegram, SMS),
 * lekin bildirishnoma turi haqida hech narsa bilmaydi. Notification
 * (abstraksiya) esa kanalga havola saqlaydi va yuborish ishini unga topshiradi.
 * Shu sababli yangi kanal qo'shish uchun bitta yangi Channel klassini yozish
 * kifoya, bildirishnoma klasslari o'zgarmaydi.
 */

import { getEnvironment, type OutputPort } from "../core/environment";
import type { NotificationKind } from "../core/types";
import type { User } from "../recipients/recipients";

export abstract class Channel {
  /** Kanalning qisqa nomi (statistika va ChannelFactory uchun). */
  abstract readonly name: string;

  /**
   * Tayyor matnni bitta foydalanuvchiga yuboradi.
   *
   * `kind` bildirishnoma turi. Ko'p kanallar uni e'tiborsiz qoldiradi, lekin
   * SMS adapteri undan `priority_code` hisoblash uchun foydalanadi.
   *
   * @returns muvaffaqiyatli bo'lsa true, aks holda false
   */
  abstract send(recipient: User, text: string, kind: NotificationKind): boolean;

  protected get output(): OutputPort {
    return getEnvironment().output;
  }
}
