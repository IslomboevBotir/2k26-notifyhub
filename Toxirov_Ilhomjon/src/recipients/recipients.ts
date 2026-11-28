// Composite: bitta foydalanuvchi va ichma-ich guruhlar bir xil usulda ochiladi.
export interface Recipient {
  readonly name: string;
  getUsers(): UserRecipient[];
}

export class UserRecipient implements Recipient {
  readonly name: string;
  readonly address: string;

  constructor(
    name: string,
    address: string,
  ) {
    this.name = name;
    this.address = address;
  }

  getUsers(): UserRecipient[] {
    return [this];
  }
}

export class GroupRecipient implements Recipient {
  readonly name: string;
  private readonly members: Recipient[];

  constructor(
    name: string,
    members: Recipient[],
  ) {
    this.name = name;
    this.members = members;
  }

  getUsers(): UserRecipient[] {
    return this.members.flatMap((member) => member.getUsers());
  }
}

export function createExampleGroups(): Map<string, Recipient> {
  const group301 = new GroupRecipient("301-guruh", [
    new UserRecipient("Ali", "+998901112233"),
  ]);
  const group302 = new GroupRecipient("302-guruh", [
    new UserRecipient("Vali", "+998907778899"),
  ]);

  return new Map([
    ["301-guruh", group301],
    ["302-guruh", group302],
    ["3-kurs", new GroupRecipient("3-kurs", [group301, group302])],
  ]);
}
