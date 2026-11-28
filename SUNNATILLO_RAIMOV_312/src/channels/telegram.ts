/**
 * @file channels/telegram.ts
 *
 * PATTERN: Bridge (Concrete Implementor)
 *
 * MAQSAD:
 * Telegram orqali xabar yetkazish kanali (imitatsiya qilinadi).
 */

import { Channel } from "./base.js";

export class TelegramChannel implements Channel {
  public readonly name: string = "telegram";

  public send(recipient: string, text: string, _priorityCode?: number): boolean {
    console.log(`[Telegram ✈️ → ${recipient}] ${text}`);
    return true;
  }
}
