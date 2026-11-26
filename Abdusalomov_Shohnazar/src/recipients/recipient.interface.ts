/**
 * @file recipients/recipient.interface.ts
 * @pattern Composite Pattern - Component
 */

import type { User } from './user.ts';

export interface IRecipient {
  getName(): string;
  getSubscribers(): User[];
  describe(): string;
}
