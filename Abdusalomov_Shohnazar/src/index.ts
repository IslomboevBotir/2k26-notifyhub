/**
 * @file index.ts
 * @description
 * NotifyHub tizimining asosiy kirish nuqtasi va interaktiv konsol menyusi.
 */

import * as readline from 'node:readline';
import * as process from 'node:process';
import { NotifyHub } from './core/hub.facade.ts';
import type {
  ChannelType,
  DecoratorType,
  LocaleType,
  NotificationType,
} from './types/index.ts';
import { Group } from './recipients/group.ts';
import { User } from './recipients/user.ts';

class NotifyHubCLI {
  private readonly hub: NotifyHub;
  private readonly rl: readline.Interface;
  private readonly linesIterator: AsyncIterator<string>;

  constructor() {
    this.hub = new NotifyHub();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
    this.linesIterator = this.rl[Symbol.asyncIterator]();
  }

  private async ask(question: string): Promise<string> {
    process.stdout.write(question);
    const result = await this.linesIterator.next();
    if (result.done) {
      return '';
    }
    const val = (result.value ?? '').trim();
    if (!process.stdin.isTTY) {
      console.log(val);
    }
    return val;
  }

  private printMenu(): void {
    console.log('\n========= NotifyHub =========');
    console.log('1. Bildirishnoma yuborish');
    console.log('2. Tarix');
    console.log('3. Statistika');
    console.log('4. Tarqatma shablonlari (Prototype)');
    console.log('5. Qabul qiluvchilar (Composite daraxti)');
    console.log('0. Chiqish');
  }

  private async handleSendNotification(): Promise<void> {
    let typeInput = (await this.ask('Tur (alert / reminder / promo): ')).toLowerCase();
    if (!typeInput) typeInput = 'reminder';
    if (!['alert', 'reminder', 'promo'].includes(typeInput)) {
      console.log('⚠️ Standart "reminder" tanlandi.');
      typeInput = 'reminder';
    }
    const type = typeInput as NotificationType;

    let localeInput = (await this.ask('Til (uz / ru / en): ')).toLowerCase();
    if (!localeInput) localeInput = 'uz';
    if (!['uz', 'ru', 'en'].includes(localeInput)) {
      console.log('⚠️ Standart "uz" tanlandi.');
      localeInput = 'uz';
    }
    const locale = localeInput as LocaleType;

    let channelInput = (await this.ask('Kanal (console / file / telegram / sms): ')).toLowerCase();
    if (!channelInput) channelInput = 'console';
    if (!['console', 'file', 'telegram', 'sms'].includes(channelInput)) {
      console.log('⚠️ Standart "console" tanlandi.');
      channelInput = 'console';
    }
    const channel = channelInput as ChannelType;

    const recipientName = await this.ask('Qabul qiluvchi (ism yoki guruh): ');
    let recipient = this.hub.getRecipients().find(recipientName);

    if (!recipient) {
      console.log(`⚠️ "${recipientName}" topilmadi. Avtomatik yangi foydalanuvchi yaratilmoqda...`);
      const contact = await this.ask(`"${recipientName}" uchun kontakt (telefon yoki @username): `);
      recipient = this.hub.getRecipients().createUser(recipientName, contact || '+998900000000');
      console.log(`✅ Foydalanuvchi saqlandi: ${recipient.describe()}`);
    }

    let text = await this.ask('Matn: ');
    if (!text) {
      text = 'Bildirishnoma xabari';
    }

    const decoratorsInput = await this.ask('Qo\'shimchalar (timestamp, signature, encrypt, urgent): ');
    const chosenDecorators: DecoratorType[] = [];
    if (decoratorsInput) {
      const parts = decoratorsInput.split(',').map((p) => p.trim().toLowerCase());
      for (const part of parts) {
        if (['timestamp', 'signature', 'encrypt', 'urgent'].includes(part)) {
          chosenDecorators.push(part as DecoratorType);
        }
      }
    }

    console.log('');
    const result = this.hub.send({
      type,
      locale,
      channel,
      recipient,
      text,
      decorators: chosenDecorators,
    });

    console.log(`✅ Yuborildi: ${result.total} tadan ${result.sent} tasi`);
  }

  private async handleTemplatesMenu(): Promise<void> {
    console.log('\n--- 📋 Tarqatma shablonlari (Prototype Pattern) ---');
    const templates = this.hub.getTemplates();

    templates.forEach((t, index) => {
      console.log(
        `${index + 1}. [${t.id}] ${t.name} | Tur: ${t.type} | Kanal: ${t.channelType} | Til: ${t.locale}`
      );
      console.log(`   Matn: "${t.text}"`);
      console.log(`   Qo'shimchalar: ${t.decorators.join(', ') || 'yo\'q'}`);
    });

    console.log('\nAmallar:');
    console.log('1. Shablonni o\'zgartirishsiz yuborish (clone() orqali)');
    console.log('2. Shablon matnini o\'zgartirib yuborish (clone() + setText)');
    console.log('0. Orqaga');

    const choice = await this.ask('> ');
    if (choice === '1' || choice === '2') {
      const id = await this.ask('Shablon ID sini kiriting (masalan: weekly-reminder): ');
      const template = this.hub.getTemplate(id);
      if (!template) {
        console.log('❌ Bunday shablon topilmadi!');
        return;
      }

      const recipientName = await this.ask('Qabul qiluvchi [3-kurs]: ');
      const recipient = recipientName ? this.hub.getRecipients().find(recipientName) : this.hub.getRecipients().find('3-kurs');
      if (!recipient) {
        console.log('❌ Qabul qiluvchi topilmadi!');
        return;
      }

      let newText: string | undefined;
      if (choice === '2') {
        newText = await this.ask(`Yangi matn [${template.text}]: `);
      }

      console.log('\n🚀 Shablon clone qilinib yuborilmoqda...\n');
      const result = this.hub.cloneAndSendTemplate(template.id, {
        newText: newText || undefined,
        newRecipient: recipient,
      });

      console.log(`\n✅ Yuborildi: ${result.total} tadan ${result.sent} tasi`);
    }
  }

  private handleShowRecipients(): void {
    console.log('\n--- 👥 Qabul qiluvchilar iyerarxiyasi (Composite Pattern) ---');
    const all = this.hub.getRecipients().getAll();

    console.log('\n[Guruhlar (Composite)] :');
    for (const r of all) {
      if (r instanceof Group) {
        console.log(`\n📁 Guruh: ${r.getName()}`);
        this.printGroupTree(r, '  ');
        const subscribers = r.getSubscribers();
        console.log(`  └─ Jami yetib boruvchi yakuniy a'zolar: ${subscribers.length} ta`);
      }
    }

    console.log('\n[Yakka foydalanuvchilar (Leaves)] :');
    for (const r of all) {
      if (r instanceof User) {
        console.log(`👤 ${r.describe()}`);
      }
    }
    console.log('');
  }

  private printGroupTree(group: Group, indent: string): void {
    for (const child of group.getChildren()) {
      if (child instanceof Group) {
        console.log(`${indent}📁 ${child.getName()} (Ichki guruh)`);
        this.printGroupTree(child, `${indent}  `);
      } else {
        console.log(`${indent}👤 ${child.describe()}`);
      }
    }
  }

  public async start(): Promise<void> {
    console.log('NotifyHub tizimiga xush kelibsiz!');
    let isRunning = true;

    while (isRunning) {
      this.printMenu();
      const choice = await this.ask('> ');

      switch (choice) {
        case '1':
          await this.handleSendNotification();
          break;
        case '2':
          this.hub.showHistory();
          break;
        case '3':
          this.hub.showStats();
          break;
        case '4':
          await this.handleTemplatesMenu();
          break;
        case '5':
          this.handleShowRecipients();
          break;
        case '0':
        case '':
          console.log('\nNotifyHub dasturi yakunlandi. Xayr!');
          isRunning = false;
          this.rl.close();
          break;
        default:
          console.log('⚠️ Noto\'g\'ri tanlov! 0 dan 5 gacha bo\'lgan raqamni kiriting.');
          break;
      }
    }
  }
}

const app = new NotifyHubCLI();
app.start().catch((err) => {
  console.error('Kutilmagan xatolik yuz berdi:', err);
  process.exit(1);
});
