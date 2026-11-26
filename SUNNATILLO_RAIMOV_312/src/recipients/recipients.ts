/**
 * @file recipients/recipients.ts
 *
 * PATTERN: Composite (Tuzilmaviy / Structural) - Bonus Pattern (+1 ball)
 *
 * MAQSAD:
 * Bildirishnoma qabul qiluvchilarni daraxtsimon ierarxiyada birlashtirish.
 * Tizimda bitta foydalanuvchi (User - Leaf) ham, ko'plab foydalanuvchilar va ichki guruhlarni
 * o'z ichiga oluvchi guruh (Group - Composite) ham bir xil `Recipient` interfeysiga ega.
 * Bu orqali xabar yuboruvchi kod bitta shaxsga yuborayaptimi yoki bir necha guruhdan iborat
 * tashkilotgami — farq qilmasdan yagona interfeys orqali rekursiv tarzda xabar yuborishi mumkin.
 */

/**
 * Component (Umumiy interfeys):
 * Daraxtdagi barcha obyektlar (Leaf va Composite) uchun umumiy shartnoma.
 */
export interface Recipient {
  /** Qabul qiluvchi shaxs yoki guruh nomi */
  getName(): string;
  /** Qabul qiluvchi aloqa ma'lumoti (telefon yoki identifikator) */
  getContact(): string;
  /** Yakuniy foydalanuvchilar ro'yxatini rekursiv qaytarish */
  getUsers(): User[];
}

/**
 * Leaf (Barg elementi):
 * Alohida foydalanuvchi. Ichida boshqa qabul qiluvchilar bo'lmaydi.
 */
export class User implements Recipient {
  constructor(
    private readonly name: string,
    private readonly contact: string
  ) {}

  public getName(): string {
    return this.name;
  }

  public getContact(): string {
    return this.contact;
  }

  public getUsers(): User[] {
    return [this];
  }

  public toString(): string {
    return `User(${this.name}, ${this.contact})`;
  }
}

/**
 * Composite (Murakkab / Jamlovchi element):
 * Foydalanuvchilar (User) va boshqa guruhlarni (Group) o'zida saqlovchi guruh.
 * Rekursiv ravishda barcha ichki a'zolarni to'playdi.
 */
export class Group implements Recipient {
  private readonly members: Recipient[] = [];

  constructor(private readonly name: string) {}

  public getName(): string {
    return this.name;
  }

  public getContact(): string {
    return `[Guruh: ${this.name}]`;
  }

  public add(recipient: Recipient): this {
    if (!this.members.includes(recipient)) {
      this.members.push(recipient);
    }
    return this;
  }

  public remove(recipient: Recipient): this {
    const index = this.members.indexOf(recipient);
    if (index !== -1) {
      this.members.splice(index, 1);
    }
    return this;
  }

  public getMembers(): Recipient[] {
    return [...this.members];
  }

  /**
   * Rekursiv ravishda guruh ichidagi barcha foydalanuvchilarni to'playdi
   * va takrorlanmas (unikal) ro'yxat qaytaradi.
   */
  public getUsers(): User[] {
    const uniqueUsers: User[] = [];
    const seenContacts = new Set<string>();

    for (const member of this.members) {
      for (const user of member.getUsers()) {
        if (!seenContacts.has(user.getContact())) {
          seenContacts.add(user.getContact());
          uniqueUsers.push(user);
        }
      }
    }

    return uniqueUsers;
  }

  public toString(): string {
    return `Group(${this.name}, a'zolar soni: ${this.members.length})`;
  }
}
