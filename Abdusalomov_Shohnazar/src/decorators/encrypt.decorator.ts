/**
 * @file decorators/encrypt.decorator.ts
 * @pattern Decorator Pattern - Concrete Decorator
 * @description
 * Xabar matnini shifrlaydi (Sezar shifri yoki Base64).
 *
 * Matematik formulasi manfiy surishlar (negative shifts) va katta qadamlarni
 * to'g'ri hisoblaydi. Shuningdek lotin (A-Z, a-z) va kirill (А-Я, а-я) harflarini
 * to'liq qo'llab-quvvatlaydi.
 */

import { Buffer } from 'node:buffer';
import { MessageDecorator } from './message-decorator.base.ts';
import type { IMessage } from './message.interface.ts';

export type EncryptionAlgorithm = 'base64' | 'caesar';

export class EncryptDecorator extends MessageDecorator {
  private readonly algorithm: EncryptionAlgorithm;
  private readonly shift: number;

  constructor(message: IMessage, algorithm: EncryptionAlgorithm = 'base64', shift: number = 3) {
    super(message);
    this.algorithm = algorithm;
    this.shift = shift;
  }

  public override getContent(): string {
    const original = this.message.getContent();

    if (this.algorithm === 'caesar') {
      return this.caesarCipher(original, this.shift);
    }

    // Base64 shifrlash
    return Buffer.from(original, 'utf-8').toString('base64');
  }

  /**
   * Sezar shifri: manfiy siljishlarni ham to'g'ri hal qiluvchi matematik modul formulasi
   * Formula: (((code - base + (shift % size) + size) % size) + base)
   */
  private caesarCipher(str: string, shift: number): string {
    return str
      .split('')
      .map((char) => {
        const code = char.charCodeAt(0);

        // Lotin katta harflari (A-Z: 65 - 90, 26 ta harf)
        if (code >= 65 && code <= 90) {
          return String.fromCharCode((((code - 65 + (shift % 26) + 26) % 26) + 65));
        }

        // Lotin kichik harflari (a-z: 97 - 122, 26 ta harf)
        if (code >= 97 && code <= 122) {
          return String.fromCharCode((((code - 97 + (shift % 26) + 26) % 26) + 97));
        }

        // Kirill katta harflari (А-Я: 1040 - 1071, 32 ta harf)
        if (code >= 1040 && code <= 1071) {
          return String.fromCharCode((((code - 1040 + (shift % 32) + 32) % 32) + 1040));
        }

        // Kirill kichik harflari (а-я: 1072 - 1103, 32 ta harf)
        if (code >= 1072 && code <= 1103) {
          return String.fromCharCode((((code - 1072 + (shift % 32) + 32) % 32) + 1072));
        }

        // Boshqa belgilar (raqamlar, tinish belgilari, emojilar) o'zgarishsiz qoladi
        return char;
      })
      .join('');
  }
}
