/**
 * @file recipients/user.ts
 * @pattern Composite Pattern - Leaf
 */

import type { IRecipient } from './recipient.interface.ts';

export class User implements IRecipient {
  private readonly name: string;
  private readonly contactInfo: string;

  constructor(name: string, contactInfo: string) {
    this.name = name;
    this.contactInfo = contactInfo;
  }

  public getName(): string {
    return this.name;
  }

  public getContactInfo(): string {
    return this.contactInfo;
  }

  public getSubscribers(): User[] {
    return [this];
  }

  public describe(): string {
    return `${this.name} (${this.contactInfo})`;
  }
}
