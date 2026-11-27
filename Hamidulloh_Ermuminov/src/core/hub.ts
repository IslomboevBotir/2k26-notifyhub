import {
  createDefaultRecipients,
  Group,
  User,
  type RecipientComponent,
} from "../recipients/recipients.js";
import type {
  ChannelType,
  DecoratorKind,
  DispatchSummary,
  LocaleCode,
  NotificationType,
} from "../types.js";
import { NotificationBuilder } from "./builder.js";
import { NotificationHistory } from "./history.js";
import { BroadcastTemplate, createDefaultTemplates } from "./prototype.js";

export interface SendNotificationInput {
  type: NotificationType;
  locale: LocaleCode;
  channel: ChannelType;
  recipientName: string;
  text: string;
  decorators?: DecoratorKind[];
}

/**
 * PATTERN: Facade (Fasad) — BONUS
 * Nima uchun ishlatilgan:
 *   main.ts (konsol menyusi) uchun yagona va sodda interfeys taqdim etadi:
 *   send(), showHistory(), showStats(), sendFromTemplate() va boshqa metodlar
 *   orqali ichki Builder, Factory, Bridge, Adapter, Decorator, Composite, Prototype
 *   hamda Singleton mexanizmlarini tashqi koddan yashiradi.
 */
export class NotifyHub {
  private readonly users: User[] = [];
  private readonly groups: Group[] = [];
  private readonly templates: BroadcastTemplate[] = [];
  private readonly history: NotificationHistory;

  constructor() {
    this.history = NotificationHistory.getInstance();
    const defaults = createDefaultRecipients();
    this.users.push(...defaults.users);
    this.groups.push(...defaults.groups);
    this.templates.push(
      ...createDefaultTemplates((name) => {
        const found = this.findRecipient(name);
        if (!found) {
          throw new Error(`Standart shablon uchun qabul qiluvchi topilmadi: ${name}`);
        }
        return found;
      })
    );
  }

  public send(input: SendNotificationInput): DispatchSummary {
    const recipient = this.findRecipient(input.recipientName);
    if (!recipient) {
      throw new Error(`Qabul qiluvchi topilmadi: "${input.recipientName}"`);
    }

    const prepared = new NotificationBuilder()
      .type(input.type)
      .locale(input.locale)
      .channel(input.channel)
      .to(recipient)
      .text(input.text)
      .addDecorators(input.decorators ?? [])
      .build();

    return prepared.send();
  }

  public showHistory(): string {
    return this.history.formatHistory();
  }

  public showStats(): string {
    return this.history.formatStats();
  }

  public listTemplates(): readonly BroadcastTemplate[] {
    return this.templates;
  }

  public sendFromTemplate(
    templateIndex: number,
    overrides?: { text?: string; recipientName?: string }
  ): DispatchSummary {
    const original = this.templates[templateIndex];
    if (!original) {
      throw new Error(`Shablon topilmadi (indeks: ${templateIndex + 1})`);
    }

    // Prototype pattern: asl shablon o'zgarmasligi uchun clone() qilamiz
    const cloned = original.clone();
    if (overrides?.text?.trim()) {
      cloned.text = overrides.text.trim();
    }
    if (overrides?.recipientName?.trim()) {
      const customRecipient = this.findRecipient(overrides.recipientName.trim());
      if (!customRecipient) {
        throw new Error(`Qabul qiluvchi topilmadi: "${overrides.recipientName}"`);
      }
      cloned.recipient = customRecipient;
    }

    const prepared = new NotificationBuilder()
      .type(cloned.type)
      .locale(cloned.locale)
      .channel(cloned.channel)
      .to(cloned.recipient)
      .text(cloned.text)
      .addDecorators(cloned.decorators)
      .build();

    return prepared.send();
  }

  public findRecipient(name: string): RecipientComponent | undefined {
    const normalized = name.trim().toLowerCase();
    return (
      this.groups.find((g) => g.name.toLowerCase() === normalized) ??
      this.users.find((u) => u.name.toLowerCase() === normalized)
    );
  }

  public listRecipientsTree(): string {
    const groupLines = this.groups.map((g) => g.describe());
    const userLines = this.users.map((u) => u.describe());
    return [
      "Guruhlar:",
      ...groupLines,
      "",
      "Barcha foydalanuvchilar:",
      ...userLines,
    ].join("\n");
  }

  public addUser(
    name: string,
    phone: string,
    telegramHandle?: string,
    groupName?: string
  ): User {
    const id = `u${this.users.length + 1}`;
    const user = new User(id, name.trim(), phone.trim(), telegramHandle?.trim() || undefined);
    this.users.push(user);

    const allGroup = this.groups.find((g) => g.name.toLowerCase() === "barcha");
    if (allGroup) {
      allGroup.add(user);
    }

    if (groupName?.trim()) {
      let targetGroup = this.groups.find(
        (g) => g.name.toLowerCase() === groupName.trim().toLowerCase()
      );
      if (!targetGroup) {
        targetGroup = new Group(groupName.trim());
        this.groups.push(targetGroup);
      }
      targetGroup.add(user);
    }

    return user;
  }
}
