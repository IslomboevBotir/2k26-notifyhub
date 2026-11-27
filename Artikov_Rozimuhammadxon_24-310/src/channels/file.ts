import { Channel } from "./base";
import { getEnvironment, type FileStorage } from "../core/environment";
import { formatDateTime } from "../core/format";
import type { NotificationKind } from "../core/types";
import type { User } from "../recipients/recipients";

/**
 * Fayl kanali: Bridge'ning aniq realizatsiyasi (ConcreteImplementor).
 * Har bir xabarni log-faylga (outbox/notifications.log) yangi qator qilib yozadi.
 */
export class FileChannel extends Channel {
  readonly name = "file";

  constructor(private readonly storage?: FileStorage) {
    super();
  }

  send(recipient: User, text: string, kind: NotificationKind): boolean {
    const storage = this.storage ?? getEnvironment().fileStorage;
    const line = `${formatDateTime(new Date(), true)} | ${kind} | ${recipient.name} | ${text}`;
    try {
      storage.append(line);
    } catch (error) {
      this.output.write(`[File ✖ ${recipient.name}] faylga yozib bo'lmadi: ${String(error)}`, "error");
      return false;
    }
    this.output.write(`[File → ${storage.location}] ${recipient.name}: ${text}`);
    return true;
  }
}
