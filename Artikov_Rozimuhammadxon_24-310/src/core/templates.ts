/**
 * PROTOTYPE pattern (bonus): saqlangan tarqatma shablonlari.
 *
 * «Haftalik eslatma» kabi tayyor tarqatmalar prototip sifatida saqlanadi.
 * Ishlatishda shablon `clone()` orqali nusxalanadi va nusxada faqat kerakli
 * maydon (matn yoki qabul qiluvchi) o'zgartiriladi. Asl shablon esa
 * o'zgarmay qoladi va keyingi safar yana ishlatiladi.
 *
 * Nusxa "yuza" (shallow) va "chuqur" qismlardan iborat:
 *   - extras ro'yxati yangi massivga ko'chiriladi (nusxada o'zgarsa, asl buzilmaydi);
 *   - recipient esa havola bo'yicha qoladi, chunki guruh real obyekt:
 *     uning a'zolari o'zgarsa, shablon ham yangilangan guruhga yuboradi.
 */

import { NotificationBuilder } from "./builder";
import type { Recipient } from "../recipients/recipients";

export interface Prototype<T> {
  clone(): T;
}

export interface TemplateData {
  name: string;
  description?: string;
  kind: string;
  locale: string;
  channel: string;
  recipient: Recipient;
  text: string;
  extras: string[];
}

export type TemplateChanges = Partial<Pick<TemplateData, "name" | "text" | "recipient" | "description">>;

export class DistributionTemplate implements Prototype<DistributionTemplate> {
  readonly name: string;
  readonly description?: string;
  readonly kind: string;
  readonly locale: string;
  readonly channel: string;
  readonly recipient: Recipient;
  readonly text: string;
  readonly extras: readonly string[];

  constructor(data: TemplateData) {
    // Shablon saqlanayotganda xato bo'lsa, darhol bilinsin (yuborishda emas).
    new NotificationBuilder()
      .type(data.kind)
      .locale(data.locale)
      .channel(data.channel)
      .text(data.text)
      .extras(data.extras);

    this.name = data.name.trim();
    this.description = data.description;
    this.kind = data.kind;
    this.locale = data.locale;
    this.channel = data.channel;
    this.recipient = data.recipient;
    this.text = data.text;
    this.extras = [...data.extras];
  }

  /** Nusxa yaratadi. Ixtiyoriy ravishda ayrim maydonlarni almashtiradi. */
  clone(changes: TemplateChanges = {}): DistributionTemplate {
    return new DistributionTemplate({
      name: this.name,
      description: this.description,
      kind: this.kind,
      locale: this.locale,
      channel: this.channel,
      recipient: this.recipient,
      text: this.text,
      extras: [...this.extras],
      ...changes,
    });
  }

  /** Shablon asosida to'ldirilgan Builder (Prototype + Builder hamkorligi). */
  toBuilder(): NotificationBuilder {
    return new NotificationBuilder()
      .type(this.kind)
      .locale(this.locale)
      .channel(this.channel)
      .to(this.recipient)
      .text(this.text)
      .extras(this.extras);
  }
}

/** Prototiplar ro'yxati. get() har doim asl shablonning nusxasini beradi. */
export class TemplateRegistry {
  private readonly prototypes = new Map<string, DistributionTemplate>();

  add(template: DistributionTemplate): void {
    const key = template.name.toLocaleLowerCase();
    if (!template.name) throw new Error("Shablon nomi bo'sh bo'lishi mumkin emas");
    if (this.prototypes.has(key)) throw new Error(`'${template.name}' nomli shablon allaqachon bor`);
    this.prototypes.set(key, template);
  }

  get(name: string): DistributionTemplate {
    const prototype = this.prototypes.get(name.trim().toLocaleLowerCase());
    if (!prototype) throw new Error(`'${name}' nomli shablon topilmadi`);
    return prototype.clone();
  }

  remove(name: string): boolean {
    return this.prototypes.delete(name.trim().toLocaleLowerCase());
  }

  list(): DistributionTemplate[] {
    return [...this.prototypes.values()];
  }
}
