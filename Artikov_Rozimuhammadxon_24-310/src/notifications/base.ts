/**
 * BRIDGE pattern: abstraksiya (Abstraction) tomoni.
 *
 *   Notification (abstraksiya)         Channel (realizatsiya)
 *   ├── AlertNotification              ├── ConsoleChannel
 *   ├── ReminderNotification   ──▶     ├── FileChannel
 *   └── PromoNotification              ├── TelegramChannel
 *                                      └── SmsChannelAdapter
 *
 * Notification NIMA yuborilishini biladi (tur, til shabloni, dekoratorlar),
 * yuborish ishini esa kanalga topshiradi (`this.channel.send(...)`). Ikki
 * ierarxiya bir-biridan mustaqil o'zgaradi: 3 tur × 4 kanal uchun 12 ta
 * klass o'rniga 3 + 4 = 7 ta klass yetarli.
 *
 * Bu klassda boshqa patternlar ham birlashadi:
 *   - shablonni Abstract Factory (LocaleFactory) beradi;
 *   - tayyor matnni Decorator zanjiri o'raydi;
 *   - qabul qiluvchi Composite (User yoki Group) bo'ladi;
 *   - natija Singleton (NotificationHistory) ga yoziladi.
 */

import type { Channel } from "../channels/base";
import { NotificationHistory } from "../core/history";
import type { NotificationKind } from "../core/types";
import { Message, type MessageComponent } from "../decorators/messageDecorators";
import { UzFactory, type LocaleFactory, type MessageTemplate } from "../locales/factories";
import type { Recipient } from "../recipients/recipients";

/** Xabarni dekorator bilan o'rovchi funksiya (Builder shularni tayyorlaydi). */
export type DecoratorFactory = (inner: MessageComponent) => MessageComponent;

export interface NotificationOptions {
  channel: Channel;
  text?: string;
  locale?: LocaleFactory;
  recipient?: Recipient;
  decorators?: DecoratorFactory[];
}

export interface SendReport {
  target: string;
  total: number;
  sent: number;
  failed: number;
  text: string;
}

export abstract class Notification {
  abstract readonly kind: NotificationKind;

  readonly channel: Channel;
  readonly text: string;
  readonly locale: LocaleFactory;
  readonly recipient?: Recipient;
  readonly decorators: readonly DecoratorFactory[];

  constructor({ channel, text = "", locale = new UzFactory(), recipient, decorators = [] }: NotificationOptions) {
    this.channel = channel;
    this.text = text;
    this.locale = locale;
    this.recipient = recipient;
    this.decorators = [...decorators];
  }

  /**
   * Har bir tur fabrikadan o'ziga mos shablonni so'raydi.
   * Notification qaysi til ekanini bilmaydi, uni fabrika hal qiladi.
   */
  protected abstract createTemplate(factory: LocaleFactory): MessageTemplate;

  /** Shablon → Message → dekoratorlar zanjiri. */
  compose(): MessageComponent {
    const base: MessageComponent = new Message(this.createTemplate(this.locale).render(this.text));
    return this.decorators.reduce<MessageComponent>((message, wrap) => wrap(message), base);
  }

  render(): string {
    return this.compose().render();
  }

  /** Bridge: yuborish ishi kanalga topshiriladi. Har bir urinish tarixga yoziladi. */
  send(recipient: Recipient | undefined = this.recipient): SendReport {
    if (!recipient) throw new Error("Qabul qiluvchi ko'rsatilmagan");

    const text = this.render(); // hamma uchun bir xil matn (vaqt belgisi ham bir xil)
    const users = recipient.getUsers(); // Composite: guruh bo'lsa rekursiv ochiladi
    const history = NotificationHistory.getInstance();

    let sent = 0;
    for (const user of users) {
      const success = this.channel.send(user, text, this.kind);
      history.record({
        kind: this.kind,
        channel: this.channel.name,
        locale: this.locale.code,
        recipient: user.name,
        target: recipient.name,
        text,
        success,
      });
      if (success) sent++;
    }
    return { target: recipient.name, total: users.length, sent, failed: users.length - sent, text };
  }
}
