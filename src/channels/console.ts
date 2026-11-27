import type { User } from "../recipients/recipients.js";
import type { ChannelType, NotificationType } from "../types.js";
import type { Channel } from "./base.js";

/**
 * PATTERN: Bridge (Ko'prik) — Concrete Implementation (ConsoleChannel)
 * Nima uchun ishlatilgan:
 *   Xabarni konsolga chiqarish realizatsiyasini bildirishnoma turlaridan mustaqil ta'minlaydi.
 */
export class ConsoleChannel implements Channel {
  public readonly name: ChannelType = "console";

  public send(recipient: User, text: string, _notificationType: NotificationType): boolean {
    console.log(`[CONSOLE → ${recipient.name}] ${text}`);
    return true;
  }
}
