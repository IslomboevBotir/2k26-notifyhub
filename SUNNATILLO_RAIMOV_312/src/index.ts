/**
 * @file index.ts
 *
 * NOTIFYHUB - Bildirishnomalar tarqatish xizmati
 * Asosiy konsol muloqot menyusi (CLI).
 */

import * as readline from "readline";
import { stdin as input, stdout as output } from "process";
import { NotifyHub } from "./core/hub.js";

async function main() {
  const hub = new NotifyHub();
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  const linesIterator = rl[Symbol.asyncIterator]();

  async function ask(promptText: string): Promise<string | null> {
    output.write(promptText);
    const next = await linesIterator.next();
    if (next.done) {
      return null;
    }
    return next.value;
  }

  console.log("==========================================");
  console.log("   NotifyHub — Bildirishnomalar Xizmati   ");
  console.log("==========================================");

  let running = true;

  while (running) {
    console.log("\n========= NotifyHub =========");
    console.log("1. Bildirishnoma yuborish");
    console.log("2. Tarix");
    console.log("3. Statistika");
    console.log("4. Tarqatma shablonlari (Prototype)");
    console.log("5. Qabul qiluvchilar tuzilmasi (Composite)");
    console.log("0. Chiqish");

    const choiceRaw = await ask("> ");
    if (choiceRaw === null) {
      break;
    }
    const choice = choiceRaw.trim();

    switch (choice) {
      case "1": {
        console.log("\n--- Yangi bildirishnoma yaratish ---");
        const typeRaw = await ask("Tur (alert / reminder / promo) [reminder]: ");
        if (typeRaw === null) break;
        const type = typeRaw.trim() || "reminder";

        const localeRaw = await ask("Til (uz / ru / en) [uz]: ");
        if (localeRaw === null) break;
        const locale = localeRaw.trim() || "uz";

        const channelRaw = await ask("Kanal (console / file / telegram / sms) [sms]: ");
        if (channelRaw === null) break;
        const channel = channelRaw.trim() || "sms";

        const recipientRaw = await ask("Qabul qiluvchi (ism yoki guruh) [3-kurs]: ");
        if (recipientRaw === null) break;
        const recipientName = recipientRaw.trim() || "3-kurs";

        const textRaw = await ask("Matn: ");
        if (textRaw === null) break;
        const text = textRaw.trim();

        if (!text) {
          console.log("❌ Matn kiritilmadi! Bekor qilindi.");
          break;
        }

        const decoratorsInputRaw = await ask(
          "Qo'shimchalar (timestamp, signature, encrypt, urgent): "
        );
        const decoratorsInput = (decoratorsInputRaw || "").trim();

        const decorators = decoratorsInput
          ? decoratorsInput
              .split(",")
              .map((s: string) => s.trim().toLowerCase())
              .filter(Boolean)
          : [];

        console.log("");
        try {
          hub.send({
            type,
            locale,
            channel,
            recipientName,
            text,
            decorators,
          });
        } catch (err: any) {
          console.error(`❌ Xatolik yuz berdi: ${err?.message || err}`);
        }
        break;
      }

      case "2": {
        hub.printHistory();
        break;
      }

      case "3": {
        hub.printStats();
        break;
      }

      case "4": {
        console.log("\n--- Saqlangan tarqatma shablonlari (Prototype) ---");
        const templates = hub.getTemplates();
        templates.forEach((t, index) => {
          console.log(`${index + 1}. [${t.name}] ID: ${t.id}`);
          console.log(`   Tur: ${t.type} | Til: ${t.locale} | Kanal: ${t.channel}`);
          console.log(`   Standart qabul qiluvchi: ${t.recipientName}`);
          console.log(`   Standart matn: "${t.content}"`);
          console.log(`   Qo'shimchalar: ${t.decorators.join(", ") || "yo'q"}\n`);
        });

        console.log("Amalni tanlang:");
        console.log("1. Shablon asosida darhol yuborish");
        console.log("2. Shablonni klonlash (nusxalab matn/qabul qiluvchini o'zgartirish)");
        console.log("0. Orqaga");

        const subChoiceRaw = await ask("> ");
        if (subChoiceRaw === null) break;
        const subChoice = subChoiceRaw.trim();

        if (subChoice === "1" || subChoice === "2") {
          const tplIdRaw = await ask("Shablon ID sini kiriting: ");
          if (tplIdRaw === null) break;
          const tplId = tplIdRaw.trim();
          const tpl = hub.getTemplateRegistry().get(tplId);
          if (!tpl) {
            console.log("❌ Bunday shablon topilmadi!");
            break;
          }

          if (subChoice === "1") {
            console.log("");
            hub.sendFromTemplate(tplId);
          } else {
            console.log(
              "\n--- Klonlangan nusxa parametrlarini kiriting (bo'sh qoldirilsa asl nusxadagisi qoladi) ---"
            );
            const newTextRaw = await ask(`Yangi matn [${tpl.content}]: `);
            const newRecipientRaw = await ask(`Yangi qabul qiluvchi [${tpl.recipientName}]: `);

            const newText = (newTextRaw || "").trim();
            const newRecipient = (newRecipientRaw || "").trim();

            console.log("");
            hub.sendFromTemplate(tplId, {
              content: newText || undefined,
              recipientName: newRecipient || undefined,
            });
          }
        }
        break;
      }

      case "5": {
        console.log("\n--- Qabul qiluvchilar daraxtsimon tuzilmasi (Composite) ---");
        const recipients = hub.getAllRecipients();
        for (const r of recipients) {
          const users = r.getUsers();
          console.log(`📌 ${r.getName()} (${r.getContact()})`);
          console.log(`   Yetib boradigan foydalanuvchilar soni: ${users.length} ta:`);
          users.forEach((u) => console.log(`     - ${u.getName()} -> ${u.getContact()}`));
          console.log("");
        }
        break;
      }

      case "0": {
        console.log("Dastur yakunlandi. Xayr!");
        running = false;
        break;
      }

      default:
        console.log("Noto'g'ri tanlov! 0 dan 5 gacha raqam kiriting.");
        break;
    }
  }

  rl.close();
}

// Konsoldan to'g'ridan-to'g'ri ishga tushirilganda
main().catch((err) => {
  console.error("Kutilmagan xatolik:", err);
  process.exit(1);
});
