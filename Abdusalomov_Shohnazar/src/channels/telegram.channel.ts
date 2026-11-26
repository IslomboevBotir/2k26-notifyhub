/**
 * @file channels/telegram.channel.ts
 * @pattern Bridge Pattern - Concrete Implementor
 */

import type { IChannel } from './channel.interface.ts';
import type { ChannelType, NotificationType } from '../types/index.ts';
import type { User } from '../recipients/user.ts';

export class TelegramChannel implements IChannel {
  public readonly type: ChannelType = 'telegram';

  public send(recipient: User, content: string, _notificationType: NotificationType): boolean {
    const contact = recipient.getContactInfo();
    const telegramHandle = contact.startsWith('@') ? contact : `@${contact}`;
    console.log(`[Telegram → ${telegramHandle}] ${content}`);
    return true;
  }
}
