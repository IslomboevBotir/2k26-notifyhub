import type { Channel } from "../channels/base.js";
import { ChannelFactory } from "../channels/factory.js";
import { getLocaleFactory, type LocaleFactory } from "../locales/factories.js";
import type { DecoratorOptions, Notification } from "../notifications/base.js";
import { createNotification } from "../notifications/types.js";
import type { RecipientComponent } from "../recipients/recipients.js";
import type {
  ChannelType,
  DecoratorKind,
  DispatchSummary,
  LocaleCode,
  NotificationType,
} from "../types.js";

/**
 * Tayyor yig'ilgan bildirishnoma topshirig'i (Builder.build() natijasi).
 */
export class PreparedNotification {
  private readonly notification: Notification;
  private readonly localeFactory: LocaleFactory;
  private readonly recipient: RecipientComponent;
  private readonly rawText: string;
  private readonly decorators: DecoratorKind[];
  private readonly options: DecoratorOptions;

  constructor(params: {
    notification: Notification;
    localeFactory: LocaleFactory;
    recipient: RecipientComponent;
    rawText: string;
    decorators: DecoratorKind[];
    options: DecoratorOptions;
  }) {
    this.notification = params.notification;
    this.localeFactory = params.localeFactory;
    this.recipient = params.recipient;
    this.rawText = params.rawText;
    this.decorators = [...params.decorators];
    this.options = { ...params.options };
  }

  public preview(): string {
    return this.notification.formatMessage(
      this.rawText,
      this.localeFactory,
      this.decorators,
      this.options
    );
  }

  public send(): DispatchSummary {
    return this.notification.send(
      this.recipient,
      this.rawText,
      this.localeFactory,
      this.decorators,
      this.options
    );
  }
}

/**
 * PATTERN: Builder (Quruvchi) — BONUS
 * Nima uchun ishlatilgan:
 *   Bildirishnoma yuborish uchun zarur bo'lgan ko'p qismli konfiguratsiyani
 *   (tur, til, kanal, qabul qiluvchi, matn va ixtiyoriy dekoratorlar zanjirini)
 *   bosqichma-bosqich, o'qishga qulay fluent interfeys orqali yig'adi.
 *
 * Misol:
 *   new NotificationBuilder()
 *     .type("alert")
 *     .locale("uz")
 *     .channel("sms")
 *     .to(group)
 *     .text("Serverda xatolik")
 *     .withTimestamp()
 *     .withSignature()
 *     .build()
 */
export class NotificationBuilder {
  private notificationType?: NotificationType;
  private localeCode: LocaleCode = "uz";
  private channelOrType?: ChannelType | Channel;
  private recipient?: RecipientComponent;
  private messageText = "";
  private decorators: DecoratorKind[] = [];
  private decoratorOptions: DecoratorOptions = {};

  public type(type: NotificationType): this {
    this.notificationType = type;
    return this;
  }

  public locale(locale: LocaleCode): this {
    this.localeCode = locale;
    return this;
  }

  public channel(channel: ChannelType | Channel): this {
    this.channelOrType = channel;
    return this;
  }

  public to(recipient: RecipientComponent): this {
    this.recipient = recipient;
    return this;
  }

  public text(text: string): this {
    this.messageText = text;
    return this;
  }

  public withTimestamp(date?: Date): this {
    this.decorators.push("timestamp");
    if (date) {
      this.decoratorOptions.date = date;
    }
    return this;
  }

  public withSignature(signature?: string): this {
    this.decorators.push("signature");
    if (signature !== undefined) {
      this.decoratorOptions.signature = signature;
    }
    return this;
  }

  public withEncrypt(mode: "base64" | "caesar" = "base64"): this {
    this.decorators.push("encrypt");
    this.decoratorOptions.encryptMode = mode;
    return this;
  }

  public withUrgent(): this {
    this.decorators.push("urgent");
    return this;
  }

  public addDecorators(list: readonly DecoratorKind[]): this {
    for (const kind of list) {
      this.decorators.push(kind);
    }
    return this;
  }

  public build(): PreparedNotification {
    if (!this.notificationType) {
      throw new Error("NotificationBuilder: bildirishnoma turi (type) ko'rsatilmagan.");
    }
    if (!this.channelOrType) {
      throw new Error("NotificationBuilder: kanal (channel) ko'rsatilmagan.");
    }
    if (!this.recipient) {
      throw new Error("NotificationBuilder: qabul qiluvchi (to) ko'rsatilmagan.");
    }
    if (!this.messageText.trim()) {
      throw new Error("NotificationBuilder: xabar matni (text) bo'sh bo'lishi mumkin emas.");
    }

    const resolvedChannel: Channel =
      typeof this.channelOrType === "string"
        ? ChannelFactory.create(this.channelOrType)
        : this.channelOrType;

    const notification = createNotification(this.notificationType, resolvedChannel);
    const localeFactory = getLocaleFactory(this.localeCode);

    return new PreparedNotification({
      notification,
      localeFactory,
      recipient: this.recipient,
      rawText: this.messageText,
      decorators: this.decorators,
      options: this.decoratorOptions,
    });
  }
}
