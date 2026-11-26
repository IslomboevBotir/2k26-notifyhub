# 🧩 NotifyHub — Bildirishnomalar Xizmati (Laboratoriya ishi №1)

**NotifyHub** — bildirishnomalarni tarqatish xizmatini modellashtiruvchi zamonaviy, toza arxitekturali konsol ilovasi. Ushbu loyiha banklar, internet-do'konlar va universitet portallari kabi yirik korporativ tizimlarda bildirishnomalarni turli kanallar orqali yuborish mexanizmini modellashtiradi.

Loyiha **TypeScript** tilida **OOP (Obyektga yo'naltirilgan dasturlash)** tamoyillari, **SOLID** printsiplari hamda **Clean Code** standartlariga qat'iy tayangan holda ishlab chiqilgan.

---

## 📑 Mundarija
1. [Loyiha Imkoniyatlari](#-loyiha-imkoniyatlari)
2. [Loyiha Tuzilmasi](#-loyiha-tuzilmasi)
3. [Qo'llanilgan Dizayn Patternlari (10 ta)](#-qollanilgan-dizayn-patternlari)
   - [Majburiy Patternlar (5 ta)](#1-majburiy-patternlar)
   - [Bonus Patternlar (5 ta)](#2-bonus-patternlar)
4. [Ishga tushirish va Testlash](#-ishga-tushirish-va-testlash)
5. [Konsol Dasturi Ishlashiga Misol](#-konsol-dasturi-ishlashiga-misol)
6. [❓ Himoya uchun nazorat savollariga javoblar](#-himoya-uchun-nazorat-savollariga-javoblar)

---

## 🚀 Loyiha Imkoniyatlari
- **Turli xil bildirishnomalar**: Ogohlantirish (*Alert*), Eslatma (*Reminder*), Reklama/Aksiya (*Promo*).
- **Turli yetkazish kanallari**: Konsol (*Console*), Log-fayl (*File*), Telegram (*Telegram* imitatsiyasi), SMS (*Legacy Gateway* adapter orqali).
- **Ko'p tillilik (i18n)**: O'zbek (*uz*), Rus (*ru*), Ingliz (*en*).
- **Moslashuvchan qayta ishlash (Dekoratorlar)**: Vaqt tamg'asi (*timestamp*), Imzo (*signature*), Shifrlash (*encrypt* — Base64/Caesar), Tezkor xabar (*urgent* — UPPERCASE + 🔴).
- **Guruhlar va qabul qiluvchilar daraxti**: Foydalanuvchilar va ularning iyerarxik guruhlari (rekursiv yetkazish).
- **Tarix va Statistika**: Yuborilgan barcha bildirishnomalar auditi, kanal va turlar kesimidagi batafsil tahlil.
- **Tarqatma shablonlari**: Saqlangan kampaniyalarni nusxalab (*clone*) qayta ishlatish.

---

## 📂 Loyiha Tuzilmasi

```
NotifyHub/
├── package.json                    # Loyiha konfiguratsiyasi va npm skriptlari
├── tsconfig.json                   # TypeScript sozlamalari
├── logs/
│   └── notifications.log           # FileChannel tomonidan yoziladigan log fayli
├── src/
│   ├── index.ts                    # Konsol interfeysi (CLI menyu)
│   ├── types/
│   │   └── index.ts                # Umumiy enum va interfeyslar
│   ├── core/
│   │   ├── hub.facade.ts           # [Pattern: Facade] Quyi tizimlarni boshqaruvchi yagona fasad
│   │   ├── history.singleton.ts    # [Pattern: Singleton] Tarix va statistika yagona obyekti
│   │   └── notification.builder.ts # [Pattern: Builder] Bildirishnomani ravon yig'uvchi builder
│   ├── notifications/
│   │   ├── notification.base.ts    # [Pattern: Bridge - Abstraction] Bildirishnoma bazaviy klassi
│   │   └── notification.types.ts   # [Pattern: Bridge - Refined Abstractions] Alert, Reminder, Promo
│   ├── channels/
│   │   ├── channel.interface.ts    # [Pattern: Bridge - Implementor] Kanal interfeysi
│   │   ├── channel.factory.ts      # [Pattern: Factory Method] Kanal yaratuvchi factory
│   │   ├── console.channel.ts      # Konsolga chiqaruvchi kanal
│   │   ├── file.channel.ts         # logs/notifications.log ga yozuvchi kanal
│   │   ├── telegram.channel.ts     # Telegram imitatsiya kanali
│   │   ├── legacy-sms-gateway.ts   # O'zgartirib bo'lmaydigan tashqi SMS shlyuz (Adaptee)
│   │   └── sms-adapter.channel.ts  # [Pattern: Adapter] Legacy gateway ni Channel ga moslovchi
│   ├── locales/
│   │   ├── template.interface.ts   # [Pattern: Abstract Factory] Abstract Products
│   │   ├── locale-factory.interface.ts # [Pattern: Abstract Factory] Abstract Factory
│   │   ├── uz.factory.ts           # O'zbek tili shablonlari va fabrikasi
│   │   ├── ru.factory.ts           # Rus tili shablonlari va fabrikasi
│   │   ├── en.factory.ts           # Ingliz tili shablonlari va fabrikasi
│   │   └── locale-provider.ts      # Til fabrikasini olish utilitasi
│   ├── decorators/
│   │   ├── message.interface.ts    # Component interfeysi (IMessage)
│   │   ├── base-message.ts         # Concrete Component (BaseMessage)
│   │   ├── message-decorator.base.ts # Base Decorator
│   │   ├── timestamp.decorator.ts  # [Pattern: Decorator] Sana va vaqt qo'shuvchi
│   │   ├── signature.decorator.ts  # [Pattern: Decorator] Rasmiy imzo qo'shuvchi
│   │   ├── encrypt.decorator.ts    # [Pattern: Decorator] Shifrlash (Base64 / Sezar)
│   │   └── urgent.decorator.ts     # [Pattern: Decorator] Shoshilinch (UPPERCASE + 🔴)
│   ├── recipients/
│   │   ├── recipient.interface.ts  # [Pattern: Composite - Component] Qabul qiluvchi interfeysi
│   │   ├── user.ts                 # [Pattern: Composite - Leaf] Yakka foydalanuvchi
│   │   ├── group.ts                # [Pattern: Composite - Composite] Guruh (rekursiv daraxt)
│   │   └── recipient-registry.ts   # Dastlabki namunaviy ma'lumotlar ombori
│   └── prototypes/
│       └── campaign-template.prototype.ts # [Pattern: Prototype] Tarqatma shablonlari
├── tests/
│   └── notifyhub.test.ts           # Barcha 10 ta patternni tekshiruvchi 21 ta unit-test
└── README.md                       # Loyiha hujjati va nazorat savollariga javoblar
```

---

## 🧩 Qo'llanilgan Dizayn Patternlari

Loyihada **5 ta majburiy** va **5 ta bonus** — jami **10 ta GOF dizayn patterni** to'liq va amaliy vazifalar uchun qo'llanilgan.

### 1. Majburiy Patternlar

#### 1. Bridge Pattern (`src/notifications/`, `src/channels/`)
- **Vazifasi**: Bildirishnoma turi (**Abstraksiya**: `Notification` -> `AlertNotification`, `ReminderNotification`, `PromoNotification`) va Yetkazish usulini (**Realizatsiya**: `IChannel` -> `ConsoleChannel`, `FileChannel`, `TelegramChannel`, `SmsChannelAdapter`) bir-biridan mustaqil ajratadi.
- **Koddagi o'rni**: `Notification` klassi `IChannel` obyektini kompozitsiya orqali qabul qiladi.
- **Afzalligi**: Yangi kanal (masalan, `SlackChannel` yoki `WhatsAppChannel`) qo'shilganda `Notification` klasslariga hech qanday o'zgartirish kiritilmaydi (Open/Closed Principle).

#### 2. Abstract Factory Pattern (`src/locales/`)
- **Vazifasi**: Bitta tilga tegishli o'zaro mos obyektlar oilasini (Alert, Reminder, Promo shablonlari) yaratish.
- **Tuzilishi**:
  - `ILocaleFactory` — abstrakt fabrika;
  - `UzLocaleFactory`, `RuLocaleFactory`, `EnLocaleFactory` — aniq fabrikalar;
  - Har bir fabrika tegishli tildagi prefikslar va qoidalarga ega `render()` mahsulotlarini qaytaradi.
- **Talab bajarilishi**: Bitta xabarda tillar aralashib ketishi arxitektura darajasida imkonsiz.

#### 3. Decorator Pattern (`src/decorators/`)
- **Vazifasi**: Xabar matniga asosiy mantiqni o'zgartirmasdan dinamik ravishda qo'shimcha xatti-harakatlar (bezaklar) qo'shish.
- **Komponentlar**:
  - `BaseMessage` (asosiy komponent);
  - `TimestampDecorator` (`[21.11.2026 15:30]`);
  - `SignatureDecorator` (`— NotifyHub`);
  - `EncryptDecorator` (Base64 yoki Sezar shifri);
  - `UrgentDecorator` (matnni UPPERCASE qilish va `🔴` qo'shish).
- **Zanjirlash**: Istalgan tartibda va miqdorda o'rash mumkin: `Signature(Timestamp(Urgent(BaseMessage(...))))`.

#### 4. Adapter Pattern (`src/channels/sms-adapter.channel.ts`)
- **Vazifasi**: O'zgartirib bo'lmaydigan tashqi `LegacySmsGateway` kutubxonasini tizimning standart `IChannel` interfeysiga moslashtirish.
- **Bajaradigan ishlari**:
  1. `string` matnni `Buffer` (baytlar) ko'rinishiga o'tkazadi;
  2. `NotificationType` ni ustuvorlik kodiga aylantiradi (`Alert` -> 1, `Reminder` -> 2, `Promo` -> 3);
  3. Legacy shlyuzning HTTP javob kodini (`200`/`400`) mantiqiy `boolean` (`true`/`false`) ga o'zgartiradi.

#### 5. Singleton Pattern (`src/core/history.singleton.ts`)
- **Vazifasi**: Butun ilova bo'ylab yagona audit tarixi va statistikasini markazlashtirilgan holda saqlash.
- **Amalga oshirilishi**: Konstruktor `private`, yagona kirish nuqtasi `NotificationHistory.getInstance()`.
- **Funksiyalari**: Barcha muvaffaqiyatli va muvaffaqiyatsiz urinishlarni ro'yxatga oladi, kanallar va turlar bo'yicha hisob-kitob qiladi.

---

### 2. Bonus Patternlar

#### 6. Composite Pattern (`src/recipients/`)
- **Vazifasi**: Yakka foydalanuvchilar (`User` — Leaf) va guruhlarni (`Group` — Composite) bir xil `IRecipient` interfeysi orqali boshqarish.
- **Xususiyati**: Guruhlar ichida boshqa guruhlar bo'lishi mumkin (masalan: `3-kurs` -> `301-guruh` + `302-guruh`). Guruhga xabar yuborilganda u rekursiv tarzda barcha foydalanuvchilarga yetkaziladi.

#### 7. Builder Pattern (`src/core/notification.builder.ts`)
- **Vazifasi**: Murakkab bildirishnomalarni qadamma-qadam va ravon (*Fluent API*) sintaksis bilan yig'ish.
- **Misol**:
  ```ts
  new NotificationBuilder()
    .setType('alert')
    .setLocale('uz')
    .setChannel('sms')
    .setTo(group)
    .setText('Server ishlamayapti')
    .withTimestamp()
    .withSignature()
    .send();
  ```

#### 8. Prototype Pattern (`src/prototypes/campaign-template.prototype.ts`)
- **Vazifasi**: Saqlangan tarqatma shablonlarini chuqur nusxalash (`clone()`).
- **Xususiyati**: Asl shablon sozlamalari (kanal, til, dekoratorlar) saqlanib qoladi, yangi nusxada esa matn yoki qabul qiluvchi o'zgartirilib yuboriladi.

#### 9. Facade Pattern (`src/core/hub.facade.ts`)
- **Vazifasi**: Murakkab quyi tizimlar (Bridge, Factory, Decorator, Builder, Composite, Singleton) ustidan yagona, sodda va toza interfeys (`NotifyHub`) taqdim etish.
- `index.ts` faqatgina `NotifyHub` bilan muloqot qiladi.

#### 10. Factory Method Pattern (`src/channels/channel.factory.ts`)
- **Vazifasi**: Kanal turi satri (`console`, `file`, `telegram`, `sms`) bo'yicha mos `IChannel` obyektini yaratishni markazlashtirish.

---

## 🛠 Ishga tushirish va Testlash

Loyihada hech qanday uchinchi tomon tashqi kutubxonalari talab etilmaydi (Node.js ning o'rnatilgan TypeScript vositalaridan foydalaniladi).

### 1. Avtomatlashtirilgan Unit Testlarni ishga tushirish
Tizimdagi barcha 10 ta patternni qamrab oluvchi 21 ta test to'plami:
```bash
npm test
```
*Kutilayotgan natija*: Barcha 21 ta test muvaffaqiyatli o'tadi (`21 passed`).

### 2. Konsol ilovasini ishga tushirish
```bash
npm start
```

---

## 🖥 Konsol Dasturi Ishlashiga Misol

```
========= NotifyHub =========
1. Bildirishnoma yuborish
2. Tarix
3. Statistika
4. Tarqatma shablonlari (Prototype)
5. Qabul qiluvchilar (Composite daraxti)
0. Chiqish
> 1
Tur (alert / reminder / promo): reminder
Til (uz / ru / en): uz
Kanal (console / file / telegram / sms): sms
Qabul qiluvchi (ism yoki guruh): 3-kurs
Matn: Ertaga imtihon soat 9:00 da
Qo'shimchalar (timestamp, signature, encrypt, urgent): timestamp, signature

[SMS → +998901112233] Eslatma: Ertaga imtihon soat 9:00 da [21.11.2026 16:03] — NotifyHub
[SMS → +998907778899] Eslatma: Ertaga imtihon soat 9:00 da [21.11.2026 16:03] — NotifyHub
✅ Yuborildi: 2 tadan 2 tasi

> 3
Jami yuborilgan: 2
  console: 0 | file: 0 | telegram: 0 | sms: 2
  alert: 0 | reminder: 2 | promo: 0
  Xatolar: 0
```

---

## ❓ Himoya uchun nazorat savollariga javoblar

Himoya jarayonida ustoz tomonidan beriladigan savollarga professional akademik va amaliy javoblar:

### 1. Bridge oddiy merosdan (`TelegramAlert`, `SmsAlert`, `FileReminder`…) nimasi bilan farq qiladi? Bridge bo'lmaganda nechta klass kerak bo'lardi?
- **Javob**: Oddiy merosxo'rlik (Inheritance) ikki mustaqil o'lchovni (Bildirishnoma turi va Yetkazish kanali) bir-biriga qattiq bog'lab qo'yadi va **Klasslar portlashi** (*Class Explosion*) muammosini keltirib chiqaradi.
- **Hisob-kitob**:
  - Agar bizda $N$ ta bildirishnoma turi (masalan, 3 ta: Alert, Reminder, Promo) va $M$ ta kanal (masalan, 4 ta: Console, File, Telegram, SMS) bo'lsa:
    - **Oddiy merosda**: $N \times M = 3 \times 4 = 12$ ta alohida klass yaratish kerak bo'lardi (`ConsoleAlert`, `FileAlert`, `TelegramAlert`, `SmsAlert`, `ConsoleReminder`, ...). Har safar yangi kanal qo'shilsa yana $+N$ ta klass yozilishi shart.
    - **Bridge patternida**: $N + M = 3 + 4 = 7$ ta klass yetarli! Chunki Abstraksiya (`Notification`) va Realizatsiya (`Channel`) o'zaro kompozitsiya orqali bog'lanadi. Yangi kanal qo'shilganda esa faqat 1 ta kanal klassi yoziladi, bildirishnomalarga umuman tegilmaydi.

### 2. Nima uchun tillar uchun Factory Method emas, Abstract Factory mos keladi?
- **Javob**:
  - **Factory Method** faqat bitta mahsulot turini (masalan, faqat `NotificationTemplate`) yaratishga ixtisoslashgan.
  - **Abstract Factory** esa **o'zaro bog'liq mahsulotlar oilasini** (*Family of Related Products*) yaratadi. Bizning holatda har bir til uchun butun bir shablonlar to'plami kerak: `AlertTemplate`, `ReminderTemplate`, va `PromoTemplate`.
  - Abstract Factory bitta xabarda o'zbekcha ogohlantirish shabloni bilan ruscha eslatma shabloni aralashib ketmasligini kafolatlaydi — mijoz dastur bitta `UzLocaleFactory` ni tanlagach, u faqat o'zbek tiliga mos keluvchi shablonlar oilasi bilan ishlaydi.

### 3. Decorator `Notification` ga `with_timestamp=True, encrypt=True` kabi flaglar qo'shishdan nimasi bilan yaxshiroq?
- **Javob**:
  1. **Yagona mas'uliyat printsipi (SRP)**: Asosiy bildirishnoma klassi faqat xabarni yo'naltirish bilan shug'ullanishi kerak. Unga shifrlash, vaqt formatlash, imzo qo'yish kabi xususiyatlar yuklansa, klass "God Object"ga aylanadi.
  2. **Ochiq/Yopiq printsip (OCP)**: Yangi qo'shimcha ishlov (masalan, `WatermarkDecorator`, `HtmlSanitizeDecorator`) kerak bo'lsa, mavjud Notification kodini o'zgartirmasdan shunchaki yangi dekorator klassi yoziladi.
  3. **Kombinatorika va Tartib**: Flaglar bilan dekoratorlarning **qo'llanish tartibini** boshqarib bo'lmaydi. Masalan, avval shifrlab keyin vaqt qo'shish kerakmi yoki avval vaqt qo'shib keyin butun matnni shifrlash kerakmi? Decorator patternida bu zanjirlash tartibi orqali erkin boshqariladi: `Encrypt(Timestamp(msg))` yoki `Timestamp(Encrypt(msg))`.

### 4. Nima uchun `LegacySmsGateway` ni bizning interfeysga moslab o'zgartirib bo'lmaydi?
- **Javob**:
  1. **Uchinchi tomon (Third-party) yoki eski tizim kodi**: Real loyihalarda bunday klasslar ko'pincha tashqi kutubxona (`npm` paketi, `dll`, `jar`) yoki kompaniyaning boshqa bo'limi tomonidan yozilgan yopiq kod bo'ladi. Ularning manba kodini tahrirlash imkonsiz.
  2. **Regressiya xavfi**: Agar `LegacySmsGateway` ni o'zgartirsak, undan foydalanayotgan boshqa o'nlab eski tizimlar ishdan chiqishi mumkin.
  3. **Adapter patternining maqsadi aynan shu**: Ikki xil mos kelmaydigan interfeys o'rtasida ko'prik bo'lib berish. Biz mavjud kodga tegmasdan oraliq adapter (`SmsChannelAdapter`) orqali uni o'z tizimimiz talabiga moslashtiramiz.

### 5. Singleton patternning qanday kamchiliklari bor? Uni qachon ishlatmaslik kerak?
- **Javob**:
  - **Kamchiliklari**:
    1. **Global holat (Global State)**: Tizimning istalgan joyidan o'zgartirilishi mumkin bo'lgan holat nojo'ya oqibatlarga (*side effects*) va yashirin bog'liqliklarga olib keladi.
    2. **Unit-testlashdagi qiyinchilik**: Yagona holat testlar orasida saqlanib qolishi sababli, testlar bir-biriga ta'sir qilishi mumkin (mustaqillik buziladi). Shuning uchun testlarda `resetInstance()` kabi maxsus metodlar kiritishga to'g'ri keladi.
    3. **Ko'p oqimli (Multi-threaded) muhitda poyga holati (Race condition)**: Obyekt bir vaqtda yaratilmasligini ta'minlash uchun qulflash (Locking) mexanizmlari talab qilinadi.
  - **Qachon ishlatmaslik kerak**:
    - Oddiy biznes mantiq obyektlari, foydalanuvchi sessiyalari yoki testlanuvchanligi muhim bo'lgan modullarda.
    - Zamonaviy tizimlarda Singleton o'rniga ko'pincha **Dependency Injection (DI) Container** (masalan, Inversify, NestJS) orqali obyektdan yagona nusxa (`singleton scope`) yaratish tavsiya etiladi.
