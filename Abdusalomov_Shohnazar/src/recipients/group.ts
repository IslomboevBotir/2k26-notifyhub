/**
 * @file recipients/group.ts
 * @pattern Composite Pattern - Composite
 */

import type { IRecipient } from './recipient.interface.ts';
import { User } from './user.ts';

export class Group implements IRecipient {
  private readonly name: string;
  private readonly children: IRecipient[] = [];

  constructor(name: string, initialChildren: IRecipient[] = []) {
    this.name = name;
    for (const child of initialChildren) {
      this.add(child);
    }
  }

  public getName(): string {
    return this.name;
  }

  public add(child: IRecipient): this {
    this.children.push(child);
    return this;
  }

  public remove(child: IRecipient): this {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
    return this;
  }

  public getChildren(): ReadonlyArray<IRecipient> {
    return this.children;
  }

  public getSubscribers(): User[] {
    const result: User[] = [];
    const seenContacts = new Set<string>();

    const collect = (recipient: IRecipient): void => {
      for (const subscriber of recipient.getSubscribers()) {
        if (!seenContacts.has(subscriber.getContactInfo())) {
          seenContacts.add(subscriber.getContactInfo());
          result.push(subscriber);
        }
      }
    };

    for (const child of this.children) {
      collect(child);
    }

    return result;
  }

  public describe(): string {
    const totalCount = this.getSubscribers().length;
    return `${this.name} [Guruh: ${this.children.length} ta to'g'ridan-to'g'ri element, jami ${totalCount} ta foydalanuvchi]`;
  }
}
