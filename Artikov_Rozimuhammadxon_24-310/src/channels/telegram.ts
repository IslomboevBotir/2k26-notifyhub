import { Channel } from "./base";
import type { User } from "../recipients/recipients";

/**
 * Telegram kanali: Bridge'ning aniq realizatsiyasi.
 * Telegram'ga yuborish imitatsiya qilinadi: haqiqiy so'rov yuborilmaydi,
 * xabar kanal belgisi bilan chiqariladi.
 */
export class TelegramChannel extends Channel {
  readonly name = "telegram";

  send(recipient: User, text: string): boolean {
    if (!recipient.telegram) {
      this.output.write(`[Telegram ✖ ${recipient.name}] Telegram akkaunti ko'rsatilmagan`, "error");
      return false;
    }
    this.output.write(`[Telegram → ${recipient.telegram}] ${text}`);
    return true;
  }
}
