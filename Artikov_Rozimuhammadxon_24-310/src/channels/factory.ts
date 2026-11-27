/**
 * FACTORY METHOD pattern (bonus).
 *
 * `ChannelFactory.create("telegram")` kanal obyektini nomi bo'yicha yaratadi.
 * Shu sababli menyu, Builder va Prototype shablonlari aniq klasslarni
 * (TelegramChannel, SmsChannelAdapter, ...) bilishi shart emas, ular faqat
 * satr bilan ishlaydi. Yangi kanal `register()` orqali qo'shiladi va mavjud
 * kod o'zgarmaydi (Open/Closed tamoyili).
 */

import type { Channel } from "./base";
import { ConsoleChannel } from "./console";
import { FileChannel } from "./file";
import { SmsChannelAdapter } from "./smsAdapter";
import { TelegramChannel } from "./telegram";

type ChannelCreator = () => Channel;

export class ChannelFactory {
  private static readonly registry = new Map<string, ChannelCreator>([
    ["console", () => new ConsoleChannel()],
    ["file", () => new FileChannel()],
    ["telegram", () => new TelegramChannel()],
    ["sms", () => new SmsChannelAdapter()],
  ]);

  /** Fabrika metodi: nomga mos kanal obyektini qaytaradi. */
  static create(name: string): Channel {
    const creator = this.registry.get(name.trim().toLowerCase());
    if (!creator) {
      throw new Error(`Noma'lum kanal: '${name}'. Mavjudlari: ${this.available().join(", ")}`);
    }
    return creator();
  }

  static register(name: string, creator: ChannelCreator): void {
    this.registry.set(name.trim().toLowerCase(), creator);
  }

  static available(): string[] {
    return [...this.registry.keys()];
  }
}
