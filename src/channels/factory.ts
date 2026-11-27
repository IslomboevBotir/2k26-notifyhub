import type { ChannelType } from "../types.js";
import type { Channel } from "./base.js";
import { ConsoleChannel } from "./console.js";
import { FileChannel } from "./file.js";
import { LegacySmsGateway, SmsChannelAdapter } from "./sms_adapter.js";
import { TelegramChannel } from "./telegram.js";

/**
 * PATTERN: Factory Method (Fabrika metodi) — BONUS
 * Nima uchun ishlatilgan:
 *   Kanal nomiga qarab ("console", "file", "telegram", "sms") mos Channel obyektini
 *   yaratishni markazlashtiradi. Foydalanuvchi kodi konkret kanal klasslarini bilishi
 *   va SmsChannelAdapter uchun LegacySmsGateway yig'ishi shart emas.
 */
export class ChannelFactory {
  public static create(channelType: ChannelType, options?: { filePath?: string }): Channel {
    switch (channelType) {
      case "console":
        return new ConsoleChannel();
      case "file":
        return new FileChannel(options?.filePath);
      case "telegram":
        return new TelegramChannel();
      case "sms":
        return new SmsChannelAdapter(new LegacySmsGateway());
      default: {
        const exhaustive: never = channelType;
        throw new Error(`Noma'lum kanal turi: ${String(exhaustive)}`);
      }
    }
  }
}
