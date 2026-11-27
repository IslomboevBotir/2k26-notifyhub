/**
 * PATTERN: Composite (Tarkibiy / Kompozit) — BONUS
 * Nima uchun ishlatilgan:
 *   Qabul qiluvchilar bitta foydalanuvchi (User — barg/leaf) ham, ichida boshqa
 *   foydalanuvchilar va kichik guruhlarni saqlovchi guruh (Group — composite) ham
 *   bo'lishi mumkin. Ikkalasi bitta RecipientComponent interfeysini amalga oshiradi,
 *   shuning uchun guruhga yuborilgan xabar rekursiv tarzda barcha a'zolarga yetadi.
 */

export interface RecipientComponent {
  readonly name: string;
  getUsers(): User[];
  describe(indent?: number): string;
}

export class User implements RecipientComponent {
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

  public getUsers(): User[] {
    return [this];
  }

  public describe(indent = 0): string {
    const pad = "  ".repeat(indent);
    const tg = this.telegramHandle ? `, TG: ${this.telegramHandle}` : "";
    return `${pad}- ${this.name} (Tel: ${this.phone}${tg})`;
  }
}

export class Group implements RecipientComponent {
  public readonly name: string;
  private readonly members: RecipientComponent[] = [];

  constructor(name: string, initialMembers: RecipientComponent[] = []) {
    this.name = name;
    for (const member of initialMembers) {
      this.add(member);
    }
  }

  public add(component: RecipientComponent): void {
    this.members.push(component);
  }

  public remove(name: string): boolean {
    const idx = this.members.findIndex((m) => m.name.toLowerCase() === name.toLowerCase());
    if (idx === -1) {
      return false;
    }
    this.members.splice(idx, 1);
    return true;
  }

  /**
   * Rekursiv ravishda barcha guruh va foydalanuvchilarni yig'adi,
   * bir foydalanuvchiga xabar ikki marta ketmasligi uchun id bo'yicha noyoblaydi.
   */
  public getUsers(): User[] {
    const seen = new Set<string>();
    const result: User[] = [];

    for (const member of this.members) {
      for (const user of member.getUsers()) {
        if (!seen.has(user.id)) {
          seen.add(user.id);
          result.push(user);
        }
      }
    }

    return result;
  }

  public describe(indent = 0): string {
    const pad = "  ".repeat(indent);
    const lines = [`${pad}+ [Guruh] ${this.name} (${this.getUsers().length} ta foydalanuvchi)`];
    for (const member of this.members) {
      lines.push(member.describe(indent + 1));
    }
    return lines.join("\n");
  }
}

/**
 * Dastur ishga tushganda tayyor namunaviy qabul qiluvchilar (3-kurs -> 301-guruh, 302-guruh).
 */
export function createDefaultRecipients(): {
  users: User[];
  groups: Group[];
} {
  const ali = new User("u1", "Ali", "+998901112233", "@ali_dev");
  const vali = new User("u2", "Vali", "+998907778899", "@vali_uz");
  const malika = new User("u3", "Malika", "+998913334455", "@malika_m");
  const bobur = new User("u4", "Bobur", "not-a-phone", undefined); // Xato holatini test qilish uchun

  const group301 = new Group("301-guruh", [ali, vali]);
  const group302 = new Group("302-guruh", [malika]);
  const course3 = new Group("3-kurs", [group301, group302]);
  const allUsers = new Group("barcha", [course3, bobur]);

  return {
    users: [ali, vali, malika, bobur],
    groups: [course3, group301, group302, allUsers],
  };
}
