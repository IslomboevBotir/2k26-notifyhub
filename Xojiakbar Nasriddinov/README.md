# NotifyHub: bildirishnomalar xizmati

NotifyHub bildirishnomalarni yaratadi, tanlangan til va kanal orqali yuboradi, xabarga vaqt, imzo yoki shifrlash qo'shadi hamda tarix va statistikani yuritadi. Telegram va SMS imitatsiya qilinadi, haqiqiy tarmoq so'rovlari yuborilmaydi.

## Ishga tushirish

Python 3.12 yoki undan yangi versiya kerak. Tashqi kutubxonalar ishlatilmagan.

```bash
cd projects/notifyhub
python3 main.py
```

Namunaviy qabul qiluvchilar: `Ali`, `Malika`, `Sardor`, `Rustam`, `301-guruh`, `302-guruh`, `3-kurs`, `O'qituvchilar`, `Universitet`. `Rustam` ataylab noto'g'ri raqam bilan yaratilgan, u orqali SMS va Telegram xatolarini ko'rish mumkin.

Tarix xotirada saqlanadi va dastur yopilganda tozalanadi. `file` kanali xabarlarni `data/notifications.log` fayliga yozadi.

## Loyiha tuzilmasi

```text
notifyhub/
├── main.py                     # konsol menyusi
├── core/
│   ├── hub.py                  # Facade (bonus)
│   ├── history.py              # Singleton
│   ├── builder.py              # Builder (bonus)
│   └── templates.py            # Prototype (bonus)
├── notifications/
│   ├── base.py                 # Notification (Bridge abstraksiyasi)
│   └── types.py                # Alert, Reminder, Promo
├── channels/
│   ├── base.py                 # Channel (Bridge realizatsiyasi)
│   ├── console.py
│   ├── file.py
│   ├── telegram.py
│   ├── sms_adapter.py          # Adapter + LegacySmsGateway
│   └── factory.py              # Factory Method (bonus)
├── locales/
│   └── factories.py            # Abstract Factory
├── decorators/
│   └── message_decorators.py   # Decorator
├── recipients/
│   └── recipients.py           # Composite (bonus)
└── README.md
```

## Patternlar

| Pattern | Holati | Joylashuvi | Tizimdagi vazifasi |
|---|---|---|---|
| Bridge | Majburiy | `notifications/`, `channels/base.py` | Bildirishnoma turi va yuborish kanalini mustaqil qiladi |
| Abstract Factory | Majburiy | `locales/factories.py` | Bitta til uchun mos shablonlar oilasini yaratadi |
| Decorator | Majburiy | `decorators/message_decorators.py` | Vaqt, imzo, shifrlash va shoshilinch belgisini istalgan tartibda qo'shadi |
| Adapter | Majburiy | `channels/sms_adapter.py` | `LegacySmsGateway` ni o'zgartirmasdan `Channel` interfeysiga ulaydi |
| Singleton | Majburiy | `core/history.py` | Butun dastur uchun yagona tarix va statistikani saqlaydi |
| Composite | Bonus | `recipients/recipients.py` | Guruhga yuborilgan xabarni rekursiv ravishda har bir foydalanuvchiga yetkazadi |
| Builder | Bonus | `core/builder.py` | Bildirishnomani zanjir orqali yig'adi va to'liqligini tekshiradi |
| Prototype | Bonus | `core/templates.py` | Saqlangan tarqatmani nusxalaydi, nusxada matn yoki qabul qiluvchi o'zgaradi |
| Facade | Bonus | `core/hub.py` | Ichki tuzilmani `main.py` dan yashiradi |
| Factory Method | Bonus | `channels/factory.py` | Kanalni nomi bo'yicha yaratadi |

## Patternlar qanday bog'langan

Bitta xabar quyidagi yo'ldan o'tadi:

```text
main.py
  └─ NotifyHub (Facade)
       └─ NotificationBuilder (Builder)
            ├─ ChannelFactory (Factory Method) → Channel
            └─ LocaleFactory (Abstract Factory) → shablon va imzo
                 └─ Notification (Bridge abstraksiyasi)
                      ├─ Message + o'ramlar (Decorator)
                      ├─ Recipient.users() (Composite)
                      ├─ Channel.send() (Bridge realizatsiyasi, SMS uchun Adapter)
                      └─ NotificationHistory (Singleton)
```

«Tarqatma shablonlari» menyusi avval `BroadcastTemplate.clone()` (Prototype) orqali nusxa oladi, keyin xabar shu yo'l bilan yuboriladi.
