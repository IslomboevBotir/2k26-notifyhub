import { appendFileSync } from "node:fs";
import type { NotificationType } from "../notifications/base.ts";

// Bridge: kanal yuborish tafsilotlarini, bildirishnoma turi esa xabar mazmunini belgilaydi.
export interface Channel {
  readonly name: string;
  send(recipient: string, text: string, type: NotificationType): boolean;
}

export class ConsoleChannel implements Channel {
  readonly name = "console";

  send(recipient: string, text: string): boolean {
    console.log(`[KONSOL -> ${recipient}] ${text}`);
    return true;
  }
}

export class FileChannel implements Channel {
  readonly name = "file";
  private readonly fileName: string;

  constructor(fileName = "notifications.log") {
    this.fileName = fileName;
  }

  send(recipient: string, text: string): boolean {
    appendFileSync(this.fileName, `[${recipient}] ${text}\n`, "utf8");
    console.log(`Xabar ${this.fileName} fayliga yozildi.`);
    return true;
  }
}

export class TelegramChannel implements Channel {
  readonly name = "telegram";

  send(recipient: string, text: string): boolean {
    console.log(`[TELEGRAM -> ${recipient}] ${text}`);
    return true;
  }
}
