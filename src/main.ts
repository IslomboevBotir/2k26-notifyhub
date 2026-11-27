import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import { NotifyHub } from "./core/hub.js";
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

async function handleSend(reader: PromptReader, hub: NotifyHub): Promise<void> {
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
  const channel = parseChoice(
    await askRequired(reader, "Kanal (console / file / telegram / sms): "),
    VALID_CHANNELS,
    "kanal"
  );
  const recipientName = await askRequired(
    reader,
    "Qabul qiluvchi (masalan: 3-kurs, 301-guruh, Ali, Bobur): "
  );
  const text = await askRequired(reader, "Matn: ");
  const decRaw = await askRequired(
    reader,
    "Qo'shimchalar (timestamp, signature, encrypt, urgent — bo'sh qoldirish mumkin): "
  );
  const decorators = parseDecorators(decRaw);

  console.log("");
  const summary = hub.send({
    type,
    locale,
    channel,
    recipientName,
    text,
    decorators,
  });

  if (summary.failed === 0) {
    console.log(`✅ Yuborildi: ${summary.total} tadan ${summary.succeeded} tasi`);
  } else {
    console.log(
      `⚠️ Yuborildi: ${summary.total} tadan ${summary.succeeded} tasi (${summary.failed} ta xato)`
    );
  }
}

async function handleTemplates(reader: PromptReader, hub: NotifyHub): Promise<void> {
  const templates = hub.listTemplates();
  console.log("\nSaqlangan tarqatma shablonlari (Prototype):");
  templates.forEach((tpl, idx) => {
    console.log(`  ${idx + 1}. ${tpl.describe()}`);
  });

  const choiceRaw = await askRequired(
    reader,
    "Nusxalab yuborish uchun shablon raqamini kiriting (bekor qilish uchun Enter): "
  );
  if (!choiceRaw.trim()) {
    return;
  }

  const index = Number.parseInt(choiceRaw.trim(), 10) - 1;
  if (Number.isNaN(index) || index < 0 || index >= templates.length) {
    throw new Error("Noto'g'ri shablon raqami.");
  }

  const newText = await askRequired(
    reader,
    "Yangi matn (asl shablon matnini qoldirish uchun Enter): "
  );
  const newRecipient = await askRequired(
    reader,
    "Yangi qabul qiluvchi (asl qabul qiluvchini qoldirish uchun Enter): "
  );

  console.log("");
  const summary = hub.sendFromTemplate(index, {
    text: newText,
    recipientName: newRecipient,
  });
  console.log(`✅ Shablondan yuborildi: ${summary.total} tadan ${summary.succeeded} tasi`);
}

async function handleRecipients(reader: PromptReader, hub: NotifyHub): Promise<void> {
  console.log("\n" + hub.listRecipientsTree());
  const addChoice = await askRequired(
    reader,
    "\nYangi foydalanuvchi qo'shasizmi? (ha / Enter — qaytish): "
  );
  if (addChoice.trim().toLowerCase() !== "ha") {
    return;
  }

  const name = await askRequired(reader, "Ism: ");
  const phone = await askRequired(reader, "Telefon (masalan +998901234567): ");
  const tg = await askRequired(reader, "Telegram username (ixtiyoriy, @ bilan): ");
  const group = await askRequired(reader, "Guruh nomi (ixtiyoriy, masalan 301-guruh): ");

  if (!name.trim()) {
    throw new Error("Ism bo'sh bo'lishi mumkin emas.");
  }

  const created = hub.addUser(name, phone, tg, group);
  console.log(`✅ Qo'shildi: ${created.describe()}`);
}

async function main(): Promise<void> {
  const hub = new NotifyHub();
  const reader = new PromptReader();

  try {
    let running = true;
    while (running) {
      console.log("\n========= NotifyHub =========");
      console.log("1. Bildirishnoma yuborish");
      console.log("2. Tarix");
      console.log("3. Statistika");
      console.log("4. Tarqatma shablonlari");
      console.log("5. Qabul qiluvchilar");
      console.log("0. Chiqish");

      const choice = await reader.question("> ");
      if (choice === null) {
        break;
      }

      try {
        switch (choice.trim()) {
          case "1":
            await handleSend(reader, hub);
            break;
          case "2":
            console.log("\n" + hub.showHistory());
            break;
          case "3":
            console.log("\n" + hub.showStats());
            break;
          case "4":
            await handleTemplates(reader, hub);
            break;
          case "5":
            await handleRecipients(reader, hub);
            break;
          case "0":
            running = false;
            console.log("Xayr!");
            break;
          default:
            console.log("Noto'g'ri tanlov. 0 dan 5 gacha raqam kiriting.");
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
