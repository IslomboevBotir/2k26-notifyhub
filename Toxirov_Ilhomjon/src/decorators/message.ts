export type MessageDecoratorType =
  | "timestamp"
  | "signature"
  | "encrypt"
  | "urgent";

export interface MessageDecorator {
  getText(): string;
}

export class PlainMessage implements MessageDecorator {
  private readonly text: string;

  constructor(text: string) {
    this.text = text;
  }

  getText(): string {
    return this.text;
  }
}

abstract class TextDecorator implements MessageDecorator {
  protected readonly message: MessageDecorator;

  constructor(message: MessageDecorator) {
    this.message = message;
  }

  abstract getText(): string;
}

// Decorator: xabarni yuborishdan oldin qo'shimcha o'rashlarni istalgan tartibda qo'llaydi.
export class TimestampDecorator extends TextDecorator {
  getText(): string {
    const timestamp = new Date().toLocaleString("uz-UZ");
    return `${this.message.getText()} [${timestamp}]`;
  }
}

export class SignatureDecorator extends TextDecorator {
  getText(): string {
    return `${this.message.getText()} — NotifyHub`;
  }
}

export class EncryptDecorator extends TextDecorator {
  getText(): string {
    return Buffer.from(this.message.getText(), "utf8").toString("base64");
  }
}

export class UrgentDecorator extends TextDecorator {
  getText(): string {
    return `🔴 ${this.message.getText().toLocaleUpperCase()}`;
  }
}

const decoratorCreators: Record<
  MessageDecoratorType,
  (message: MessageDecorator) => MessageDecorator
> = {
  timestamp: (message) => new TimestampDecorator(message),
  signature: (message) => new SignatureDecorator(message),
  encrypt: (message) => new EncryptDecorator(message),
  urgent: (message) => new UrgentDecorator(message),
};

export function createDecorator(
  type: MessageDecoratorType,
  message: MessageDecorator,
): MessageDecorator {
  return decoratorCreators[type](message);
}
