/**
 * Oddiy qabul qiluvchi (Recipient) modeli.
 */
export class Recipient {
  public readonly id: string;
  public readonly name: string;
  public readonly phone: string;
  public readonly telegramHandle?: string;

  constructor(id: string, name: string, phone: string, telegramHandle?: string) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.telegramHandle = telegramHandle;
  }

  public describe(): string {
    const tg = this.telegramHandle ? `, TG: ${this.telegramHandle}` : "";
    return `- ${this.name} (Tel: ${this.phone}${tg})`;
  }
}

export function createDefaultRecipients(): Recipient[] {
  return [
    new Recipient("u1", "Ali", "+998901112233", "@ali_dev"),
    new Recipient("u2", "Vali", "+998907778899", "@vali_uz"),
    new Recipient("u3", "Malika", "+998913334455", "@malika_m"),
    new Recipient("u4", "Bobur", "not-a-phone", undefined),
  ];
}
