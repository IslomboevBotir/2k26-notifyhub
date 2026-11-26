/**
 * @file decorators/signature.decorator.ts
 * @pattern Decorator Pattern - Concrete Decorator
 * @description
 * Xabar oxiriga rasmiy imzo qo'shuvchi dekorator:
 * Masalan: "Xabar matni — NotifyHub"
 */

import { MessageDecorator } from './message-decorator.base.ts';
import type { IMessage } from './message.interface.ts';

export class SignatureDecorator extends MessageDecorator {
  private readonly signature: string;

  /**
   * Topshiriq konsol namunasida: "— NotifyHub"
   * Topshiriq matnida: "— NotifyHub jamoasi"
   * Ikkala holatni ham qo'llab-quvvatlaydi (default: "— NotifyHub")
   */
  constructor(message: IMessage, signature: string = '— NotifyHub') {
    super(message);
    this.signature = signature;
  }

  public override getContent(): string {
    const original = this.message.getContent();
    return `${original} ${this.signature}`;
  }
}
