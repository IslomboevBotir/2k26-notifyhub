/**
 * @file decorators/timestamp.decorator.ts
 * @pattern Decorator Pattern - Concrete Decorator
 */

import { MessageDecorator } from './message-decorator.base.ts';
import type { IMessage } from './message.interface.ts';

export class TimestampDecorator extends MessageDecorator {
  private readonly fixedDate?: Date;

  constructor(message: IMessage, fixedDate?: Date) {
    super(message);
    this.fixedDate = fixedDate;
  }

  public override getContent(): string {
    const original = this.message.getContent();
    const date = this.fixedDate ?? new Date();

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const formattedTime = `[${day}.${month}.${year} ${hours}:${minutes}]`;
    return `${original} ${formattedTime}`;
  }
}
