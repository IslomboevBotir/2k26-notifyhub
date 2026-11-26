/**
 * @file channels/channel.interface.ts
 * @pattern Bridge Pattern - Implementor
 */

import type { ChannelType, NotificationType } from '../types/index.ts';
import type { User } from '../recipients/user.ts';

export interface IChannel {
  readonly type: ChannelType;
  send(recipient: User, content: string, notificationType: NotificationType): boolean;
}
