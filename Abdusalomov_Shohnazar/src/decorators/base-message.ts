/**
 * @file decorators/base-message.ts
 * @pattern Decorator Pattern - Concrete Component
 */

import type { IMessage } from './message.interface.ts';

export class BaseMessage implements IMessage {
  private readonly content: string;

  constructor(content: string) {
    this.content = content;
  }

  public getContent(): string {
    return this.content;
  }
}
