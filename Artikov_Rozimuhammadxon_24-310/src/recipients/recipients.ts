/**
 * COMPOSITE pattern (bonus).
 *
 * Nima uchun: xabar bitta foydalanuvchiga ham, guruhga ham, guruh ichidagi
 * guruhlarga ham («3-kurs» → «301-guruh», «302-guruh») yuborilishi mumkin.
 * Composite tufayli Notification.send() qabul qiluvchi kimligini bilmaydi:
 * u faqat getUsers() ni chaqiradi, guruh esa so'rovni rekursiv ravishda
 * barcha a'zolariga tarqatadi.
 *
 *   Recipient (komponent)
 *   ├── User   (barg)
 *   └── Group  (kompozit: ichida User va boshqa Group bo'lishi mumkin)
 */

const sameName = (a: string, b: string): boolean =>
  a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();

/** Composite komponenti: User va Group uchun umumiy interfeys. */
export abstract class Recipient {
  readonly name: string;

  protected constructor(name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Qabul qiluvchi nomi bo'sh bo'lishi mumkin emas");
    this.name = trimmed;
  }

  /** Shu qabul qiluvchi orqali yetib boriladigan barcha foydalanuvchilar. */
  abstract getUsers(): User[];

  /** Tuzilmani daraxt ko'rinishida chiqarish uchun qatorlar. */
  abstract tree(level?: number): string[];

  /** O'zi va ichidagi barcha qabul qiluvchilar (ro'yxatlar uchun). */
  abstract walk(): Recipient[];

  find(name: string): Recipient | undefined {
    return sameName(this.name, name) ? this : undefined;
  }

  contains(other: Recipient): boolean {
    return this === other;
  }
}

/** Composite bargi: aniq bitta odam va uning aloqa ma'lumotlari. */
export class User extends Recipient {
  constructor(
    name: string,
    readonly phone?: string,
    readonly telegram?: string,
  ) {
    super(name);
  }

  getUsers(): User[] {
    return [this];
  }

  walk(): Recipient[] {
    return [this];
  }

  tree(level = 0): string[] {
    const contacts = [this.phone, this.telegram].filter(Boolean).join(", ") || "aloqa yo'q";
    return [`${"    ".repeat(level)}👤 ${this.name} (${contacts})`];
  }
}

/** Composite kompozit: foydalanuvchilar va ichki guruhlar to'plami. */
export class Group extends Recipient {
  private readonly members: Recipient[] = [];

  constructor(name: string, members: Recipient[] = []) {
    super(name);
    members.forEach((m) => this.add(m));
  }

  getMembers(): readonly Recipient[] {
    return this.members;
  }

  add(member: Recipient): this {
    // Guruhni o'z-o'ziga (bevosita yoki bilvosita) qo'shish cheksiz rekursiyaga olib keladi.
    if (member.contains(this)) {
      throw new Error(`'${member.name}' ni '${this.name}' ga qo'shib bo'lmaydi: sikl hosil bo'ladi`);
    }
    this.members.push(member);
    return this;
  }

  remove(member: Recipient): void {
    const index = this.members.indexOf(member);
    if (index >= 0) this.members.splice(index, 1);
  }

  override contains(other: Recipient): boolean {
    return this === other || this.members.some((m) => m.contains(other));
  }

  getUsers(): User[] {
    // Rekursiv yig'ish. Bir odam ikki guruhda bo'lsa, xabar unga bir marta boradi.
    const unique = new Set<User>();
    for (const member of this.members) {
      for (const user of member.getUsers()) unique.add(user);
    }
    return [...unique];
  }

  override find(name: string): Recipient | undefined {
    if (super.find(name)) return this;
    for (const member of this.members) {
      const found = member.find(name);
      if (found) return found;
    }
    return undefined;
  }

  walk(): Recipient[] {
    return [this, ...this.members.flatMap((m) => m.walk())];
  }

  tree(level = 0): string[] {
    return [
      `${"    ".repeat(level)}👥 ${this.name} (${this.getUsers().length} kishi)`,
      ...this.members.flatMap((m) => m.tree(level + 1)),
    ];
  }
}
