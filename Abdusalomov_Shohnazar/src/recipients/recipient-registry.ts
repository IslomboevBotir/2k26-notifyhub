/**
 * @file recipients/recipient-registry.ts
 * @description
 * Qabul qiluvchilar (Foydalanuvchilar va Guruhlar) ombori.
 *
 * Topshiriq konsol misoliga to'liq mos keluvchi iyerarxiya:
 * «3-kurs» (Guruh)
 * ├── 301-guruh (Guruh)
 * │   └── Ali (+998901112233)
 * └── 302-guruh (Guruh)
 *     └── Vali (+998907778899)
 *
 * [SMS → +998901112233] Eslatma: ...
 * [SMS → +998907778899] Eslatma: ...
 * ✅ Yuborildi: 2 tadan 2 tasi
 */

import type { IRecipient } from './recipient.interface.ts';
import { User } from './user.ts';
import { Group } from './group.ts';

export class RecipientRegistry {
  private readonly recipients: Map<string, IRecipient> = new Map();

  constructor() {
    this.seedDefaultRecipients();
  }

  private seedDefaultRecipients(): void {
    // Topshiriqdagi 3-kurs talabalari
    const ali = new User('Ali', '+998901112233');
    const vali = new User('Vali', '+998907778899');

    // Boshqa guruhlar uchun talabalar
    const olim = new User('Olim', '+998901234567');
    const madina = new User('Madina', '+998935554433');
    const sardor = new User('Sardor', '+998971239988');

    // Composite: 3-kurs -> 301-guruh (Ali) va 302-guruh (Vali)
    const group301 = new Group('301-guruh', [ali]);
    const group302 = new Group('302-guruh', [vali]);
    const course3 = new Group('3-kurs', [group301, group302]);

    // Qo'shimcha guruhlar
    const group303 = new Group('303-guruh', [olim, madina]);
    const teachers = new Group('O\'qituvchilar', [sardor]);

    // Reestrga saqlash
    this.register(ali);
    this.register(vali);
    this.register(olim);
    this.register(madina);
    this.register(sardor);
    this.register(group301);
    this.register(group302);
    this.register(course3);
    this.register(group303);
    this.register(teachers);
  }

  public register(recipient: IRecipient): void {
    this.recipients.set(recipient.getName().toLowerCase(), recipient);
  }

  public find(name: string): IRecipient | undefined {
    return this.recipients.get(name.trim().toLowerCase());
  }

  public getAll(): IRecipient[] {
    return Array.from(this.recipients.values());
  }

  public getGroups(): Group[] {
    return this.getAll().filter((r): r is Group => r instanceof Group);
  }

  public getUsers(): User[] {
    return this.getAll().filter((r): r is User => r instanceof User);
  }

  public createUser(name: string, contactInfo: string): User {
    const user = new User(name, contactInfo);
    this.register(user);
    return user;
  }

  public createGroup(name: string, initialChildren: IRecipient[] = []): Group {
    const group = new Group(name, initialChildren);
    this.register(group);
    return group;
  }
}
