/**
 * @file channels/factory.ts
 *
 * PATTERN: Factory Method (Yaratuvchi / Creational) - Bonus Pattern (+1 ball)
 *
 * MAQSAD:
 * Kanal turi nomi ("console", "file", "telegram", "sms") bo'yicha mos
 * `Channel` obyektini yaratishni markazlashtirish.
 * Yangi kanallar qo'shilganda kanal yaratish mantig'i faqat shu fabrikada o'zgaradi.
 *
 * Misol: ChannelFactory.create("telegram")
 */

import { Channel } from "./base.js";
import { ConsoleChannel } from "./console.js";
import { FileChannel } from "./file.js";
import { TelegramChannel } from "./telegram.js";
import { SmsChannelAdapter } from "./sms-adapter.js";

export class ChannelFactory {
  /**
   * Kanal turi nomi bo'yicha mos kanal obyektini yaratadi.
   * @param type "console" | "file" | "telegram" | "sms"
   */
  public static create(type: string): Channel {
    const normalized = type.trim().toLowerCase();
    switch (normalized) {
      case "console":
        return new ConsoleChannel();
      case "file":
        return new FileChannel();
      case "telegram":
        return new TelegramChannel();
      case "sms":
        return new SmsChannelAdapter();
      default:
        throw new Error(
          `Noma'lum kanal turi: '${type}'. Mavjud kanallar: console, file, telegram, sms`
        );
    }
  }

  public static getSupportedChannels(): string[] {
    return ["console", "file", "telegram", "sms"];
  }
}
