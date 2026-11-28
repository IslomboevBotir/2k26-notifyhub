# 🧩 NotifyHub — Mustaqil O'rganish va Amalga Oshirish Bo'yicha Yo'l Xaritasi (Workflow Guide)

Ushbu qo'llanma **NotifyHub (Bildirishnomalar xizmati)** loyihasini noldan boshlab o'zingiz mustaqil ravishda **TypeScript** tilida GoF (Gang of Four) obyektga yo'naltirilgan loyihalash patternlari asosida bosqichma-bosqich ishlab chiqishingiz uchun mo'ljallangan.

---

## 📑 Mundarija
1. [Loyiha haqida qisqacha](#1-loyiha-haqida-qisqacha)
2. [Tavsiya etilgan fayllar tuzilmasi](#2-tavsiya-etilgan-fayllar-tuzilmasi)
3. [0-Qadam: Loyiha muhitini sozlash (TypeScript & Node.js)](#3-0-qadam-loyiha-muhitini-sozlash)
4. [1-Qadam: Bridge Pattern (Bildirishnoma turi × Yuborish kanali)](#4-1-qadam-bridge-pattern)
5. [2-Qadam: Abstract Factory Pattern (Tillar bo'yicha shablonlar oilasi)](#5-2-qadam-abstract-factory-pattern)
6. [3-Qadam: Decorator Pattern (Xabarni dinamik qayta ishlash)](#6-3-qadam-decorator-pattern)
7. [4-Qadam: Adapter Pattern (Eski SMS-shlyuzni ulash)](#7-4-qadam-adapter-pattern)
8. [5-Qadam: Singleton Pattern (Tarix va statistika yagona markazi)](#8-5-qadam-singleton-pattern)
9. [Bonus Qadamlar: Qo'shimcha 5 ta Pattern](#9-bonus-qadamlar-qo‘shimcha-5-ta-pattern)
   - [Composite (Qabul qiluvchilar daraxti)](#bonus-1-composite-pattern)
   - [Factory Method (Kanal yaratish)](#bonus-2-factory-method-pattern)
   - [Builder (Bildirishnomani bosqichma-bosqich yig'ish)](#bonus-3-builder-pattern)
   - [Prototype (Tarqatma shablonlarini klonlash)](#bonus-4-prototype-pattern)
   - [Facade (Barcha quyi tizimlarni birlashtiruvchi markaz)](#bonus-5-facade-pattern)
10. [Konsol menyusi (CLI) yaratish](#10-konsol-menyusi-cli-yaratish)
11. [O'zini tekshirish checklisti](#11-o‘zini-tekshirish-checklisti)
12. [Himoya uchun nazorat savollari va javoblar](#12-himoya-uchun-nazorat-savollari-va-javoblar)

---

## 1. Loyiha haqida qisqacha

**NotifyHub** — bildirishnomalarni tarqatish xizmatini simulyatsiya qiluvchi konsol ilovadir.
Haqiqiy tarmoq so'rovlari talab qilinmaydi — tashqi xizmatlar (SMS, Telegram, File, Console) konsolga chiqarish orqali **imitatsiya qilinadi**.

Loyiha quyidagi imkoniyatlarga ega bo'lishi kerak:
- Har xil turdagi bildirishnomalar (`alert`, `reminder`, `promo`);
- Har xil kanallar orqali yuborish (`console`, `file`, `telegram`, `sms`);
- Xabar tilini tanlash (`uz`, `ru`, `en`);
- Xabarga vaqt belgisi, imzo, shifrlash va shoshilinchlik belgisini qo'shish;
- Tarix va statistikani bitta yagona obyektda yuritish.

---

## 2. Tavsiya etilgan fayllar tuzilmasi

Loyihani quyidagi papka va fayllar ko'rinishida tashkil qilishingiz tavsiya etiladi:

```
notifyhub/
├── src/
│   ├── channels/
│   │   ├── base.ts                 # Channel interfeysi (Bridge realizatsiyasi)
│   │   ├── console.ts              # ConsoleChannel
│   │   ├── file.ts                 # FileChannel
│   │   ├── telegram.ts             # TelegramChannel
│   │   ├── sms-adapter.ts          # Adapter + LegacySmsGateway
│   │   └── factory.ts              # ChannelFactory (Factory Method - bonus)
│   ├── notifications/
│   │   ├── base.ts                 # Notification abstraksiyasi (Bridge abstraksiyasi)
│   │   └── types.ts                # AlertNotification, ReminderNotification, PromoNotification
│   ├── locales/
│   │   ├── base.ts                 # LocaleFactory & NotificationTemplate interfeyslari
│   │   └── factories.ts            # UzFactory, RuFactory, EnFactory (Abstract Factory)
│   ├── decorators/
│   │   └── message-decorators.ts   # Decorator (Timestamp, Signature, Encrypt, Urgent)
│   ├── recipients/
│   │   └── recipients.ts           # Composite (Recipient, User, Group - bonus)
│   ├── templates/
│   │   └── prototype.ts            # Prototype (BroadcastTemplate & clone - bonus)
│   ├── core/
│   │   ├── history.ts              # Singleton (NotificationHistory)
│   │   ├── builder.ts              # Builder (NotificationBuilder - bonus)
│   │   └── hub.ts                  # Facade (NotifyHub - bonus)
│   └── index.ts                    # Foydalanuvchi konsol menyusi (CLI)
├── tests/
│   └── patterns.test.ts            # O'zingiz yozadigan unit-testlar
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. 0-Qadam: Loyiha muhitini sozlash

Loyiha papkasida terminalni oching va quyidagi amallarni bajaring:

### 3.1. Node.js paketini ishga tushirish
```bash
npm init -y
```

### 3.2. Kerakli TypeScript kutubxonalarini o'rnatish
```bash
npm install -D typescript @types/node tsx
```
* `typescript` — TypeScript tili kompilyatori (`tsc`).
* `@types/node` — Node.js ichki modullari (`fs`, `path`, `readline`, `Buffer`) turlari.
* `tsx` — TypeScript fayllarini kompilyatsiyasiz darhol ishga tushiruvchi qulay vosita.

### 3.3. `package.json` ni sozlash
`package.json` faylini ochib, quyidagi qismlarni qo'shing:
```json
{
  "name": "notifyhub",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx src/index.ts",
    "build": "tsc",
    "test": "tsx --test tests/**/*.test.ts"
  }
}
```

### 3.4. `tsconfig.json` yaratish
Loyiha ildizida `tsconfig.json` faylini yarating:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"],
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

---

## 4. 1-Qadam: Bridge Pattern

### 🎯 Nazariya: Bu pattern nima uchun kerak?
Agar siz oddiy merosxo'rlikdan (inheritance) foydalansangiz, har bir bildirishnoma turi va kanal kombinatsiyasi uchun alohida klass yaratishingiz kerak bo'lardi:
`ConsoleAlert`, `TelegramAlert`, `SmsAlert`, `FileAlert`, `ConsoleReminder`, `TelegramReminder`...
Bu **sinflar portlashiga (class explosion)** olib keladi ($3 \text{ tur} \times 4 \text{ kanal} = 12 \text{ ta klass}$).

**Bridge yechimi:**
Bildirishnoma turini (**Abstraksiya**) va yetkazish usulini (**Realizatsiya / Kanal**) ikkita alohida ierarxiyaga ajratadi. `Notification` o'zida `Channel` ga havola (ko'prik) saqlaydi.

### 🛠 Qanday amalga oshiriladi?

1. `src/channels/base.ts` da kanal interfeysini yozing:
   ```typescript
   export interface Channel {
     readonly name: string;
     send(recipient: string, text: string, priorityCode?: number): boolean;
   }
   ```

2. Kanallarni realizatsiya qiling:
   - `src/channels/console.ts`: `console.log([Console → ${recipient}] ${text})`
   - `src/channels/telegram.ts`: `console.log([Telegram ✈️ → ${recipient}] ${text})`
   - `src/channels/file.ts`: `fs.appendFileSync(...)` orqali faylga yozish

3. `src/notifications/base.ts` da mavhum sinfni yarating:
   ```typescript
   import { Channel } from "../channels/base.js";

   export abstract class Notification {
     constructor(protected channel: Channel) {}

     public abstract readonly type: string;
     public abstract readonly priorityCode: number;

     public send(recipient: string, text: string): boolean {
       return this.channel.send(recipient, text, this.priorityCode);
     }

     public setChannel(channel: Channel): void {
       this.channel = channel;
     }
   }
   ```

4. `src/notifications/types.ts` da turlarni yarating:
   - `AlertNotification`: `priorityCode = 1`, `type = "alert"`
   - `ReminderNotification`: `priorityCode = 2`, `type = "reminder"`
   - `PromoNotification`: `priorityCode = 3`, `type = "promo"`

✅ **Tekshirish:** Istalgan bildirishnomaga istalgan kanalni berib `send()` chaqira olishingiz kerak:
`new AlertNotification(new TelegramChannel()).send("Aziz", "Diqqat!")`

---

## 5. 2-Qadam: Abstract Factory Pattern

### 🎯 Nazariya: Bu pattern nima uchun kerak?
Ilovamiz 3 ta tilda xabar tayyorlashi kerak: o'zbek, rus, ingliz.
Har bir til uchun 3 ta shablon bor: Alert, Reminder, Promo.
Agar biz shunchaki shartlar (`if/else`) yozsak, bitta xabarda prefiks o'zbekcha, asosiy qismi ruscha bo'lib **aralashib ketish** xavfi tug'iladi.

**Abstract Factory yechimi:**
Til oilasiga tegishli shablonlarni bitta fabrika orqali yaratish. Masalan, `UzFactory` faqat o'zbekcha shablonlar to'plamini, `RuFactory` faqat ruscha to'plamni beradi.

### 🛠 Qanday amalga oshiriladi?

1. `src/locales/base.ts`:
   ```typescript
   export interface NotificationTemplate {
     render(content: string): string;
   }

   export interface LocaleFactory {
     createAlertTemplate(): NotificationTemplate;
     createReminderTemplate(): NotificationTemplate;
     createPromoTemplate(): NotificationTemplate;
     getLanguageCode(): string;
   }
   ```

2. `src/locales/factories.ts` da aniq sinflarni yozing:
   - **O'zbek shablonlari:**
     - `UzAlertTemplate`: `⚠️ DIQQAT: ${content}`
     - `UzReminderTemplate`: `⏰ Eslatma: ${content}`
     - `UzPromoTemplate`: `🎁 Aksiya: ${content}`
   - **Rus shablonlari:**
     - `RuAlertTemplate`: `⚠️ ВНИМАНИЕ: ${content}`
     - va h.k.
   - **Ingliz shablonlari:**
     - `EnAlertTemplate`: `⚠️ ALERT: ${content}`
     - va h.k.
   - `UzFactory`, `RuFactory`, `EnFactory` klasslarini yozing.
   - Til kodi (`uz`, `ru`, `en`) bo'yicha fabrikani qaytaruvchi `getLocaleFactory(langCode)` funksiyasini yozing.

✅ **Tekshirish:** `UzFactory().createAlertTemplate().render("Server to'xtadi")` chaqirilganda `⚠️ DIQQAT: Server to'xtadi` natijasi chiqishi kerak.

---

## 6. 3-Qadam: Decorator Pattern

### 🎯 Nazariya: Bu pattern nima uchun kerak?
Xabar yuborishdan oldin unga vaqt (`timestamp`), imzo (`signature`), shifrlash (`encrypt`) yoki shoshilinchlik (`urgent`) kabi qo'shimchalarni qo'shish kerak.
Agar biz buni flaglar orqali qilsak (`withTimestamp: boolean, isUrgent: boolean...`), kod juda ko'p `if/else` shartlariga to'lib ketadi va tartibni erkin boshqarib bo'lmaydi.

**Decorator yechimi:**
Xabarni xuddi piyoz qavatlari kabi ustma-ust o'rab (wrap) boruvchi bezakchi sinflar zanjirini tuzish.

### 🛠 Qanday amalga oshiriladi?

`src/decorators/message-decorators.ts` faylida:

1. **Baza interfeysi va asosiy komponent:**
   ```typescript
   export interface MessageComponent {
     getText(): string;
   }

   export class TextMessage implements MessageComponent {
     constructor(private readonly text: string) {}
     public getText(): string {
       return this.text;
     }
   }
   ```

2. **Mavhum Bezakchi (Base Decorator):**
   ```typescript
   export abstract class MessageDecorator implements MessageComponent {
     constructor(protected readonly wrappee: MessageComponent) {}
     public getText(): string {
       return this.wrappee.getText();
     }
   }
   ```

3. **Aniq bezakchilar (Concrete Decorators):**
   - `TimestampDecorator`: sana/vaqt qo'shadi -> `${this.wrappee.getText()} [21.11.2026 15:30]`
   - `SignatureDecorator`: imzo qo'shadi -> `${this.wrappee.getText()} — NotifyHub jamoasi`
   - `UrgentDecorator`: boshiga `🔴 ` va matnni `toUpperCase()` qiladi
   - `EncryptDecorator`: matnni Base64 ga o'giradi -> `[ENCRYPTED:${base64}]`

✅ **Tekshirish:**
```typescript
const msg = new SignatureDecorator(
  new TimestampDecorator(new TextMessage("Dars ko'chirildi"))
);
console.log(msg.getText());
// Natija: Dars ko'chirildi [21.11.2026 15:30] — NotifyHub jamoasi
```

---

## 7. 4-Qadam: Adapter Pattern

### 🎯 Nazariya: Bu pattern nima uchun kerak?
Tizimga eski SMS shlyuzi (`LegacySmsGateway`) berilgan. U tashqi kutubxona bo'lgani uchun uning kodini **o'zgartirish qat'iyan taqiqlanadi**.
Lekin uning metodi bizning `Channel.send(recipient, text)` interfeysimizga umuman to'g'ri kelmaydi:
- U matnni emas, baytlar to'plamini (`Buffer`) qabul qiladi;
- U alohida `priorityCode` (1, 2, 3) talab qiladi;
- U mantiqiy `true/false` o'rniga HTTP status raqami `200` yoki `400` qaytaradi.

**Adapter yechimi:**
`SmsChannelAdapter` orqali yangi interfeys va eski shlyuz o'rtasida moslashtiruvchi ko'prik yaratish.

### 🛠 Qanday amalga oshiriladi?

`src/channels/sms-adapter.ts` faylida:

1. **Tashqi klass (o'zgartirilmaydi):**
   ```typescript
   export class LegacySmsGateway {
     public sendSms(phone: string, payload: Buffer, priorityCode: number): number {
       if (!phone || !phone.startsWith("+")) {
         return 400; // Xatolik kodi
       }
       return 200; // Muvaffaqiyat kodi
     }
   }
   ```

2. **Adapter sinfi:**
   ```typescript
   import { Channel } from "./base.js";

   export class SmsChannelAdapter implements Channel {
     public readonly name: string = "sms";
     private readonly gateway: LegacySmsGateway;

     constructor(gateway?: LegacySmsGateway) {
       this.gateway = gateway || new LegacySmsGateway();
     }

     public send(recipient: string, text: string, priorityCode: number = 2): boolean {
       // 1. Matnni Buffer ga o'tkazish
       const payload = Buffer.from(text, "utf-8");

       // 2. Eski shlyuzni chaqirish
       const status = this.gateway.sendSms(recipient, payload, priorityCode);

       // 3. 200 kodini boolean ga aylantirish
       const success = status === 200;
       if (success) {
         console.log(`[SMS → ${recipient}] ${text}`);
       } else {
         console.error(`[SMS Xato → ${recipient}] Status: ${status}`);
       }
       return success;
     }
   }
   ```

---

## 8. 5-Qadam: Singleton Pattern

### 🎯 Nazariya: Bu pattern nima uchun kerak?
Yuborilgan bildirishnomalar tarixi va statistikasini butun dastur bo'yicha yagona xotirada saqlash zarur. Agar dasturning har bir qismida alohida `History` obyekti ochilsa, ma'lumotlar tarqoq bo'lib ketadi.

**Singleton yechimi:**
Klass konstruktorini `private` qilib, obyektga yagona kirish nuqtasi sifatida `getInstance()` statik metodini taqdim etish.

### 🛠 Qanday amalga oshiriladi?

`src/core/history.ts` faylida:

```typescript
export interface NotificationRecord {
  id: number;
  timestamp: Date;
  recipientName: string;
  recipientContact: string;
  channel: string;
  type: string;
  text: string;
  success: boolean;
}

export class NotificationHistory {
  private static instance: NotificationHistory | null = null;
  private readonly records: NotificationRecord[] = [];
  private nextId: number = 1;

  // 1. Konstruktor private bo'lishi shart!
  private constructor() {}

  // 2. Yagona instansiyani qaytaruvchi metod
  public static getInstance(): NotificationHistory {
    if (!NotificationHistory.instance) {
      NotificationHistory.instance = new NotificationHistory();
    }
    return NotificationHistory.instance;
  }

  public log(entry: Omit<NotificationRecord, "id" | "timestamp">): void {
    this.records.push({
      id: this.nextId++,
      timestamp: new Date(),
      ...entry,
    });
  }

  public getHistory(): NotificationRecord[] {
    return [...this.records];
  }

  public getStats() {
    // totalSent, byChannel, byType va failures sonini hisoblash
    ...
  }

  public clear(): void {
    this.records.length = 0;
  }
}
```

---

## 9. Bonus Qadamlar: Qo‘shimcha 5 ta Pattern

Topshiriqda qo'shimcha ball olish uchun ushbu bonus patternlarni ketma-ketlikda qo'shing:

### Bonus 1: Composite Pattern
* **Fayl:** `src/recipients/recipients.ts`
* **Vazifasi:** Qabul qiluvchilarni guruhlar va foydalanuvchilar daraxtiga aylantirish.
* **Qanday tuziladi:**
  - `Recipient` interfeysi: `getName()`, `getContact()`, `getUsers(): User[]`.
  - `User` (Leaf): Bitta foydalanuvchi, `getUsers()` o'zini (`[this]`) qaytaradi.
  - `Group` (Composite): Ichida `Recipient[]` ro'yxati saqlanadi, `add(recipient)` metodi bo'ladi. `getUsers()` ichidagi barcha guruhlar va foydalanuvchilarni rekursiv aylanib chiqadi.
  - *Misol:* «3-kurs» guruhi «301-guruh» va «302-guruh»ni o'z ichiga oladi.

### Bonus 2: Factory Method Pattern
* **Fayl:** `src/channels/factory.ts`
* **Vazifasi:** Kanal nomi (`"console"`, `"file"`, `"telegram"`, `"sms"`) orqali mos kanal obyektini qaytarish.
* **Qanday tuziladi:**
  ```typescript
  export class ChannelFactory {
    public static create(type: string): Channel {
      switch (type.toLowerCase()) {
        case "console": return new ConsoleChannel();
        case "file": return new FileChannel();
        case "telegram": return new TelegramChannel();
        case "sms": return new SmsChannelAdapter();
        default: throw new Error(`Noma'lum kanal: ${type}`);
      }
    }
  }
  ```

### Bonus 3: Builder Pattern
* **Fayl:** `src/core/builder.ts`
* **Vazifasi:** Ko'p parametrlarga ega xabarni qadamma-qadam zanjirsimon yig'ish.
* **Qanday tuziladi:**
  - Metodlar: `.setType(type)`, `.setLocale(locale)`, `.setChannel(channel)`, `.setTo(recipient)`, `.setText(text)`, `.withTimestamp()`, `.withSignature()`, `.withUrgent()`, `.withEncrypt()`.
  - `.build()` metodi Abstract Factory va Decoratorlarni ishga tushirib, to'liq tayyorlangan `Notification` va yakuniy xabar matnini qaytaradi.

### Bonus 4: Prototype Pattern
* **Fayl:** `src/templates/prototype.ts`
* **Vazifasi:** Tayyor tarqatma shablonlarini klonlash.
* **Qanday tuziladi:**
  - `BroadcastTemplate` sinfi: `id`, `name`, `type`, `locale`, `channel`, `content`, `decorators`.
  - `clone(overrides)` metodi: Obyektning chuqur nusxasini olib, berilgan maydonlarni yangilaydi.
  - `TemplateRegistry` reestri: "Haftalik eslatma", "Xavfsizlik ogohlantirishi" kabi shablonlarni saqlaydi.

### Bonus 5: Facade Pattern
* **Fayl:** `src/core/hub.ts`
* **Vazifasi:** Butun tizimni bitta qulay fasad orqasiga yashirish.
* **Qanday tuziladi:**
  - `NotifyHub` sinfi:
    - Boshlang'ich guruhlar va foydalanuvchilarni sozlaydi.
    - `send(options)`: Builder, Composite, Bridge, Decorator va Tarixni birlashtirib bir chaqiruvda xabar yuboradi.
    - `sendFromTemplate(templateId, overrides)`: Prototype ni klonlab yuboradi.
    - `showHistory()` va `showStats()`: Singleton dagi ma'lumotlarni chiroyli formatda chop etadi.

---

## 10. Konsol menyusi (CLI) yaratish

`src/index.ts` faylida foydalanuvchi bilan muloqot qiluvchi konsol menyusini yarating:

```
========= NotifyHub =========
1. Bildirishnoma yuborish
2. Tarix
3. Statistika
4. Tarqatma shablonlari (Prototype)
5. Qabul qiluvchilar tuzilmasi (Composite)
0. Chiqish
```

Node.js da foydalanuvchidan ma'lumot kiritishni so'rash uchun `node:readline` modulidan foydalanish tavsiya etiladi:
```typescript
import * as readline from "readline";

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
const lines = rl[Symbol.asyncIterator]();

async function ask(promptText: string): Promise<string> {
  process.stdout.write(promptText);
  const next = await lines.next();
  return next.value || "";
}
```

---

## 11. O‘zini tekshirish checklisti

O'z kodingizni tekshirish uchun ushbu nazorat ro'yxatidan foydalaning:

- [ ] Yangi kanal (masalan, `SlackChannel`) qo'shganingizda `AlertNotification` yoki `ReminderNotification` sinflarini o'zgartirish shart emasmi? (**Bridge**)
- [ ] Til tanlaganda (`uz`, `ru`, `en`) barcha shablonlar faqat o'sha tilda chiqayaptimi, boshqa til aralashib ketmayaptimi? (**Abstract Factory**)
- [ ] `Timestamp`, `Signature`, `Encrypt`, `Urgent` bezakchilarini ixtiyoriy tartibda qo'llash mumkinmi? (**Decorator**)
- [ ] `LegacySmsGateway` kodi o'zgartirilmagan holda, uning `200/400` statusi va `Buffer` talabi `SmsChannelAdapter` orqali to'g'ri moslashganmi? (**Adapter**)
- [ ] Dasturning turli joylarida chaqirilganda `NotificationHistory` yagona ma'lumotlar ombori sifatida ishlayaptimi? (**Singleton**)
- [ ] Guruhga («3-kurs») yuborilgan xabar uning ichidagi barcha guruhlar va foydalanuvchilarga rekursiv yetib boryaptimi? (**Composite**)
- [ ] `NotificationBuilder` zanjirsimon tarzda to'liq ob'yekt qura olyaptimi? (**Builder**)
- [ ] Shablon `clone()` orqali nusxalanib yangi parametrlar berilganda asl shablon o'zgarishsiz qoladimi? (**Prototype**)
- [ ] `main.ts` quyi tizimlarning ichki tuzilishini bilmasdan faqat `NotifyHub` fasadiga murojaat qiladimi? (**Facade**)
- [ ] Har bir pattern kodi yonida docstring va tushuntirish izohlari bormi?

---

## 12. Himoya uchun nazorat savollari va javoblar

Laboratoriya ishini himoya qilish jarayonida o'qituvchi berishi mumkin bo'lgan nazorat savollari:

### 1. Bridge oddiy merosdan (`TelegramAlert`, `SmsAlert`, `FileReminder`…) nimasi bilan farq qiladi? Bridge bo'lmaganda nechta klass kerak bo'lardi?
* **Javob:**
  Oddiy merosda har bir yangi xususiyat uchun alohida klass yaratiladi va sinflar soni kombinatorik ravishda ko'payib ketadi (*class explosion*). $M$ ta bildirishnoma turi va $N$ ta kanal bo'lsa, **$M \times N$** ta klass (bizning holatda $3 \times 4 = 12$ ta klass) kerak bo'lardi.
  Bridge esa abstraksiya va realizatsiyani ajratadi va kompozitsiya orqali bog'laydi. Natijada atigi **$M + N$** ta klass (bizda $3 + 4 = 7$ ta klass) yetarli bo'ladi. Yangi kanal qo'shilganda esa faqat 1 ta sinf yoziladi, mavjud kodga tegilmaydi.

### 2. Nima uchun tillar uchun Factory Method emas, Abstract Factory mos keladi?
* **Javob:**
  Factory Method faqat bitta mahsulot (masalan, faqat bitta shablon) yaratishga xizmat qiladi.
  Abstract Factory esa **o'zaro bog'liq bo'lgan mahsulotlar oilasini** yaratadi (bitta til uchun Alert, Reminder va Promo shablonlari to'plami). Bu orqali xabarning bosh qismi o'zbekcha, ikkinchi qismi ruscha bo'lib qolishi (inkonsistentlik) oldi olinadi.

### 3. Decorator `Notification` ga `with_timestamp=True, encrypt=True` kabi flaglar qo'shishdan nimasi bilan yaxshiroq?
* **Javob:**
  1. *Ochiqlik/Yopiqlik printsipi (OCP):* Yangi bezak (masalan, `WatermarkDecorator`) qo'shilganda asosiy `Notification` kodini tahrirlash shart emas.
  2. *Yagona javobgarlik printsipi (SRP):* Har bir bezak alohida sinfda joylashadi, asosiy klass ortiqcha yukdan xoli bo'ladi.
  3. *Moslashuvchanlik:* Bezaklarni istalgan tartibda o'rash mumkin (avval vaqt qo'yib keyin shifrlash yoki aksincha). Flaglar bilan esa bu juda murakkab `if/else` tarmoqlariga olib keladi.

### 4. Nima uchun `LegacySmsGateway` ni bizning interfeysga moslab o'zgartirib bo'lmaydi?
* **Javob:**
  Haqiqiy dasturlash amaliyotida `LegacySmsGateway` uchinchi tomon tashqi kutubxonasi (yopiq SDK yoki npm paketi) hisoblanadi. Uning kodiga kirish imkoni bo'lmasligi mumkin yoki kutubxona yangilanganda kiritilgan o'zgarishlar o'chib ketadi. Shuningdek, boshqa tizimlar ham unga bog'langan bo'lishi mumkin. Adapter mavjud kodni o'zgartirmasdan, uni yangi tizimga integratsiya qiladi.

### 5. Singleton patternning qanday kamchiliklari bor? Uni qachon ishlatmaslik kerak?
* **Javob:**
  1. *Global holat (Global state):* Dasturning istalgan nuqtasidan o'zgartirilishi mumkin bo'lgan holat paydo bo'ladi va bu nojo'ya ta'sirlarni (side-effects) keltirib chiqarishi mumkin.
  2. *Unit-testlash qiyinligi:* Testlar bir-biriga bog'liq bo'lib qoladi, chunki xotira yagona. Har bir testdan oldin holatni tozalash (`clear()`) talab etiladi.
  3. *Qachon ishlatmaslik kerak:* Har bir foydalanuvchi yoki so'rov uchun alohida nusxa kerak bo'lganda, yoki zamonaviy Dependency Injection (DI) vositalari mavjud bo'lganda klassik Singleton ishlatilmasligi kerak.
