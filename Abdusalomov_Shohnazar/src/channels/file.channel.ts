/**
 * @file channels/file.channel.ts
 * @pattern Bridge Pattern - Concrete Implementor
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import type { IChannel } from './channel.interface.ts';
import type { ChannelType, NotificationType } from '../types/index.ts';
import type { User } from '../recipients/user.ts';

export class FileChannel implements IChannel {
  public readonly type: ChannelType = 'file';
  private readonly logFilePath: string;

  constructor(customPath?: string) {
    this.logFilePath = customPath ?? path.resolve(process.cwd(), 'logs', 'notifications.log');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public send(recipient: User, content: string, notificationType: NotificationType): boolean {
    try {
      this.ensureDirectoryExists();
      const timestamp = new Date().toISOString();
      const logLine = `[${timestamp}] [${notificationType.toUpperCase()}] [To: ${recipient.getName()} (${recipient.getContactInfo()})] ${content}\n`;
      fs.appendFileSync(this.logFilePath, logLine, 'utf-8');

      console.log(`[File → ${path.basename(this.logFilePath)} | ${recipient.getName()}] ${content}`);
      return true;
    } catch (error) {
      console.error(`[File XATOLIK] Faylga yozishda xatolik yuz berdi:`, error);
      return false;
    }
  }
}
