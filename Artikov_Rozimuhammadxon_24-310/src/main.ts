/**
 * NotifyHub: konsol menyusi.
 *
 * Ishga tushirish:  npm start          (interaktiv menyu)
 *                   npm run demo       (barcha patternlarni avtomatik namoyish qilish)
 *
 * Menyu faqat Facade (NotifyHub) bilan ishlaydi va ichki klasslarni bilmaydi.
 */

import * as readline from "node:readline";
import { stdin, stdout } from "node:process";
import { parseExtras } from "./core/builder";
import { getEnvironment, type OutputLevel } from "./core/environment";
import { NotifyHub } from "./core/hub";
import { TelegramChannel } from "./channels/telegram";
import { AlertNotification } from "./notifications/types";
import { RuFactory } from "./locales/factories";
import { SignatureDecorator, TimestampDecorator } from "./decorators/messageDecorators";

const hub = new NotifyHub();
const out = (line = "", level?: OutputLevel) => getEnvironment().output.write(line, level);

class ExitSignal extends Error {}

// ---------------------------------------------------------------------------
// Kiritish yordamchilari
// ---------------------------------------------------------------------------
function createPrompter() {
  const rl = readline.createInterface({ input: stdin, output: stdout, terminal: stdin.isTTY });

  // Kiritilgan qatorlar navbatga yig'iladi: kiritish fayl yoki pipe orqali
  // berilganda ham birorta qator yo'qolmaydi.
  const buffered: string[] = [];
  const waiting: { resolve: (line: string) => void; reject: (error: Error) => void }[] = [];
  let closed = false;

  rl.on("line", (line) => {
    const next = waiting.shift();
    if (next) next.resolve(line);
    else buffered.push(line);
  });
  // Ctrl+C / Ctrl+D (oqim yopilishi) kutilayotgan savolni to'xtatadi.
  rl.on("close", () => {
    closed = true;
    waiting.splice(0).forEach((w) => w.reject(new ExitSignal()));
  });

  const ask = (question: string): Promise<string> => {
    stdout.write(question);
    if (!stdin.isTTY && buffered.length > 0) stdout.write(`${buffered[0]}\n`); // pipe rejimida javobni ko'rsatish
    const line = buffered.shift();
    if (line !== undefined) return Promise.resolve(line.trim());
    if (closed) return Promise.reject(new ExitSignal());
    return new Promise<string>((resolve, reject) => waiting.push({ resolve: (l) => resolve(l.trim()), reject }));
  };

  const choose = async (question: string, options: readonly string[]): Promise<string> => {
    for (;;) {
      const answer = (await ask(`${question} (${options.join(" / ")}): `)).toLowerCase();
      if (options.includes(answer)) return answer;
      out(`  ❌ Quyidagilardan birini kiriting: ${options.join(", ")}`, "error");
    }
  };

  const askRequired = async (question: string): Promise<string> => {
    for (;;) {
      const answer = await ask(question);
      if (answer) return answer;
      out("  ❌ Bo'sh bo'lishi mumkin emas", "error");
    }
  };

  const askRecipient = async (question: string, allowEmpty = false): Promise<string> => {
    for (;;) {
      const answer = await ask(question);
      if (!answer && allowEmpty) return "";
      if (answer === "?") {
        printRecipients();
        continue;
      }
      if (answer && hub.directory.find(answer)) return answer;
      out(`  ❌ '${answer}' topilmadi. Ro'yxatni ko'rish uchun ? kiriting`, "error");
    }
  };

  const askExtras = async (): Promise<string[]> => {
    for (;;) {
      const raw = await ask(`Qo'shimchalar (${hub.extras.join(", ")}): `);
      try {
        return parseExtras(raw);
      } catch (error) {
        out(`  ❌ ${(error as Error).message}`, "error");
      }
    }
  };

  return { rl, ask, choose, askRequired, askRecipient, askExtras };
}

type Prompter = ReturnType<typeof createPrompter>;

// ---------------------------------------------------------------------------
// Menyu bo'limlari
// ---------------------------------------------------------------------------
function printRecipients(): void {
  out("--- Qabul qiluvchilar (Composite daraxti) ---");
  hub.directory.tree().forEach((line) => out(line));
}

async function sendFlow(p: Prompter): Promise<void> {
  const kind = await p.choose("Tur", hub.kinds);
  const locale = await p.choose("Til", hub.locales);
  const channel = await p.choose("Kanal", hub.channels);
  const recipient = await p.askRecipient("Qabul qiluvchi (ism yoki guruh, ? — ro'yxat): ");
  const text = await p.askRequired("Matn: ");
  const extras = await p.askExtras();
  out();
  hub.send({ kind, locale, channel, recipient, text, extras });
}

async function templatesFlow(p: Prompter): Promise<void> {
  const templates = hub.listTemplates();
  out("--- Tarqatma shablonlari (Prototype) ---");
  templates.forEach((t, i) =>
    out(`${i + 1}. ${t.name} — ${t.kind} | ${t.locale} | ${t.channel} → ${t.recipient.name} | [${t.extras.join(", ")}]`),
  );
  const answer = await p.ask("Raqam (0 — orqaga, + — yangi shablon): ");

  if (answer === "+") {
    const name = await p.askRequired("Shablon nomi: ");
    const kind = await p.choose("Tur", hub.kinds);
    const locale = await p.choose("Til", hub.locales);
    const channel = await p.choose("Kanal", hub.channels);
    const recipient = await p.askRecipient("Qabul qiluvchi (? — ro'yxat): ");
    const text = await p.askRequired("Matn: ");
    const extras = await p.askExtras();
    hub.saveTemplate(name, { kind, locale, channel, recipient, text, extras });
    out(`✅ '${name}' shabloni saqlandi`, "success");
    return;
  }

  const index = Number(answer) - 1;
  if (!answer || answer === "0") return;
  const template = templates[index];
  if (!template) {
    out("❌ Bunday raqamli shablon yo'q", "error");
    return;
  }

  out(`Matn: ${template.text}`, "muted");
  const text = await p.ask("Yangi matn (Enter — o'zgarishsiz): ");
  const recipient = await p.askRecipient(
    `Yangi qabul qiluvchi (Enter — ${template.recipient.name}, ? — ro'yxat): `,
    true,
  );
  out();
  hub.sendTemplate(template.name, { text, recipient: recipient || undefined });
  out(`ℹ️ Asl '${template.name}' shabloni o'zgarmadi: yuborilgani uning klon nusxasi edi.`, "muted");
}

// ---------------------------------------------------------------------------
// Namoyish rejimi: barcha patternlarni ketma-ket ko'rsatadi
// ---------------------------------------------------------------------------
function runDemo(): void {
  const title = (text: string) => out(`\n=== ${text} ===`, "success");

  title("1. Bridge (to'g'ridan-to'g'ri): AlertNotification + TelegramChannel");
  const alert = new AlertNotification({
    channel: new TelegramChannel(),
    locale: new RuFactory(),
    text: "Сервер недоступен",
    decorators: [(m) => new TimestampDecorator(m), (m) => new SignatureDecorator(m, "— Команда NotifyHub")],
  });
  alert.send(hub.findRecipient("Ali Valiyev"));

  title("2. Facade + Builder + Composite + Adapter: reminder → SMS → 3-kurs");
  hub.send({
    kind: "reminder",
    locale: "uz",
    channel: "sms",
    recipient: "3-kurs",
    text: "Ertaga imtihon soat 9:00 da",
    extras: ["timestamp", "signature"],
  });

  title("3. Adapter xatosi: noto'g'ri raqam (401-guruh)");
  hub.send({ kind: "alert", locale: "en", channel: "sms", recipient: "401-guruh", text: "Server is down", extras: ["urgent"] });

  title("4. Decorator: shifrlash (Sezar va Base64)");
  hub.send({ kind: "promo", locale: "en", channel: "console", recipient: "Nodira Azimova", text: "Secret sale", extras: ["encrypt"] });
  hub.send({ kind: "promo", locale: "ru", channel: "console", recipient: "Nodira Azimova", text: "Скидка 30%", extras: ["encrypt:base64"] });

  title("5. Fayl kanali");
  hub.send({ kind: "alert", locale: "uz", channel: "file", recipient: "O'qituvchilar", text: "Majlis 14:00 ga ko'chirildi", extras: ["timestamp"] });

  title("6. Prototype: 'Haftalik eslatma' klonini 4-kursga yuborish");
  hub.sendTemplate("Haftalik eslatma", { recipient: "4-kurs" });

  title("7. Singleton: tarix");
  hub.showHistory();

  title("8. Singleton: statistika");
  hub.showStats();
}

// ---------------------------------------------------------------------------
// Asosiy tsikl
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  if (process.argv.includes("--demo")) {
    runDemo();
    return;
  }

  const p = createPrompter();
  try {
    for (;;) {
      out("\n========= NotifyHub =========");
      out("1. Bildirishnoma yuborish");
      out("2. Tarix");
      out("3. Statistika");
      out("4. Tarqatma shablonlari");
      out("5. Qabul qiluvchilar");
      out("0. Chiqish");
      const choice = await p.ask("> ");
      try {
        switch (choice) {
          case "1": await sendFlow(p); break;
          case "2": hub.showHistory(); break;
          case "3": hub.showStats(); break;
          case "4": await templatesFlow(p); break;
          case "5": printRecipients(); break;
          case "0": throw new ExitSignal();
          default: out("❌ Menyudan 0–5 oralig'idagi raqamni tanlang", "error");
        }
      } catch (error) {
        if (error instanceof ExitSignal) throw error;
        out(`❌ ${(error as Error).message}`, "error");
      }
    }
  } catch (error) {
    if (!(error instanceof ExitSignal)) throw error;
    out("Xayr!");
  } finally {
    p.rl.close();
  }
}

void main();
