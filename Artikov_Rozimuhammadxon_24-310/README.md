# NotifyHub — bildirishnomalar xizmati

**Laboratoriya ishi №1**
**Bajardi:** Artikov Rozimuhammadxon, 24-310 guruh
**Til:** TypeScript (OOP) · **Interfeys:** konsol menyusi

NotifyHub bildirishnomalarni tarqatish xizmatini modellashtiradi. U uch xil
bildirishnomani (alert / reminder / promo) uch tilda (uz / ru / en) to'rt kanal
orqali (console / file / telegram / sms) yuboradi. Xabarga vaqt belgisi, imzo,
shifrlash va "shoshilinch" belgisini qo'shadi, tarix va statistikani saqlaydi.
Telegram va SMS imitatsiya qilinadi, haqiqiy tarmoq so'rovlari yuborilmaydi.

---

## Ishga tushirish

Node.js 20+ kerak.

```bash
npm install          # bog'liqliklarni o'rnatish (bir marta)

npm start            # konsol menyusi
npm run demo         # barcha patternlarni avtomatik namoyish qilish
npm test             # 28 ta avtomatik test
npm run typecheck    # TypeScript tiplarini tekshirish
```

Konsol menyusi:

```
========= NotifyHub =========
1. Bildirishnoma yuborish
2. Tarix
3. Statistika
4. Tarqatma shablonlari
5. Qabul qiluvchilar
0. Chiqish
> 1
Tur (alert / reminder / promo): reminder
Til (uz / ru / en): uz
Kanal (console / file / telegram / sms): sms
Qabul qiluvchi (ism yoki guruh, ? — ro'yxat): 3-kurs
Matn: Ertaga imtihon soat 9:00 da
Qo'shimchalar (timestamp, signature, encrypt, urgent): timestamp, signature

── reminder · uz · sms → 3-kurs ──
[SMS → +998901112233] Eslatma: Ertaga imtihon soat 9:00 da [07.11.2026 15:30] — NotifyHub jamoasi
[SMS → +998907778899] Eslatma: Ertaga imtihon soat 9:00 da [07.11.2026 15:30] — NotifyHub jamoasi
✅ Yuborildi: 2 tadan 2 tasi
```

- Qo'shimchalar istalgan tartibda yoziladi va xuddi shu tartibda qo'llanadi.
  Shifrlash usuli: `encrypt` (Sezar shifri) yoki `encrypt:base64`.
- Qabul qiluvchi so'ralganda `?` kiritilsa, barcha foydalanuvchi va guruhlar
  daraxti ko'rsatiladi.
- Fayl kanali xabarlarni `outbox/notifications.log` fayliga yozadi.

---

## Loyiha tuzilmasi

```
Artikov_Rozimuhammadxon_24-310/
├── src/
│   ├── main.ts                     # konsol menyusi va --demo rejimi
│   ├── core/
│   │   ├── hub.ts                  # Facade (bonus): NotifyHub
│   │   ├── history.ts              # Singleton: NotificationHistory
│   │   ├── builder.ts              # Builder (bonus): NotificationBuilder
│   │   ├── templates.ts            # Prototype (bonus): DistributionTemplate, TemplateRegistry
│   │   ├── environment.ts          # konsolga chiqarish va log-fayl
│   │   ├── types.ts, format.ts     # umumiy turlar, sana formati
│   ├── notifications/
│   │   ├── base.ts                 # Bridge abstraksiyasi: Notification
│   │   └── types.ts                # AlertNotification, ReminderNotification, PromoNotification
│   ├── channels/
│   │   ├── base.ts                 # Bridge realizatsiyasi: Channel
│   │   ├── console.ts, file.ts, telegram.ts
│   │   ├── smsAdapter.ts           # Adapter + LegacySmsGateway
│   │   └── factory.ts              # Factory Method (bonus): ChannelFactory
│   ├── locales/
│   │   └── factories.ts            # Abstract Factory: Uz/Ru/EnFactory
│   ├── decorators/
│   │   └── messageDecorators.ts    # Decorator: Timestamp, Signature, Encrypt, Urgent
│   └── recipients/
│       ├── recipients.ts           # Composite (bonus): Recipient, User, Group
│       └── directory.ts            # namunaviy foydalanuvchilar va guruhlar
├── tests/patterns.test.ts          # har bir pattern uchun testlar (Vitest)
└── README.md
```

---

## Patternlar

### Majburiy (5 ta)

| Pattern | Fayl | Tizimdagi vazifasi |
|---|---|---|
| **Bridge** | `notifications/*`, `channels/base.ts` | Bildirishnoma turi (abstraksiya) va yetkazish kanali (realizatsiya) mustaqil. `Notification` kanalga havola saqlaydi va `channel.send()` ni chaqiradi. Yangi kanal qo'shilganda bildirishnoma klasslari o'zgarmaydi. |
| **Abstract Factory** | `locales/factories.ts` | `UzFactory`, `RuFactory`, `EnFactory` har biri bitta tilning mahsulotlar oilasini yaratadi: alert, reminder va promo shablonlari hamda imzo. Bildirishnoma faqat bitta fabrikadan foydalangani uchun tillar aralashmaydi. |
| **Decorator** | `decorators/messageDecorators.ts` | `TimestampDecorator`, `SignatureDecorator`, `EncryptDecorator` (Sezar/Base64) va `UrgentDecorator` xabarni istalgan tartibda va istalgancha o'raydi. |
| **Adapter** | `channels/smsAdapter.ts` | O'zgartirib bo'lmaydigan `LegacySmsGateway.sendSms(phone, bytes, priorityCode) → 200/400` ni `Channel.send(recipient, text) → boolean` ga moslaydi: string → bytes, Alert/Reminder/Promo → 1/2/3, 200/400 → true/false. |
| **Singleton** | `core/history.ts` | `NotificationHistory.getInstance()` yagona obyekt. Barcha yuborishlar (menyu, Builder, Prototype, bevosita Bridge) bitta tarixga yoziladi, statistika kanal, tur va til bo'yicha hamda xatolar soni bilan hisoblanadi. |

### Bonus (5 ta)

| Pattern | Fayl | Tizimdagi vazifasi |
|---|---|---|
| **Composite** | `recipients/recipients.ts` | `User` (barg) va `Group` (kompozit). «3-kurs» → «301-guruh», «302-guruh» → talabalar. `getUsers()` rekursiv ishlaydi, takroriy a'zolarni olib tashlaydi va sikllarni oldini oladi. |
| **Builder** | `core/builder.ts` | `new NotificationBuilder().type("alert").locale("uz").channel("sms").to(group).text("...").withTimestamp().build()`. Har bir qadam tekshiriladi. |
| **Prototype** | `core/templates.ts` | «Haftalik eslatma» kabi shablonlar `clone()` orqali nusxalanadi. Nusxada faqat matn yoki qabul qiluvchi o'zgaradi, asli o'zgarmaydi. |
| **Facade** | `core/hub.ts` | `NotifyHub` ning `send()`, `sendTemplate()`, `showHistory()`, `showStats()` metodlari. Konsol menyusi (`main.ts`) faqat shu klass bilan ishlaydi. |
| **Factory Method** | `channels/factory.ts` | `ChannelFactory.create("telegram")` kanalni nomi bo'yicha yaratadi. Yangi kanal `register()` bilan qo'shiladi. |

### Patternlar qanday bog'langan

```
Konsol menyusi (main.ts)
        │
        ▼
NotifyHub (Facade) ──► TemplateRegistry (Prototype: clone)
        │
        ▼
NotificationBuilder (Builder)
   ├── getLocaleFactory()      → Abstract Factory  → shablon + imzo (bir tilda)
   ├── ChannelFactory.create() → Factory Method    → Channel
   └── decoratorFor()          → Decorator zanjiri
        │
        ▼
Notification (Bridge abstraksiyasi).send(recipient)
   ├── recipient.getUsers()    → Composite (rekursiv)
   ├── channel.send()          → Console / File / Telegram / SmsChannelAdapter (Adapter)
   └── history.record()        → NotificationHistory (Singleton)
```

Bitta yuborishda 10 ta patternning barchasi ishtirok etadi. Masalan, "3-kurs"ga
SMS orqali eslatma yuborilganda shablon Abstract Factory'dan olinadi, Decorator
bilan o'raladi, Composite guruhni ikki talabaga ochadi, Adapter SMS-shlyuzni
chaqiradi va natija Singleton tarixga yoziladi.

---

## Namunaviy ma'lumotlar

```
Hammasi
├── 3-kurs
│   ├── 301-guruh: Ali Valiyev        (+998901112233, @ali_valiyev)
│   └── 302-guruh: Vali Karimov       (+998907778899, Telegram yo'q)
├── 4-kurs
│   ├── 401-guruh: Sardor Toshmatov   (+998935554433, @sardor_t)
│   │              Madina Yusupova    (90-123 — noto'g'ri raqam, @madina_y)
│   └── 402-guruh: Jasur Rahimov      (+998946667788, @jasur_r)
└── O'qituvchilar: Nodira Azimova     (+998971234567, @nodira_teacher)
```

Ba'zi ma'lumotlar ataylab noto'g'ri kiritilgan: Telegram yo'q, telefon raqami
noto'g'ri. Shu sababli xato holatlari va statistikadagi "Xatolar" soni amalda
ko'rinadi.

Tayyor shablonlar: «Haftalik eslatma», «Server ishlamayapti», «Chegirma aksiyasi».
