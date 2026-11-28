# NotifyHub (TypeScript)

NotifyHub — bildirishnomalarni konsol, fayl, Telegram (imitatsiya) va SMS
(imitatsiya) orqali tarqatadigan o'quv loyihasi. Tarmoq so'rovlari bajarilmaydi.

## Ishga tushirish

Node.js 22 yoki yangiroq versiya kerak.

```bash
npm install
npm run build
npm start
```

Rivojlantirish vaqtida TypeScript manbasini Node.js bilan bevosita ishga
tushirish ham mumkin:

```bash
npm run dev
```

`file` kanali xabarlarni loyiha papkasidagi `notifications.log` fayliga yozadi.
SMS kanalida xalqaro telefon raqami kerak (masalan, `+998901112233`); noto'g'ri
raqam `400` xato kodini qaytaradi. `3-kurs` guruhi ikkita namunaviy foydalanuvchini
o'z ichiga oladi. Istalgan boshqa qabul qiluvchi kiritilsa, u bitta foydalanuvchi
sifatida ishlatiladi. Tarix har bir qabul qiluvchi, yuborilgan matn, kanal, tur,
vaqt va natijani saqlaydi; statistika muvaffaqiyatli yuborishlarni xatolardan
alohida ko'rsatadi.

## Papkalar

```text
src/
├── main.ts                  # Konsol menyusi
├── core/
│   ├── builder.ts           # Tarqatmani yig'ish
│   ├── history.ts           # Tarix va statistika
│   └── hub.ts               # Soddalashtirilgan asosiy interfeys
├── notifications/           # Bildirishnoma turlari
├── channels/                # Yuborish kanallari va SMS adapteri
├── locales/                 # Til shablonlari
├── decorators/              # Xabar o'ramlari
└── recipients/              # Foydalanuvchi va guruhlar
```

## Ishlatilgan patternlar

### Majburiy

1. **Bridge** — `Notification` va `Channel` alohida abstraksiyalar. Bildirishnoma
   turi kanalni bilmaydi; yangi kanal turlarga tegmasdan qo'shiladi.
2. **Abstract Factory** — `UzFactory`, `RuFactory`, `EnFactory` bir tilga mos
   ogohlantirish, eslatma va reklama shablonlarini yaratadi.
3. **Decorator** — vaqt, imzo, Base64 kodlash va shoshilinch belgi xabarga
   mustaqil va foydalanuvchi tanlagan tartibda qo'shiladi.
4. **Adapter** — `SmsChannelAdapter` umumiy `Channel.send` chaqirig'ini eski
   `LegacySmsGateway.send_sms` interfeysiga aylantiradi.
5. **Singleton** — `NotificationHistory.getInstance()` butun dastur uchun
   yagona tarixni va kanal/tur bo'yicha statistikani taqdim etadi.

### Bonus

1. **Composite** — `GroupRecipient` ichma-ich guruhlarni ochib, har bir
   `UserRecipient` ga alohida yuboradi.
2. **Builder** — `NotificationBuilder` tarqatma parametrlarini zanjirli
   chaqiriqlar orqali yig'adi va tekshiradi.
3. **Facade** — `NotifyHub` yuborish, tarixni ko'rsatish va statistika olish
   kabi ichki ishlarni menyudan yashiradi.
