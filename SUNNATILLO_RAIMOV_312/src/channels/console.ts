/**
 * @file channels/console.ts
 *
 * PATTERN: Bridge (Concrete Implementor)
 *
 * MAQSAD:
 * Xabarlarni konsol terminaliga chiqarish kanali.
 */

import { Channel } from "./base.js";

export class ConsoleChannel implements Channel {
  public readonly name: string = "console";

  public send(recipient: string, text: string, _priorityCode?: number): boolean {
    console.log(`[Console → ${recipient}] ${text}`);
    return true;
  }
}
