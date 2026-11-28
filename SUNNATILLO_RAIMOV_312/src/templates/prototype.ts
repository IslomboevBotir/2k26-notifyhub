/**
 * @file templates/prototype.ts
 *
 * PATTERN: Prototype (Yaratuvchi / Creational) - Bonus Pattern (+1 ball)
 *
 * MAQSAD:
 * Mavjud obyektlarni ularning klassiga bog'lanmagan holda nusxalash (klonlash).
 * Saqlangan tarqatma shablonlari (masalan, «Haftalik eslatma») `clone()` metodi
 * orqali klonlanadi. Olingan nusxada faqat kerakli parametrlar (masalan, matn yoki
 * qabul qiluvchi) o'zgartiriladi va qayta ishlatiladi.
 *
 * Misol:
 * const base = registry.get("Haftalik eslatma");
 * const copy = base.clone({ content: "Dars soat 10:00 da" });
 */

export interface BroadcastTemplateProps {
  id: string;
  name: string;
  type: "alert" | "reminder" | "promo";
  locale: "uz" | "ru" | "en";
  channel: "console" | "file" | "telegram" | "sms";
  content: string;
  recipientName: string;
  decorators: ("timestamp" | "signature" | "encrypt" | "urgent")[];
}

export interface Prototype<T> {
  clone(overrides?: Partial<BroadcastTemplateProps>): T;
}

export class BroadcastTemplate implements Prototype<BroadcastTemplate>, BroadcastTemplateProps {
  public id: string;
  public name: string;
  public type: "alert" | "reminder" | "promo";
  public locale: "uz" | "ru" | "en";
  public channel: "console" | "file" | "telegram" | "sms";
  public content: string;
  public recipientName: string;
  public decorators: ("timestamp" | "signature" | "encrypt" | "urgent")[];

  constructor(props: BroadcastTemplateProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.locale = props.locale;
    this.channel = props.channel;
    this.content = props.content;
    this.recipientName = props.recipientName;
    this.decorators = [...props.decorators];
  }

  /**
   * Prototype pattern ning asosiy metodi:
   * Joriy obyektning chuqur nusxasini (deep copy) yaratadi va berilgan
   * maydonlarni (overrides) yangilaydi.
   */
  public clone(overrides?: Partial<BroadcastTemplateProps>): BroadcastTemplate {
    return new BroadcastTemplate({
      id: overrides?.id || `${this.id}_clone_${Date.now()}`,
      name: overrides?.name || `${this.name} (nusxa)`,
      type: overrides?.type || this.type,
      locale: overrides?.locale || this.locale,
      channel: overrides?.channel || this.channel,
      content: overrides?.content !== undefined ? overrides.content : this.content,
      recipientName: overrides?.recipientName || this.recipientName,
      decorators: overrides?.decorators ? [...overrides.decorators] : [...this.decorators],
    });
  }

  public toString(): string {
    return `[Shablon: ${this.name}] (${this.type.toUpperCase()}, ${this.locale}, ${this.channel}) -> Matn: "${this.content}"`;
  }
}

/**
 * Tayyor shablon prototiplarini saqlovchi va boshqaruvchi reestr.
 */
export class TemplateRegistry {
  private readonly templates = new Map<string, BroadcastTemplate>();

  constructor() {
    this.seedDefaultTemplates();
  }

  private seedDefaultTemplates(): void {
    // 1. Haftalik eslatma
    this.register(
      new BroadcastTemplate({
        id: "tpl_weekly_reminder",
        name: "Haftalik eslatma",
        type: "reminder",
        locale: "uz",
        channel: "sms",
        content: "Ertaga haftalik oraliq nazorat soat 09:00 da bo'lib o'tadi",
        recipientName: "3-kurs",
        decorators: ["timestamp", "signature"],
      })
    );

    // 2. Tizim xavfsizligi ogohlantirishi
    this.register(
      new BroadcastTemplate({
        id: "tpl_security_alert",
        name: "Xavfsizlik ogohlantirishi",
        type: "alert",
        locale: "uz",
        channel: "telegram",
        content: "Tizimda profilaktika ishlari olib borilmoqda. Kirish cheklanishi mumkin.",
        recipientName: "Barcha talabalar",
        decorators: ["urgent", "timestamp", "signature"],
      })
    );

    // 3. Yangi chegirma aksiyasi
    this.register(
      new BroadcastTemplate({
        id: "tpl_course_promo",
        name: "Aksiya xabarnomasi",
        type: "promo",
        locale: "uz",
        channel: "console",
        content: "Yangi kurslarga 30% chegirma e'lon qilindi! Shoshiling!",
        recipientName: "301-guruh",
        decorators: ["signature"],
      })
    );
  }

  public register(template: BroadcastTemplate): void {
    this.templates.set(template.id, template);
  }

  public get(id: string): BroadcastTemplate | undefined {
    return this.templates.get(id);
  }

  public getAll(): BroadcastTemplate[] {
    return Array.from(this.templates.values());
  }
}
