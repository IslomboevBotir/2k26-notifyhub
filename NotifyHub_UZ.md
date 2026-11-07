# 🧩 Laboratoriya ishi №1
## Loyiha: NotifyHub — bildirishnomalar xizmati

### 📘 Topshiriq tavsifi
NotifyHub — bildirishnomalarni tarqatish xizmatini modellashtiruvchi konsol ilova. Bunday xizmatlar banklarda, internet-do'konlarda va universitet portallarida ishlatiladi.

Tizim quyidagilarni bajaradi:
- turli xil bildirishnomalarni yaratadi (ogohlantirish, eslatma, reklama);
- ularni turli kanallar orqali yuboradi (konsol, fayl, Telegram, SMS);
- xabar tilini tanlash imkonini beradi (o'zbek, rus, ingliz);
- xabarga vaqt belgisi, imzo va shifrlash qo'shadi;
- yuborilgan xabarlar tarixi va statistikasini saqlaydi.

Haqiqiy tarmoq so'rovlari kerak emas. Tashqi xizmatlar (Telegram, SMS) **imitatsiya qilinadi**: xabar kanal belgisi bilan konsolga chiqariladi yoki faylga yoziladi.

---

### 🧱 Asosiy talablar
1. Dasturlash tili ixtiyoriy, yondashuv obyektga yo'naltirilgan (OOP).
2. Quyidagi jadvaldagi **5 ta pattern** albatta qo'llanilishi shart. Bonus patternlar qo'shimcha ball beradi.
3. Har bir pattern tizimda haqiqiy vazifani bajarishi kerak. «Shunchaki bor bo'lsin» uchun qo'shilgan pattern hisobga olinmaydi.
4. Foydalanuvchi bilan muloqot konsol menyusi orqali amalga oshiriladi.
5. Kodda har bir pattern yonida izoh yoki docstring bo'lishi kerak: qaysi pattern va u nima uchun ishlatilgan.
6. Loyiha tuzilmasi va patternlar ro'yxati yozilgan README fayli bo'lishi shart.

---

### 🧩 Majburiy patternlar

#### 1. Bridge: bildirishnoma turi × yuborish kanali
Bildirishnoma turi (**abstraksiya**) va yetkazish usuli (**realizatsiya**) bir-biridan mustaqil rivojlanadi. Istalgan bildirishnoma istalgan kanal orqali yuborilishi mumkin.

```
Notification (abstraksiya)         Channel (realizatsiya)
├── AlertNotification              ├── ConsoleChannel
├── ReminderNotification   ──▶     ├── FileChannel
└── PromoNotification              ├── TelegramChannel (imitatsiya)
                                   └── SmsChannel (Adapter orqali)
```
Misol: `AlertNotification(channel=TelegramChannel())`.
Talab: yangi kanal qo'shilganda bildirishnoma klasslarini o'zgartirish kerak bo'lmasligi lozim.

#### 2. Abstract Factory: tillar bo'yicha shablonlar to'plami
Fabrika bitta til uchun o'zaro mos obyektlar **oilasini** yaratadi: ogohlantirish, eslatma va reklama shablonlari.

```
LocaleFactory
├── UzFactory  → UzAlertTemplate, UzReminderTemplate, UzPromoTemplate
├── RuFactory  → RuAlertTemplate, ...
└── EnFactory  → EnAlertTemplate, ...
```
Misol: `UzFactory().create_alert_template().render("Server ishlamayapti")` → `⚠️ DIQQAT: Server ishlamayapti`.
Talab: bitta xabarda turli tillarning shablonlari aralashib ketmasligi kerak.

#### 3. Decorator: xabarni qo'shimcha qayta ishlash
Xabar ustidan istalgan tartibda va istalgan miqdorda qo'yiladigan o'ramlar:
- `TimestampDecorator` sana va vaqtni qo'shadi;
- `SignatureDecorator` imzo qo'shadi («— NotifyHub jamoasi»);
- `EncryptDecorator` matnni shifrlaydi (Sezar shifri yoki Base64);
- `UrgentDecorator` matnni katta harflarga o'tkazadi va 🔴 belgisini qo'shadi.

Misol: `Signature(Timestamp(Message("Dars ko'chirildi")))`.

#### 4. Adapter: «eski» SMS-shlyuzni ulash
Quyidagi tayyor klass berilgan. Uni **o'zgartirish mumkin emas**, chunki u tashqi kutubxona:

```python
class LegacySmsGateway:
    def send_sms(self, phone: str, payload: bytes, priority_code: int) -> int:
        """Muvaffaqiyatli bo'lsa 200, xato bo'lsa 400 qaytaradi."""
```

Uning interfeysi `Channel.send(recipient, text)` bilan mos kelmaydi. `SmsChannelAdapter` yozish kerak, u:
- matnni `bytes` ga o'giradi;
- bildirishnoma turini `priority_code` ga aylantiradi (Alert → 1, Reminder → 2, Promo → 3);
- javob kodini `True`/`False` ga o'zgartiradi.

#### 5. Singleton: tarix va statistika
`NotificationHistory` butun dastur uchun yagona obyekt. U barcha yuborilgan bildirishnomalarni saqlaydi va quyidagilarni bajaradi:
- tarixni ko'rsatadi;
- statistikani hisoblaydi: har bir kanal va tur bo'yicha nechta xabar yuborilgani, nechta yuborish muvaffaqiyatsiz bo'lgani.

---

### ⭐ Bonus patternlar (har biri +1 ball, ko'pi bilan +3)

| Pattern | Qayerda qo'llash mumkin |
|---|---|
| **Composite** | Qabul qiluvchilar: `User` va `Group`. Guruh ichida foydalanuvchilar va boshqa guruhlar bo'lishi mumkin («3-kurs» → «301-guruh», «302-guruh»). Guruhga yuborilgan xabar rekursiv ravishda har bir foydalanuvchiga yetib boradi |
| **Builder** | `NotificationBuilder().type("alert").locale("uz").channel("sms").to(group).text("...").with_timestamp().build()` |
| **Prototype** | Saqlangan tarqatma shablonlari, masalan «Haftalik eslatma». Shablon `clone()` orqali nusxalanadi, nusxada faqat matn yoki qabul qiluvchi o'zgaradi |
| **Facade** | `send()`, `show_history()`, `show_stats()` kabi oddiy metodlarga ega `NotifyHub` klassi. U butun ichki tuzilmani `main.py` dan yashiradi |
| **Factory Method** | `ChannelFactory.create("telegram")` nomi bo'yicha kanal yaratadi |

---

### ⚙️ Tavsiya etilgan tuzilma

```
notifyhub/
├── main.py                     # konsol menyusi
├── core/
│   ├── hub.py                  # Facade (bonus)
│   ├── history.py              # Singleton
│   └── builder.py              # Builder (bonus)
├── notifications/
│   ├── base.py                 # Notification (Bridge abstraksiyasi)
│   └── types.py                # Alert, Reminder, Promo
├── channels/
│   ├── base.py                 # Channel (Bridge realizatsiyasi)
│   ├── console.py
│   ├── file.py
│   ├── telegram.py
│   └── sms_adapter.py          # Adapter + LegacySmsGateway
├── locales/
│   └── factories.py            # Abstract Factory
├── decorators/
│   └── message_decorators.py   # Decorator
├── recipients/
│   └── recipients.py           # Composite (bonus)
└── README.md
```

---

### 🖥 Dastur ishlashiga misol

```
========= NotifyHub =========
1. Bildirishnoma yuborish
2. Tarix
3. Statistika
4. Tarqatma shablonlari
0. Chiqish
> 1
Tur (alert / reminder / promo): reminder
Til (uz / ru / en): uz
Kanal (console / file / telegram / sms): sms
Qabul qiluvchi (ism yoki guruh): 3-kurs
Matn: Ertaga imtihon soat 9:00 da
Qo'shimchalar (timestamp, signature, encrypt, urgent): timestamp, signature

[SMS → +998901112233] Eslatma: Ertaga imtihon soat 9:00 da [07.11.2026 15:30] — NotifyHub
[SMS → +998907778899] Eslatma: Ertaga imtihon soat 9:00 da [07.11.2026 15:30] — NotifyHub
✅ Yuborildi: 2 tadan 2 tasi

> 3
Jami yuborilgan: 14
  console: 3 | file: 2 | telegram: 5 | sms: 4
  alert: 4 | reminder: 7 | promo: 3
  Xatolar: 1
```

---

### 📊 Baholash mezonlari

| Mezon | Ball |
|---|---|
| 5 ta majburiy pattern amalga oshirilgan | 6 |
| Patternlar mazmunli qo'llanilgan va o'zaro bog'langan | 5 |
| Dastur to'g'ri ishlaydi, o'zaro ta'sir mantig'i to'g'ri | 5 |
| Kod sifati, tuzilmasi, o'qilishi, patternlarga izohlar | 4 |
| **Jami** | **20** |
| Bonus patternlar | +3 gacha |

---

### ❓ Himoya uchun nazorat savollari
1. Bridge oddiy merosdan (`TelegramAlert`, `SmsAlert`, `FileReminder`…) nimasi bilan farq qiladi? Bridge bo'lmaganda nechta klass kerak bo'lardi?
2. Nima uchun tillar uchun Factory Method emas, Abstract Factory mos keladi?
3. Decorator `Notification` ga `with_timestamp=True, encrypt=True` kabi flaglar qo'shishdan nimasi bilan yaxshiroq?
4. Nima uchun `LegacySmsGateway` ni bizning interfeysga moslab o'zgartirib bo'lmaydi?
5. Singleton patternning qanday kamchiliklari bor? Uni qachon ishlatmaslik kerak?
