import type { DecoratorKind } from "../types.js";

/**
 * PATTERN: Decorator (Bezatuvchi / O'ram)
 * Nima uchun ishlatilgan:
 *   Xabar matniga vaqt belgisi, imzo, shifrlash va shoshilinchlik belgisini
 *   istalgan tartibda va miqdorda dinamik qo'shish imkonini beradi. Notification
 *   klassida ko'plab boolean flaglar saqlashdan qochiladi.
 */

export interface MessageComponent {
  getText(): string;
}

export class PlainMessage implements MessageComponent {
  private readonly text: string;

  constructor(text: string) {
    this.text = text;
  }

  public getText(): string {
    return this.text;
  }
}

export abstract class MessageDecorator implements MessageComponent {
  protected readonly wrapped: MessageComponent;

  constructor(wrapped: MessageComponent) {
    this.wrapped = wrapped;
  }

  public abstract getText(): string;
}

function formatDateTime(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export class TimestampDecorator extends MessageDecorator {
  private readonly date: Date;

  constructor(wrapped: MessageComponent, date: Date = new Date()) {
    super(wrapped);
    this.date = date;
  }

  public getText(): string {
    return `${this.wrapped.getText()} [${formatDateTime(this.date)}]`;
  }
}

export class SignatureDecorator extends MessageDecorator {
  private readonly signature: string;

  constructor(wrapped: MessageComponent, signature = "— NotifyHub jamoasi") {
    super(wrapped);
    this.signature = signature;
  }

  public getText(): string {
    return `${this.wrapped.getText()} ${this.signature}`;
  }
}

export class EncryptDecorator extends MessageDecorator {
  private readonly mode: "base64" | "caesar";
  private readonly shift: number;

  constructor(wrapped: MessageComponent, mode: "base64" | "caesar" = "base64", shift = 3) {
    super(wrapped);
    this.mode = mode;
    this.shift = shift;
  }

  public getText(): string {
    const raw = this.wrapped.getText();
    if (this.mode === "base64") {
      return `[ENC:${Buffer.from(raw, "utf-8").toString("base64")}]`;
    }

    const shifted = Array.from(raw)
      .map((ch) => {
        const code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + this.shift) % 26) + 65);
        }
        if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + this.shift) % 26) + 97);
        }
        return ch;
      })
      .join("");
    return `[CAESAR:${shifted}]`;
  }
}

export class UrgentDecorator extends MessageDecorator {
  public getText(): string {
    return `🔴 ${this.wrapped.getText().toUpperCase()}`;
  }
}

export function applyDecorators(
  baseMessage: MessageComponent,
  decorators: readonly DecoratorKind[],
  options?: { date?: Date; signature?: string; encryptMode?: "base64" | "caesar" }
): MessageComponent {
  let current: MessageComponent = baseMessage;

  for (const kind of decorators) {
    switch (kind) {
      case "timestamp":
        current = new TimestampDecorator(current, options?.date);
        break;
      case "signature":
        current = new SignatureDecorator(current, options?.signature);
        break;
      case "encrypt":
        current = new EncryptDecorator(current, options?.encryptMode);
        break;
      case "urgent":
        current = new UrgentDecorator(current);
        break;
      default: {
        const exhaustive: never = kind;
        throw new Error(`Noma'lum dekorator: ${String(exhaustive)}`);
      }
    }
  }

  return current;
}
