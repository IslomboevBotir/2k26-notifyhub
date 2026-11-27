/**
 * BUILDER pattern (bonus).
 *
 * Bildirishnoma yig'ish ko'p qadamli ish: tur, til, kanal, qabul qiluvchi,
 * matn va istalgan tartibdagi dekoratorlar kerak. Builder bu qadamlarni
 * o'qilishi oson zanjirga aylantiradi, maydonlarni tekshiradi va oxirida
 * tayyor Notification obyektini qaytaradi:
 *
 *   new NotificationBuilder()
 *     .type("alert").locale("uz").channel("sms").to(group)
 *     .text("Server ishlamayapti").withTimestamp().build();
 *
 * Builder boshqa patternlarni bog'laydi: kanalni Factory Method orqali,
 * tilni Abstract Factory orqali yaratadi va dekoratorlar zanjirini tuzadi.
 */

import type { Channel } from "../channels/base";
import { ChannelFactory } from "../channels/factory";
import {
  EncryptDecorator,
  SignatureDecorator,
  TimestampDecorator,
  UrgentDecorator,
  type EncryptMethod,
} from "../decorators/messageDecorators";
import { getLocaleFactory, type LocaleFactory } from "../locales/factories";
import type { DecoratorFactory, Notification } from "../notifications/base";
import { NOTIFICATION_CLASSES } from "../notifications/types";
import type { Recipient } from "../recipients/recipients";
import {
  EXTRA_NAMES,
  LOCALE_CODES,
  NOTIFICATION_KINDS,
  isExtraName,
  isLocaleCode,
  isNotificationKind,
  type ExtraName,
  type LocaleCode,
  type NotificationKind,
} from "./types";

// ---------------------------------------------------------------------------
// Qo'shimchalar (extras): "timestamp", "signature", "encrypt", "encrypt:base64", "urgent"
// ---------------------------------------------------------------------------
export interface ParsedExtra {
  name: ExtraName;
  option?: string;
}

export function parseExtra(spec: string): ParsedExtra {
  const [rawName, option] = spec.trim().toLowerCase().split(":");
  if (!isExtraName(rawName)) {
    throw new Error(`Noma'lum qo'shimcha: '${spec.trim()}'. Mavjudlari: ${EXTRA_NAMES.join(", ")}`);
  }
  if (rawName === "encrypt" && option && option !== "caesar" && option !== "base64") {
    throw new Error(`Shifrlash usuli 'caesar' yoki 'base64' bo'lishi kerak, '${option}' emas`);
  }
  return option ? { name: rawName, option } : { name: rawName };
}

/** "timestamp, signature" kabi satrni tekshirilgan ro'yxatga aylantiradi. */
export function parseExtras(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((spec) => {
      const { name, option } = parseExtra(spec);
      return option ? `${name}:${option}` : name;
    });
}

const DECORATOR_NAMES: Record<ExtraName, string> = {
  timestamp: "Timestamp",
  signature: "Signature",
  encrypt: "Encrypt",
  urgent: "Urgent",
};

/** Dekoratorlar zanjirini matn ko'rinishida beradi: Signature(Timestamp(Message)). */
export function describeChain(extras: readonly string[]): string {
  return extras.reduce((inner, spec) => `${DECORATOR_NAMES[parseExtra(spec).name]}(${inner})`, "Message");
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------
export class NotificationBuilder {
  private kindValue?: NotificationKind;
  private localeValue: LocaleCode = "uz";
  private channelValue?: string | Channel;
  private recipientValue?: Recipient;
  private textValue = "";
  private extrasValue: string[] = [];

  type(kind: string): this {
    const value = kind.trim().toLowerCase();
    if (!isNotificationKind(value)) {
      throw new Error(`Noma'lum tur: '${kind}'. Mavjudlari: ${NOTIFICATION_KINDS.join(", ")}`);
    }
    this.kindValue = value;
    return this;
  }

  locale(code: string): this {
    const value = code.trim().toLowerCase();
    if (!isLocaleCode(value)) {
      throw new Error(`Noma'lum til: '${code}'. Mavjudlari: ${LOCALE_CODES.join(", ")}`);
    }
    this.localeValue = value;
    return this;
  }

  /** Kanal nomi ("sms") yoki tayyor kanal obyekti. */
  channel(channel: string | Channel): this {
    if (typeof channel === "string") ChannelFactory.create(channel); // nomni darhol tekshirish
    this.channelValue = channel;
    return this;
  }

  to(recipient: Recipient): this {
    this.recipientValue = recipient;
    return this;
  }

  text(text: string): this {
    this.textValue = text;
    return this;
  }

  withTimestamp(): this {
    return this.extra("timestamp");
  }

  withSignature(): this {
    return this.extra("signature");
  }

  withEncryption(method: EncryptMethod = "caesar"): this {
    return this.extra(method === "caesar" ? "encrypt" : `encrypt:${method}`);
  }

  urgent(): this {
    return this.extra("urgent");
  }

  /** Bir nechta qo'shimchani berilgan tartibda qo'shadi. */
  extras(specs: Iterable<string>): this {
    for (const spec of specs) this.extra(spec);
    return this;
  }

  private extra(spec: string): this {
    parseExtra(spec);
    this.extrasValue.push(spec.trim().toLowerCase());
    return this;
  }

  build(): Notification {
    if (!this.kindValue) throw new Error("Bildirishnoma turi tanlanmagan");
    if (!this.channelValue) throw new Error("Kanal tanlanmagan");
    if (!this.textValue.trim()) throw new Error("Xabar matni bo'sh");

    const factory = getLocaleFactory(this.localeValue); // Abstract Factory
    const channel =
      typeof this.channelValue === "string" ? ChannelFactory.create(this.channelValue) : this.channelValue; // Factory Method
    const NotificationClass = NOTIFICATION_CLASSES[this.kindValue];

    return new NotificationClass({
      channel,
      text: this.textValue,
      locale: factory,
      recipient: this.recipientValue,
      decorators: this.extrasValue.map((spec) => NotificationBuilder.decoratorFor(spec, factory)),
    });
  }

  /** Qo'shimcha nomini dekorator yaratuvchi funksiyaga aylantiradi. */
  static decoratorFor(spec: string, factory: LocaleFactory): DecoratorFactory {
    const { name, option } = parseExtra(spec);
    switch (name) {
      case "timestamp":
        return (inner) => new TimestampDecorator(inner);
      case "signature":
        // Imzo xabar tilida bo'ladi, chunki u ham shu fabrikadan olinadi.
        return (inner) => new SignatureDecorator(inner, factory.createSignature());
      case "encrypt":
        return (inner) => new EncryptDecorator(inner, (option as EncryptMethod | undefined) ?? "caesar");
      case "urgent":
        return (inner) => new UrgentDecorator(inner);
    }
  }
}
