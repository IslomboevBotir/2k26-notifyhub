/**
 * @file channels/sms-adapter.channel.ts
 * @pattern Adapter Pattern - Adapter & Bridge Pattern - Concrete Implementor
 */

import { Buffer } from 'node:buffer';
import type { IChannel } from './channel.interface.ts';
import { LegacySmsGateway } from './legacy-sms-gateway.ts';
import type { ChannelType, NotificationType } from '../types/index.ts';
import { SmsPriorityCode } from '../types/index.ts';
import type { User } from '../recipients/user.ts';

export class SmsChannelAdapter implements IChannel {
  public readonly type: ChannelType = 'sms';
  private readonly gateway: LegacySmsGateway;

  constructor(gateway?: LegacySmsGateway) {
    this.gateway = gateway ?? new LegacySmsGateway();
  }

  public send(recipient: User, content: string, notificationType: NotificationType = 'reminder'): boolean {
    const phone = recipient.getContactInfo();
    const payload = Buffer.from(content, 'utf-8');
    const priorityCode = this.mapTypeToPriority(notificationType);
    const statusCode = this.gateway.sendSms(phone, payload, priorityCode);
    const success = statusCode === 200;

    if (success) {
      console.log(`[SMS → ${phone}] ${content}`);
    } else {
      console.error(`[SMS XATOLIK → ${phone}] Xabar yetkazilmadi (Status: ${statusCode})`);
    }

    return success;
  }

  private mapTypeToPriority(type: NotificationType): number {
    switch (type) {
      case 'alert':
        return SmsPriorityCode.ALERT; // 1
      case 'reminder':
        return SmsPriorityCode.REMINDER; // 2
      case 'promo':
        return SmsPriorityCode.PROMO; // 3
      default:
        return SmsPriorityCode.REMINDER;
    }
  }
}
