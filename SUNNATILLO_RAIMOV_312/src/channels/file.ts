/**
 * @file channels/file.ts
 *
 * PATTERN: Bridge (Concrete Implementor)
 *
 * MAQSAD:
 * Xabarlarni faylga yozish kanali.
 * Yuborilgan bildirishnomalarni `notifications_log.txt` fayliga yozib boradi.
 */

import * as fs from "fs";
import * as path from "path";
import { Channel } from "./base.js";

export class FileChannel implements Channel {
  public readonly name: string = "file";
  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.resolve(process.cwd(), "notifications_log.txt");
  }

  public getFilePath(): string {
    return this.filePath;
  }

  public send(recipient: string, text: string, _priorityCode?: number): boolean {
    try {
      const logLine = `[File → ${recipient}] ${text}\n`;
      fs.appendFileSync(this.filePath, logLine, "utf-8");
      console.log(`[File 📄 → ${recipient}] ${text} (faylga yozildi: ${path.basename(this.filePath)})`);
      return true;
    } catch (error) {
      console.error(`[File xatolik] Faylga yozib bo'lmadi: ${error}`);
      return false;
    }
  }
}
