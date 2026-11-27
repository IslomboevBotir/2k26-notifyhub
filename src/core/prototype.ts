import type { RecipientComponent } from "../recipients/recipients.js";
import type {
  ChannelType,
  DecoratorKind,
  LocaleCode,
  NotificationType,
} from "../types.js";

/**
 * PATTERN: Prototype (Prototip) — BONUS
 * Nima uchun ishlatilgan:
 *   Tez-tez ishlatiladigan tarqatma shablonlarini ("Haftalik eslatma",
 *   "Texnik ogohlantirish") noldan sozlamasdan, clone() metodi orqali nusxalab
 *   olish va faqat matn yoki qabul qiluvchini o'zgartirish imkonini beradi.
 *   Asl shablon o'zgarishsiz qoladi.
 */
export interface Prototype<T> {
  clone(): T;
}

export class BroadcastTemplate implements Prototype<BroadcastTemplate> {
  public readonly id: string;
  public name: string;
  public type: NotificationType;
  public locale: LocaleCode;
  public channel: ChannelType;
  public recipient: RecipientComponent;
  public text: string;
  public decorators: DecoratorKind[];

  constructor(params: {
    id: string;
    name: string;
    type: NotificationType;
    locale: LocaleCode;
    channel: ChannelType;
    recipient: RecipientComponent;
    text: string;
    decorators?: DecoratorKind[];
  }) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
    this.locale = params.locale;
    this.channel = params.channel;
    this.recipient = params.recipient;
    this.text = params.text;
    this.decorators = [...(params.decorators ?? [])];
  }

  /**
   * Shablonning mustaqil nusxasini qaytaradi (decorators ro'yxati chuqur nusxalanadi).
   */
  public clone(): BroadcastTemplate {
    return new BroadcastTemplate({
      id: `${this.id}-copy`,
      name: `${this.name} (nusxa)`,
      type: this.type,
      locale: this.locale,
      channel: this.channel,
      recipient: this.recipient,
      text: this.text,
      decorators: [...this.decorators],
    });
  }

  public describe(): string {
    const decs = this.decorators.length > 0 ? this.decorators.join(", ") : "yo'q";
    return `[${this.name}] tur=${this.type}, til=${this.locale}, kanal=${this.channel}, qabul=${this.recipient.name}, qo'shimchalar=[${decs}], matn="${this.text}"`;
  }
}

export function createDefaultTemplates(
  findRecipient: (name: string) => RecipientComponent
): BroadcastTemplate[] {
  return [
    new BroadcastTemplate({
      id: "tpl-weekly",
      name: "Haftalik eslatma",
      type: "reminder",
      locale: "uz",
      channel: "telegram",
      recipient: findRecipient("3-kurs"),
      text: "Haftalik topshiriqlarni juma soat 18:00 gacha topshiring",
      decorators: ["timestamp", "signature"],
    }),
    new BroadcastTemplate({
      id: "tpl-maintenance",
      name: "Texnik ogohlantirish",
      type: "alert",
      locale: "uz",
      channel: "sms",
      recipient: findRecipient("301-guruh"),
      text: "Portalda texnik ishlar sababli 23:00 da uzilish bo'ladi",
      decorators: ["urgent", "timestamp"],
    }),
    new BroadcastTemplate({
      id: "tpl-promo",
      name: "Chegirma aksiyasi",
      type: "promo",
      locale: "en",
      channel: "console",
      recipient: findRecipient("barcha"),
      text: "50% discount on all programming courses this week!",
      decorators: ["signature"],
    }),
  ];
}
