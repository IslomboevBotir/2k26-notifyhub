/**
 * FACADE pattern (bonus).
 *
 * NotifyHub butun ichki tuzilmani (Builder, ChannelFactory, LocaleFactory,
 * dekoratorlar, Composite qidiruvi, Prototype reyestri, Singleton tarix)
 * bir nechta oddiy metod ortiga yashiradi:
 *
 *   hub.send({...}), hub.sendTemplate(...), hub.showHistory(), hub.showStats()
 *
 * Konsol menyusi (main.ts) faqat shu klass bilan ishlaydi. Ichki tuzilma
 * o'zgarsa ham menyu kodi o'zgarmaydi.
 */

import { NotificationBuilder, describeChain } from "./builder";
import { getEnvironment } from "./environment";
import { formatDateTime } from "./format";
import { NotificationHistory, type HistoryRecord, type Stats } from "./history";
import { DistributionTemplate, TemplateRegistry, type TemplateChanges } from "./templates";
import { EXTRA_NAMES, LOCALE_CODES, NOTIFICATION_KINDS } from "./types";
import { ChannelFactory } from "../channels/factory";
import type { SendReport } from "../notifications/base";
import { buildDefaultDirectory } from "../recipients/directory";
import type { Group, Recipient, User } from "../recipients/recipients";

export interface SendRequest {
  kind: string;
  locale: string;
  channel: string;
  recipient: string | Recipient;
  text: string;
  extras?: readonly string[];
}

export interface Preview {
  text: string;
  chain: string;
  users: User[];
}

export class NotifyHub {
  readonly directory: Group;
  readonly history = NotificationHistory.getInstance();
  readonly templates = new TemplateRegistry();

  constructor(directory: Group = buildDefaultDirectory()) {
    this.directory = directory;
    this.loadDefaultTemplates();
  }

  // --- Ma'lumotnomalar -----------------------------------------------------
  readonly kinds = NOTIFICATION_KINDS;
  readonly locales = LOCALE_CODES;
  readonly extras = EXTRA_NAMES;

  get channels(): string[] {
    return ChannelFactory.available();
  }

  findRecipient(name: string): Recipient {
    const found = this.directory.find(name);
    if (!found) throw new Error(`'${name}' nomli foydalanuvchi yoki guruh topilmadi`);
    return found;
  }

  listRecipients(): Recipient[] {
    return this.directory.walk();
  }

  // --- Yuborish ------------------------------------------------------------
  private builderFor(request: SendRequest): NotificationBuilder {
    const recipient =
      typeof request.recipient === "string" ? this.findRecipient(request.recipient) : request.recipient;
    return new NotificationBuilder()
      .type(request.kind)
      .locale(request.locale)
      .channel(request.channel)
      .to(recipient)
      .text(request.text)
      .extras(request.extras ?? []);
  }

  /** Yubormasdan oldin xabar qanday ko'rinishini va kimlarga borishini ko'rsatadi. */
  preview(request: SendRequest): Preview {
    const notification = this.builderFor(request).build();
    return {
      text: notification.render(),
      chain: describeChain(request.extras ?? []),
      users: notification.recipient?.getUsers() ?? [],
    };
  }

  send(request: SendRequest): SendReport {
    const notification = this.builderFor(request).build();
    const output = getEnvironment().output;
    output.write(
      `── ${notification.kind} · ${notification.locale.code} · ${notification.channel.name} → ${notification.recipient?.name} ──`,
      "muted",
    );
    const report = notification.send();
    this.reportResult(report);
    return report;
  }

  private reportResult(report: SendReport): void {
    const output = getEnvironment().output;
    if (report.total === 0) {
      output.write(`⚠️ '${report.target}' ichida birorta ham foydalanuvchi yo'q`, "error");
    } else {
      output.write(
        `${report.failed === 0 ? "✅" : "⚠️"} Yuborildi: ${report.total} tadan ${report.sent} tasi`,
        report.failed === 0 ? "success" : "error",
      );
    }
  }

  // --- Shablonlar (Prototype) ---------------------------------------------
  listTemplates(): DistributionTemplate[] {
    return this.templates.list();
  }

  /** Shablonni klon qiladi, kerakli maydonlarni almashtiradi va yuboradi. */
  sendTemplate(name: string, changes: { text?: string; recipient?: string | Recipient } = {}): SendReport {
    const cloneChanges: TemplateChanges = {};
    if (changes.text?.trim()) cloneChanges.text = changes.text;
    if (changes.recipient) {
      cloneChanges.recipient =
        typeof changes.recipient === "string" ? this.findRecipient(changes.recipient) : changes.recipient;
    }
    const copy = this.templates.get(name).clone(cloneChanges);
    return this.send({
      kind: copy.kind,
      locale: copy.locale,
      channel: copy.channel,
      recipient: copy.recipient,
      text: copy.text,
      extras: copy.extras,
    });
  }

  saveTemplate(name: string, request: SendRequest, description?: string): DistributionTemplate {
    const recipient =
      typeof request.recipient === "string" ? this.findRecipient(request.recipient) : request.recipient;
    const template = new DistributionTemplate({
      name,
      description,
      kind: request.kind,
      locale: request.locale,
      channel: request.channel,
      recipient,
      text: request.text,
      extras: [...(request.extras ?? [])],
    });
    this.templates.add(template);
    return template;
  }

  private loadDefaultTemplates(): void {
    this.saveTemplate(
      "Haftalik eslatma",
      {
        kind: "reminder",
        locale: "uz",
        channel: "telegram",
        recipient: "3-kurs",
        text: "Haftalik hisobotni juma kuni soat 18:00 gacha topshiring",
        extras: ["timestamp", "signature"],
      },
      "Har hafta talabalarga hisobot muddatini eslatish",
    );
    this.saveTemplate(
      "Server ishlamayapti",
      {
        kind: "alert",
        locale: "ru",
        channel: "console",
        recipient: "O'qituvchilar",
        text: "Сервер электронного журнала недоступен",
        extras: ["urgent", "timestamp"],
      },
      "Texnik nosozlik haqida shoshilinch ogohlantirish",
    );
    this.saveTemplate(
      "Chegirma aksiyasi",
      {
        kind: "promo",
        locale: "en",
        channel: "sms",
        recipient: "Hammasi",
        text: "50% discount on all courses this weekend!",
        extras: ["signature"],
      },
      "Barcha foydalanuvchilarga reklama SMS",
    );
  }

  // --- Tarix va statistika (Singleton) ------------------------------------
  getHistory(): readonly HistoryRecord[] {
    return this.history.getRecords();
  }

  getStats(): Stats {
    return this.history.getStats();
  }

  formatHistory(): string[] {
    const records = this.getHistory();
    if (records.length === 0) return ["Tarix hozircha bo'sh."];
    return [
      `--- Yuborilgan xabarlar tarixi (${records.length} ta) ---`,
      ...records.flatMap((r) => [
        `${String(r.id).padStart(3)}. ${r.success ? "✅" : "❌"} ${formatDateTime(r.sentAt, true)} | ` +
          `${r.kind.padEnd(8)} | ${r.channel.padEnd(8)} | ${r.locale} | ${r.recipient} (${r.target})`,
        `      ${r.text}`,
      ]),
    ];
  }

  formatStats(): string[] {
    const s = this.getStats();
    const row = (keys: readonly string[], bucket: Record<string, number>) =>
      "  " + keys.map((k) => `${k}: ${bucket[k] ?? 0}`).join(" | ");
    const failedDetails = Object.entries(s.failedByChannel)
      .map(([channel, n]) => `${channel}: ${n}`)
      .join(", ");
    return [
      `Jami yuborilgan: ${s.total} (muvaffaqiyatli: ${s.succeeded})`,
      row(this.channels, s.byChannel),
      row(this.kinds, s.byKind),
      row(this.locales, s.byLocale),
      `  Xatolar: ${s.failed}${failedDetails ? ` (${failedDetails})` : ""}`,
    ];
  }

  showHistory(): void {
    const output = getEnvironment().output;
    this.formatHistory().forEach((line) => output.write(line));
  }

  showStats(): void {
    const output = getEnvironment().output;
    this.formatStats().forEach((line) => output.write(line));
  }
}
