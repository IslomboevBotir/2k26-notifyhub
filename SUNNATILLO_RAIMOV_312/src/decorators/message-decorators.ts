/**
 * @file decorators/message-decorators.ts
 *
 * PATTERN: Decorator (Tuzilmaviy / Structural) - 3-majburiy pattern
 *
 * MAQSAD:
 * Bildirishnoma matniga dinamik ravishda qo'shimcha xususiyatlar yoki xatti-harakatlar qo'shish.
 * Meros olish (inheritance) o'rniga kompozitsiyadan foydalaniladi.
 * Xabar ustiga istalgan tartibda va istalgan miqdorda bezaklarni (o'ramlarni) joylashtirish mumkin:
 * - TimestampDecorator (sana va vaqt qo'shadi)
 * - SignatureDecorator (imzo qo'shadi: «— NotifyHub jamoasi»)
 * - EncryptDecorator (matnni shifrlaydi)
 * - UrgentDecorator (matnni katta harflarga o'tkazadi va 🔴 belgisini qo'shadi)
 *
 * Misol: new SignatureDecorator(new TimestampDecorator(new TextMessage("Dars ko'chirildi")))
 */

/**
 * Component (Baza interfeysi):
 * Matnli komponentlar va bezaklar uchun umumiy shartnoma.
 */
export interface MessageComponent {
  getText(): string;
}

/**
 * Concrete Component:
 * Asosiy o'ralmagan (oddiy) matnli xabar.
 */
export class TextMessage implements MessageComponent {
  constructor(private readonly text: string) {}

  public getText(): string {
    return this.text;
  }
}

/**
 * Base Decorator:
 * Boshqa MessageComponent obyektini o'zida saqlaydi va chaqiruvlarni unga yo'naltiradi.
 */
export abstract class MessageDecorator implements MessageComponent {
  constructor(protected readonly wrappee: MessageComponent) {}

  public getText(): string {
    return this.wrappee.getText();
  }
}

/**
 * TimestampDecorator:
 * Xabar oxiriga sana va vaqt belgisini qo'shadi, masalan: `[24.11.2026 18:55]`.
 */
export class TimestampDecorator extends MessageDecorator {
  private readonly customDate?: Date;

  constructor(wrappee: MessageComponent, customDate?: Date) {
    super(wrappee);
    this.customDate = customDate;
  }

  public getText(): string {
    const date = this.customDate || new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedDate = `${day}.${month}.${year} ${hours}:${minutes}`;

    return `${this.wrappee.getText()} [${formattedDate}]`;
  }
}

/**
 * SignatureDecorator:
 * Xabar oxiriga rasmiy imzo qo'shadi.
 */
export class SignatureDecorator extends MessageDecorator {
  private readonly signature: string;

  constructor(wrappee: MessageComponent, signature: string = "— NotifyHub jamoasi") {
    super(wrappee);
    this.signature = signature;
  }

  public getText(): string {
    return `${this.wrappee.getText()} ${this.signature}`;
  }
}

/**
 * EncryptDecorator:
 * Xabar matnini shifrlaydi (Base64 va shifr ko'rsatkichi bilan).
 */
export class EncryptDecorator extends MessageDecorator {
  public getText(): string {
    const originalText = this.wrappee.getText();
    const encoded = Buffer.from(originalText, "utf-8").toString("base64");
    return `[ENCRYPTED:${encoded}]`;
  }

  /**
   * Shifrlangan xabarni asliga qaytarish uchun yordamchi metod.
   */
  public static decrypt(cipherText: string): string {
    const match = cipherText.match(/\[ENCRYPTED:(.*?)\]/);
    if (match && match[1]) {
      return Buffer.from(match[1], "base64").toString("utf-8");
    }
    return cipherText;
  }
}

/**
 * UrgentDecorator:
 * Xabarni shoshilinch qiladi: barcha harflarni katta qilib, boshiga 🔴 belgisini qo'yadi.
 */
export class UrgentDecorator extends MessageDecorator {
  public getText(): string {
    const original = this.wrappee.getText();
    return `🔴 ${original.toUpperCase()}`;
  }
}
