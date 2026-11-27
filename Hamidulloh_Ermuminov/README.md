# NotifyHub — Bildirishnomalar Xizmati

OOP va 5 ta majburiy dizayn pattern asosida TypeScript (Node.js) da yozilgan konsol ilova (**Laboratoriya ishi №1**).

## Loyiha tuzilmasi

```text
Hamidulloh_Ermuminov/
├── src/
│   ├── main.ts                          # Konsol menyusi
│   ├── types.ts                         # Umumiy domen turlari
│   ├── core/
│   │   └── history.ts                   # Singleton — NotificationHistory
│   ├── notifications/
│   │   ├── base.ts                      # Bridge abstraksiyasi — Notification
│   │   └── types.ts                     # AlertNotification, ReminderNotification, PromoNotification
│   ├── channels/
│   │   ├── base.ts                      # Bridge realizatsiyasi — Channel interfeysi
│   │   ├── console.ts                   # ConsoleChannel
│   │   ├── file.ts                      # FileChannel
│   │   ├── telegram.ts                  # TelegramChannel (imitatsiya)
│   │   └── sms_adapter.ts               # Adapter — SmsChannelAdapter + LegacySmsGateway
│   ├── locales/
│   │   └── factories.ts                 # Abstract Factory — UzFactory, RuFactory, EnFactory
│   ├── decorators/
│   │   └── message_decorators.ts        # Decorator — Timestamp, Signature, Encrypt, Urgent
│   └── recipients/
│       └── recipients.ts                # Recipient modeli
├── tests/
│   └── notifyhub.test.ts                # 5 ta pattern uchun unit-testlar
├── package.json
└── tsconfig.json
```

## Qo'llanilgan dizayn patternlar (5 ta majburiy)

| № | Pattern | Fayl | Vazifasi |
|---|---|---|---|
| 1 | **Bridge** | `src/notifications/base.ts`, `src/notifications/types.ts`, `src/channels/*.ts` | Bildirishnoma turi (`Notification`) va yetkazish kanali (`Channel`) bir-biridan mustaqil rivojlanadi. Yangi kanal qo'shish `Notification` klasslarini o'zgartirmaydi. |
| 2 | **Abstract Factory** | `src/locales/factories.ts` | Bitta til (`uz`, `ru`, `en`) uchun o'zaro mos `Alert`, `Reminder`, `Promo` shablonlar oilasini yaratadi; bitta xabarda tillar aralashib ketmaydi. |
| 3 | **Decorator** | `src/decorators/message_decorators.ts` | Xabar matniga vaqt belgisi (`TimestampDecorator`), imzo (`SignatureDecorator`), shifrlash (`EncryptDecorator`) va shoshilinch belgi (`UrgentDecorator`) istalgan tartibda qo'shiladi. |
| 4 | **Adapter** | `src/channels/sms_adapter.ts` | O'zgartirib bo'lmaydigan `LegacySmsGateway.sendSms(phone, payload, priorityCode)` interfeysini `Channel.send()` interfeysiga moslashtiradi. |
| 5 | **Singleton** | `src/core/history.ts` | `NotificationHistory.getInstance()` butun ilova bo'ylab tarix va statistikani saqlovchi yagona obyekt. |

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
