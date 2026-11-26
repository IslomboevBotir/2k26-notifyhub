/**
 * @file decorators/message-decorator.base.ts
 * @pattern Decorator Pattern - Base Decorator
 */

import type { IMessage } from './message.interface.ts';

export abstract class MessageDecorator implements IMessage {
  protected readonly message: IMessage;

  constructor(message: IMessage) {
    this.message = message;
  }

  public getContent(): string {
    return this.message.getContent();
  }
}
