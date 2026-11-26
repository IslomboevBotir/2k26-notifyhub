/**
 * @file decorators/urgent.decorator.ts
 * @pattern Decorator Pattern - Concrete Decorator
 */

import { MessageDecorator } from './message-decorator.base.ts';
import type { IMessage } from './message.interface.ts';

export class UrgentDecorator extends MessageDecorator {
  public override getContent(): string {
    const original = this.message.getContent();
    return `🔴 ${original.toUpperCase()}`;
  }
}
