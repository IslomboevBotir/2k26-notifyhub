# NotifyHub — Bildirishnomalar Xizmati

OOP va dizayn patternlar asosida TypeScript (Node.js) da yozilgan konsol ilova (**Laboratoriya ishi №1**).

## Loyiha tuzilmasi

```text
Hamidulloh_Ermuminov/
├── src/
│   ├── main.ts                          # Interaktiv konsol menyusi
│   ├── types.ts                         # Umumiy domen turlari
│   ├── core/
│   │   ├── hub.ts                       # Facade (bonus) — NotifyHub
│   │   ├── history.ts                   # Singleton — NotificationHistory
│   │   ├── builder.ts                   # Builder (bonus) — NotificationBuilder
│   │   └── prototype.ts                 # Prototype (bonus) — BroadcastTemplate
│   ├── notifications/
│   │   ├── base.ts                      # Bridge abstraksiyasi — Notification
│   │   └── types.ts                     # AlertNotification, ReminderNotification, PromoNotification
│   ├── channels/
│   │   ├── base.ts                      # Bridge realizatsiyasi — Channel interfeysi
│   │   ├── factory.ts                   # Factory Method (bonus) — ChannelFactory
│   │   ├── console.ts                   # ConsoleChannel
│   │   ├── file.ts                      # FileChannel
│   │   ├── telegram.ts                  # TelegramChannel (imitatsiya)
│   │   └── sms_adapter.ts               # Adapter — SmsChannelAdapter + LegacySmsGateway
│   ├── locales/
│   │   └── factories.ts                 # Abstract Factory — UzFactory, RuFactory, EnFactory
│   ├── decorators/
│   │   └── message_decorators.ts        # Decorator — Timestamp, Signature, Encrypt, Urgent
│   └── recipients/
│       └── recipients.ts                # Composite (bonus) — User, Group
├── tests/
│   └── notifyhub.test.ts                # Patternlar uchun unit-testlar
├── package.json
└── tsconfig.json
```

## Qo'llanilgan dizayn patternlar

### Majburiy patternlar (5 ta)

| № | Pattern | Fayl | Vazifasi |
|---|---|---|---|
| 1 | **Bridge** | `src/notifications/base.ts`, `src/notifications/types.ts`, `src/channels/*.ts` | Bildirishnoma turi (`Notification`) va yetkazish kanali (`Channel`) bir-biridan mustaqil rivojlanadi. Yangi kanal qo'shish `Notification` klasslarini o'zgartirmaydi. |
| 2 | **Abstract Factory** | `src/locales/factories.ts` | Bitta til (`uz`, `ru`, `en`) uchun o'zaro mos `Alert`, `Reminder`, `Promo` shablonlar oilasini yaratadi; bitta xabarda tillar aralashib ketmaydi. |
| 3 | **Decorator** | `src/decorators/message_decorators.ts` | Xabar matniga vaqt belgisi (`TimestampDecorator`), imzo (`SignatureDecorator`), shifrlash (`EncryptDecorator`) va shoshilinch belgi (`UrgentDecorator`) istalgan tartibda qo'shiladi. |
| 4 | **Adapter** | `src/channels/sms_adapter.ts` | O'zgartirib bo'lmaydigan `LegacySmsGateway.sendSms(phone, payload, priorityCode)` interfeysini `Channel.send()` interfeysiga moslashtiradi. |
| 5 | **Singleton** | `src/core/history.ts` | `NotificationHistory.getInstance()` butun ilova bo'ylab tarix va statistikani saqlovchi yagona obyekt. |

### Bonus patternlar (5 ta)

| № | Pattern | Fayl | Vazifasi |
|---|---|---|---|
| 1 | **Composite** | `src/recipients/recipients.ts` | `User` (yakka foydalanuvchi) va `Group` (ichma-ich guruhlar, masalan `3-kurs` → `301-guruh`, `302-guruh`) yagona `RecipientComponent` interfeysi orqali ishlaydi. |
| 2 | **Builder** | `src/core/builder.ts` | `NotificationBuilder` yordamida tur, til, kanal, qabul qiluvchi, matn va dekoratorlar ketma-ketligini fluent usulda yig'adi. |
| 3 | **Prototype** | `src/core/prototype.ts` | `BroadcastTemplate.clone()` saqlangan tarqatma shablonlarini asl nusxaga ta'sir qilmasdan nusxalaydi. |
| 4 | **Facade** | `src/core/hub.ts` | `NotifyHub` klassi `send()`, `showHistory()`, `showStats()`, `sendFromTemplate()` orqali ichki murakkablikni `main.ts` dan yashiradi. |
| 5 | **Factory Method** | `src/channels/factory.ts` | `ChannelFactory.create(name)` kanal nomi bo'yicha mos kanal obyektini yaratib beradi. |

## Ishga tushirish va testlar

```powershell
cd Hamidulloh_Ermuminov
npm install
npm run build
npm start
```

Testlarni ishga tushirish:

```powershell
npm test
```
