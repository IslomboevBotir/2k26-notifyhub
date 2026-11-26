/**
 * @file channels/console.channel.ts
 * @pattern Bridge Pattern - Concrete Implementor
 */

import type { IChannel } from './channel.interface.ts';
import type { ChannelType, NotificationType } from '../types/index.ts';
import type { User } from '../recipients/user.ts';

export class ConsoleChannel implements IChannel {
  public readonly type: ChannelType = 'console';

  public send(recipient: User, content: string, _notificationType: NotificationType): boolean {
    console.log(`[Console → ${recipient.getName()} (${recipient.getContactInfo()})] ${content}`);
    return true;
  }
}
