/**
 * DECORATOR pattern: xabarni qo'shimcha qayta ishlash.
 *
 * Har bir dekorator MessageComponent'ni o'rab oladi va natijasiga o'z
 * qo'shimchasini kiritadi. Dekoratorlarni istalgan tartibda va istalgancha
 * ustma-ust qo'yish mumkin:
 *
 *   new SignatureDecorator(new TimestampDecorator(new Message("Dars ko'chirildi")))
 *
 * `Notification`ga `withTimestamp`, `encrypt` kabi flaglar qo'shishdan farqli
 * o'laroq, yangi qayta ishlash usuli uchun faqat yangi dekorator klassi
 * yoziladi. Mavjud klasslar o'zgarmaydi va kombinatsiyalar soni cheklanmaydi.
 */

import { formatDateTime } from "../core/format";

/** Komponent interfeysi. */
export interface MessageComponent {
  render(): string;
}

/** Asosiy komponent: dekoratsiyasiz matn. */
export class Message implements MessageComponent {
  constructor(private readonly text: string) {}

  render(): string {
    return this.text;
  }
}

/** Barcha dekoratorlar uchun asos: ichki komponentga ishni uzatadi. */
export abstract class MessageDecorator implements MessageComponent {
  constructor(protected readonly wrapped: MessageComponent) {}

  render(): string {
    return this.wrapped.render();
  }
}

/** Sana va vaqtni qo'shadi: «... [07.11.2026 15:30]». */
export class TimestampDecorator extends MessageDecorator {
  constructor(
    wrapped: MessageComponent,
    private readonly clock: () => Date = () => new Date(),
  ) {
    super(wrapped);
  }

  override render(): string {
    return `${super.render()} [${formatDateTime(this.clock())}]`;
  }
}

/** Imzo qo'shadi: «... — NotifyHub jamoasi». */
export class SignatureDecorator extends MessageDecorator {
  constructor(
    wrapped: MessageComponent,
    private readonly signature = "— NotifyHub jamoasi",
  ) {
    super(wrapped);
  }

  override render(): string {
    return `${super.render()} ${this.signature}`;
  }
}

export type EncryptMethod = "caesar" | "base64";

const ALPHABETS = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
  "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ",
];

/** Matnni shifrlaydi: Sezar shifri (lotin va kirill harflari) yoki Base64. */
export class EncryptDecorator extends MessageDecorator {
  constructor(
    wrapped: MessageComponent,
    readonly method: EncryptMethod = "caesar",
    private readonly shift = 3,
  ) {
    super(wrapped);
  }

  override render(): string {
    const text = super.render();
    return this.method === "base64"
      ? `🔒 ${EncryptDecorator.toBase64(text)}`
      : `🔒 ${EncryptDecorator.caesar(text, this.shift)}`;
  }

  static caesar(text: string, shift: number): string {
    return Array.from(text, (char) => {
      for (const alphabet of ALPHABETS) {
        const index = alphabet.indexOf(char);
        if (index !== -1) {
          const n = alphabet.length;
          return alphabet[(((index + shift) % n) + n) % n];
        }
      }
      return char;
    }).join("");
  }

  /** Sezar shifrini ochish (tekshirish va himoyada ko'rsatish uchun). */
  static decryptCaesar(text: string, shift = 3): string {
    return EncryptDecorator.caesar(text.replace(/^🔒 /, ""), -shift);
  }

  static toBase64(text: string): string {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }

  static fromBase64(encoded: string): string {
    const binary = atob(encoded.replace(/^🔒 /, ""));
    return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
  }
}

/** Matnni katta harflarga o'tkazadi va 🔴 belgisini qo'shadi. */
export class UrgentDecorator extends MessageDecorator {
  override render(): string {
    return `🔴 ${super.render().toUpperCase()}`;
  }
}
