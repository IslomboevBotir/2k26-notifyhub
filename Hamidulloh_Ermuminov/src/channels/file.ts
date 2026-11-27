import fs from "node:fs";
import path from "node:path";
import type { Recipient } from "../recipients/recipients.js";
import type { ChannelType, NotificationType } from "../types.js";
import type { Channel } from "./base.js";

/**
 * PATTERN: Bridge (Ko'prik) — Concrete Implementation (FileChannel)
 * Nima uchun ishlatilgan:
 *   Xabarni faylga yozish realizatsiyasi. Bildirishnoma klasslariga bog'liq bo'lmagan
 *   holda mustaqil ishlaydi.
 */
export class FileChannel implements Channel {
  public readonly name: ChannelType = "file";
  private readonly filePath: string;

  constructor(filePath = path.resolve(process.cwd(), "logs", "notifications.log")) {
    this.filePath = filePath;
  }

  public send(recipient: Recipient, text: string, notificationType: NotificationType): boolean {
    try {
      const dir = path.dirname(this.filePath);
      fs.mkdirSync(dir, { recursive: true });
      const line = `[FILE → ${recipient.name} (${notificationType.toUpperCase()})] ${text}\n`;
      fs.appendFileSync(this.filePath, line, "utf-8");
      console.log(`[FILE → ${this.filePath}] ${recipient.name}: ${text}`);
      return true;
    } catch {
      return false;
    }
  }
}
