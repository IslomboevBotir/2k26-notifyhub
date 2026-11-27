import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import type { Channel } from "./channels/base.js";
import { ConsoleChannel } from "./channels/console.js";
import { FileChannel } from "./channels/file.js";
import { LegacySmsGateway, SmsChannelAdapter } from "./channels/sms_adapter.js";
import { TelegramChannel } from "./channels/telegram.js";
import { NotificationHistory } from "./core/history.js";
import { getLocaleFactory } from "./locales/factories.js";
import { createNotification } from "./notifications/types.js";
import { createDefaultRecipients, Recipient } from "./recipients/recipients.js";
import type {
  ChannelType,
  DecoratorKind,
  LocaleCode,
  NotificationType,
} from "./types.js";

const VALID_TYPES: readonly NotificationType[] = ["alert", "reminder", "promo"];
const VALID_LOCALES: readonly LocaleCode[] = ["uz", "ru", "en"];
const VALID_CHANNELS: readonly ChannelType[] = ["console", "file", "telegram", "sms"];
const VALID_DECORATORS: readonly DecoratorKind[] = [
  "timestamp",
  "signature",
  "encrypt",
  "urgent",
];

class PromptReader {
  private readonly rl: readline.Interface;
  private readonly lineQueue: string[] = [];
  private readonly waiters: Array<(line: string | null) => void> = [];
  private closed = false;

  constructor() {
    this.rl = readline.createInterface({ input, crlfDelay: Infinity });
    this.rl.on("line", (line) => {
      const waiter = this.waiters.shift();
      if (waiter) {
        waiter(line);
      } else {
        this.lineQueue.push(line);
      }
    });
    this.rl.on("close", () => {
      this.closed = true;
      while (this.waiters.length > 0) {
        const waiter = this.waiters.shift();
        waiter?.(null);
      }
    });
  }

  public async question(promptText: string): Promise<string | null> {
    output.write(promptText);
    if (this.lineQueue.length > 0) {
      return this.lineQueue.shift() ?? null;
    }
    if (this.closed) {
      return null;
    }
    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }

  public close(): void {
    this.rl.close();
  }
}

async function askRequired(reader: PromptReader, promptText: string): Promise<string> {
  const answer = await reader.question(promptText);
  if (answer === null) {
    throw new Error("Kiritish oqimi yopildi.");
  }
  return answer;
}

function parseChoice<T extends string>(raw: string, allowed: readonly T[], label: string): T {
  const val = raw.trim().toLowerCase() as T;
  if (!allowed.includes(val)) {
    throw new Error(`Noto'g'ri ${label}: "${raw}". Mumkin bo'lganlar: ${allowed.join(", ")}`);
  }
  return val;
}

function parseDecorators(raw: string): DecoratorKind[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }
  return trimmed
    .split(",")
    .map((item) => parseChoice(item, VALID_DECORATORS, "qo'shimcha"));
}

function resolveChannel(channelType: ChannelType): Channel {
  switch (channelType) {
    case "console":
      return new ConsoleChannel();
    case "file":
      return new FileChannel();
    case "telegram":
      return new TelegramChannel();
    case "sms":
      return new SmsChannelAdapter(new LegacySmsGateway());
    default: {
      const exhaustive: never = channelType;
      throw new Error(`Noma'lum kanal: ${String(exhaustive)}`);
    }
  }
}

function findRecipient(recipients: readonly Recipient[], name: string): Recipient | undefined {
  const normalized = name.trim().toLowerCase();
  return recipients.find((r) => r.name.toLowerCase() === normalized);
}

async function handleSend(
  reader: PromptReader,
  recipients: readonly Recipient[]
): Promise<void> {
  const type = parseChoice(
    await askRequired(reader, "Tur (alert / reminder / promo): "),
    VALID_TYPES,
    "tur"
  );
  const locale = parseChoice(
    await askRequired(reader, "Til (uz / ru / en): "),
    VALID_LOCALES,
    "til"
  );
  const channelType = parseChoice(
    await askRequired(reader, "Kanal (console / file / telegram / sms): "),
    VALID_CHANNELS,
    "kanal"
  );
  const recipientName = await askRequired(
    reader,
    "Qabul qiluvchi (masalan: Ali, Vali, Malika, Bobur): "
  );
  const recipient = findRecipient(recipients, recipientName);
  if (!recipient) {
    throw new Error(`Qabul qiluvchi topilmadi: "${recipientName}"`);
  }

  const text = await askRequired(reader, "Matn: ");
  if (!text.trim()) {
    throw new Error("Xabar matni bo'sh bo'lishi mumkin emas.");
  }

  const decRaw = await askRequired(
    reader,
    "Qo'shimchalar (timestamp, signature, encrypt, urgent — bo'sh qoldirish mumkin): "
  );
  const decorators = parseDecorators(decRaw);

  const channel = resolveChannel(channelType);
  const notification = createNotification(type, channel);
  const localeFactory = getLocaleFactory(locale);

  console.log("");
  const record = notification.send(recipient, text, localeFactory, decorators);

  if (record.success) {
    console.log(`✅ Bildirishnoma muvaffaqiyatli yuborildi (${recipient.name})`);
  } else {
    console.log(`❌ Yuborishda xatolik yuz berdi (${recipient.name})`);
  }
}

async function handleRecipients(
  reader: PromptReader,
  recipients: Recipient[]
): Promise<void> {
  console.log("\nQabul qiluvchilar:");
  for (const r of recipients) {
    console.log(r.describe());
  }

  const addChoice = await askRequired(
    reader,
    "\nYangi qabul qiluvchi qo'shasizmi? (ha / Enter — qaytish): "
  );
  if (addChoice.trim().toLowerCase() !== "ha") {
    return;
  }

  const name = await askRequired(reader, "Ism: ");
  const phone = await askRequired(reader, "Telefon (masalan +998901234567): ");
  const tg = await askRequired(reader, "Telegram username (ixtiyoriy, @ bilan): ");

  if (!name.trim()) {
    throw new Error("Ism bo'sh bo'lishi mumkin emas.");
  }

  const created = new Recipient(
    `u${recipients.length + 1}`,
    name.trim(),
    phone.trim(),
    tg.trim() || undefined
  );
  recipients.push(created);
  console.log(`✅ Qo'shildi: ${created.describe()}`);
}

async function main(): Promise<void> {
  const recipients = createDefaultRecipients();
  const history = NotificationHistory.getInstance();
  const reader = new PromptReader();

  try {
    let running = true;
    while (running) {
      console.log("\n========= NotifyHub =========");
      console.log("1. Bildirishnoma yuborish");
      console.log("2. Tarix");
      console.log("3. Statistika");
      console.log("4. Qabul qiluvchilar");
      console.log("0. Chiqish");

      const choice = await reader.question("> ");
      if (choice === null) {
        break;
      }

      try {
        switch (choice.trim()) {
          case "1":
            await handleSend(reader, recipients);
            break;
          case "2":
            console.log("\n" + history.formatHistory());
            break;
          case "3":
            console.log("\n" + history.formatStats());
            break;
          case "4":
            await handleRecipients(reader, recipients);
            break;
          case "0":
            running = false;
            console.log("Xayr!");
            break;
          default:
            console.log("Noto'g'ri tanlov. 0 dan 4 gacha raqam kiriting.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.log(`❌ Xatolik: ${message}`);
      }
    }
  } finally {
    reader.close();
  }
}

main();
