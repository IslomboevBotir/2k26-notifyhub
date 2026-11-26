/**
 * @file channels/channel.factory.ts
 * @pattern Factory Method Pattern
 */

import type { IChannel } from './channel.interface.ts';
import { ConsoleChannel } from './console.channel.ts';
import { FileChannel } from './file.channel.ts';
import { TelegramChannel } from './telegram.channel.ts';
import { SmsChannelAdapter } from './sms-adapter.channel.ts';
import type { ChannelType } from '../types/index.ts';

export class ChannelFactory {
  public static create(type: ChannelType): IChannel {
    switch (type) {
      case 'console':
        return new ConsoleChannel();
      case 'file':
        return new FileChannel();
      case 'telegram':
        return new TelegramChannel();
      case 'sms':
        return new SmsChannelAdapter();
      default: {
        const _exhaustiveCheck: never = type;
        throw new Error(`Noma'lum kanal turi: ${_exhaustiveCheck}`);
      }
    }
  }
}
