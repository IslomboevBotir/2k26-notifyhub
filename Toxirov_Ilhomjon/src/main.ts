import { createInterface } from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import type { MessageDecoratorType } from "./decorators/message.ts";
import type { Locale } from "./locales/templates.ts";
import type { NotificationType } from "./notifications/base.ts";
import { NotificationBuilder } from "./core/builder.ts";
import type { ChannelName } from "./core/builder.ts";
import { NotifyHub } from "./core/hub.ts";
import { createExampleGroups, UserRecipient } from "./recipients/recipients.ts";

const menu = createInterface({ input, output });
const inputLines = menu[Symbol.asyncIterator]();
const hub = new NotifyHub();
const groups = createExampleGroups();

const typeChoices: NotificationType[] = ["alert", "reminder", "promo"];
const localeChoices: Locale[] = ["uz", "ru", "en"];
const channelChoices: ChannelName[] = ["console", "file", "telegram", "sms"];
const decoratorChoices: MessageDecoratorType[] = [
  "timestamp",
  "signature",
  "encrypt",
  "urgent",
];

class EndOfInput extends Error {}

async function ask(prompt: string): Promise<string> {
  output.write(prompt);
  const result = await inputLines.next();
  if (result.done) {
    throw new EndOfInput();
  }
  return result.value;
}

async function askChoice<T extends string>(
  prompt: string,
  choices: readonly T[],
): Promise<T> {
  while (true) {
    const answer = (await ask(prompt)).trim().toLowerCase();
    const choice = choices.find((candidate) => candidate === answer);
    if (choice) {
      return choice;
    }
    console.log(`Tanlovlardan birini kiriting: ${choices.join(" / ")}`);
  }
}

async function sendNotification(): Promise<void> {
  const type = await askChoice(
    "Tur (alert / reminder / promo): ",
    typeChoices,
  );
  const locale = await askChoice("Til (uz / ru / en): ", localeChoices);
  const channel = await askChoice(
    "Kanal (console / file / telegram / sms): ",
    channelChoices,
  );

  console.log("Guruhlar: 3-kurs, 301-guruh, 302-guruh.");
  const recipientInput = (await ask("Qabul qiluvchi: ")).trim();
  if (!recipientInput) {
    console.log("Qabul qiluvchi bo'sh bo'lmasligi kerak.");
    return;
  }
  const recipient =
    groups.get(recipientInput.toLowerCase()) ??
    new UserRecipient(recipientInput, recipientInput);

  const text = await ask("Matn: ");
  if (!text.trim()) {
    console.log("Xabar matni bo'sh bo'lmasligi kerak.");
    return;
  }

  const decoratorsInput = (
    await ask(
      "Qo'shimchalar (timestamp, signature, encrypt, urgent; bo'sh qoldirish mumkin): ",
    )
  )
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const decorators: MessageDecoratorType[] = [];
  for (const item of decoratorsInput) {
    const decorator = decoratorChoices.find((choice) => choice === item);
    if (decorator) {
      decorators.push(decorator);
    } else {
      console.log(`Noma'lum qo'shimcha o'tkazib yuborildi: ${item}`);
    }
  }

  const request = new NotificationBuilder()
    .type(type)
    .language(locale)
    .channel(channel)
    .to(recipient)
    .message(text)
    .withDecorators(decorators)
    .build();

  const results = hub.send(request);
  const succeeded = results.filter((result) => result.success).length;
  console.log(`✅ Yuborildi: ${results.length} tadan ${succeeded} tasi`);
}

async function main(): Promise<void> {
  try {
    while (true) {
      console.log("\n========= NotifyHub =========");
      console.log("1. Bildirishnoma yuborish");
      console.log("2. Tarix");
      console.log("3. Statistika");
      console.log("0. Chiqish");

      const choice = (await ask("> ")).trim();
      switch (choice) {
        case "1":
          await sendNotification();
          break;
        case "2":
          hub.showHistory();
          break;
        case "3":
          hub.showStats();
          break;
        case "0":
          return;
        default:
          console.log("Menyudan 0, 1, 2 yoki 3 ni tanlang.");
      }
    }
  } catch (error) {
    if (!(error instanceof EndOfInput)) {
      throw error;
    }
  } finally {
    menu.close();
  }
}

await main();
