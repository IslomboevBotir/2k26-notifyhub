# NotifyHub — bildirishnomalar xizmati (Laboratoriya ishi №1)

Python 3.10+ (faqat standart kutubxona). Bildirishnomalarni yaratadigan va konsol, fayl,
Telegram hamda SMS orqali yuboradigan konsol ilova. Telegram va SMS kanallari faqat imitatsiya,
haqiqiy tarmoq so'rovi yuborilmaydi.

## Ishga tushirish

```bash
python3 notifyhub/main.py                 # konsol menyusi
cd notifyhub && python3 -m unittest -v    # 24 ta test
```

## Tuzilma

```
notifyhub/
├── main.py                     # konsol menyusi (faqat Facade bilan ishlaydi)
├── core/
│   ├── hub.py                  # Facade: NotifyHub + namuna qabul qiluvchilar
│   ├── history.py              # Singleton: NotificationHistory
│   └── builder.py              # Builder: NotificationBuilder, Prototype: Dispatch.clone()
├── notifications/
│   ├── base.py                 # Bridge abstraksiyasi: Notification
│   └── types.py                # Alert, Reminder, Promo
├── channels/
│   ├── base.py                 # Bridge realizatsiyasi: Channel
│   ├── console.py, file.py, telegram.py
│   ├── sms_adapter.py          # Adapter: SmsChannelAdapter + LegacySmsGateway
│   └── factory.py              # Factory Method: ChannelFactory
├── locales/factories.py        # Abstract Factory: Uz/Ru/En
├── decorators/message_decorators.py  # Decorator: Timestamp/Signature/Encrypt/Urgent
├── recipients/recipients.py    # Composite: User, Group
└── tests/test_patterns.py
```

## Patternlar

| # | Pattern | Qayerda | Vazifasi |
|---|---|---|---|
| 1 | **Bridge** | `notifications/` × `channels/` | Bildirishnoma turi (abstraksiya) kanal (realizatsiya) havolasini saqlaydi. 3 tur × 4 kanal uchun 12 ta klass o'rniga 7 ta klass yetadi. Yangi kanal qo'shilsa `Notification` klasslari o'zgarmaydi |
| 2 | **Abstract Factory** | `locales/factories.py` | `UzFactory`/`RuFactory`/`EnFactory` bitta tilning alert, reminder va promo shablonlarini birgalikda yaratadi. Notification bitta fabrika oladi, shuning uchun bitta xabarda ikki til aralashmaydi |
| 3 | **Decorator** | `decorators/message_decorators.py` | Timestamp, Signature, Encrypt (Base64) va Urgent o'ramlari istalgan tartibda va istalgan sonda qo'llanadi: `Signature(Timestamp(Message(...)))` |
| 4 | **Adapter** | `channels/sms_adapter.py` | O'zgartirib bo'lmaydigan `LegacySmsGateway.send_sms(phone, bytes, priority)` ni `Channel.send()` interfeysiga moslaydi: matnni bytes ga o'giradi, turni priority ga aylantiradi (alert→1, reminder→2, promo→3), 200/400 javobini True/False ga o'zgartiradi |
| 5 | **Singleton** | `core/history.py` | `NotificationHistory()` doim bitta obyektni qaytaradi. Tarixni saqlaydi va statistikani hisoblaydi: kanal va tur bo'yicha muvaffaqiyatli yuborishlar hamda xatolar soni |
| ⭐ | **Composite** | `recipients/recipients.py` | `User` va `Group` (ichida guruh ham bo'lishi mumkin). Masalan, "3-kurs" → "301-guruh", "302-guruh". Xabar rekursiv ravishda har bir odamga bir marta boradi |
| ⭐ | **Builder** | `core/builder.py` | `NotificationBuilder().type("alert").locale("uz").channel("sms").to(group).text("...").with_timestamp().build()` |
| ⭐ | **Prototype** | `core/builder.py` (`Dispatch.clone`) | Saqlangan tarqatmalar ("Haftalik eslatma" va boshqalar) nusxalanadi. Nusxada faqat matn yoki qabul qiluvchi o'zgaradi, asl shablon o'zgarmaydi |
| ⭐ | **Facade** | `core/hub.py` | `NotifyHub.send()`, `show_history()`, `show_stats()`, `templates()`. `main.py` ichki tuzilmani bilmaydi |
| ⭐ | **Factory Method** | `channels/factory.py` | `ChannelFactory.create("telegram")` kanalni nomi bo'yicha yaratadi. Yangi kanal `register()` orqali qo'shiladi |

Patternlar o'zaro bog'langan. Bitta yuborish quyidagi zanjir bo'yicha o'tadi:
Facade → Builder → Factory Method (kanal) + Abstract Factory (til) → Bridge (`Notification.send`)
→ Decorator (matn) → Composite (qabul qiluvchilar) → Adapter (SMS) → Singleton (tarix).

## Namuna ma'lumotlar

| Qabul qiluvchi | Telefon | Telegram | Izoh |
|---|---|---|---|
| Ali | +998901112233 | @ali_dev | |
| Vali | +998907778899 | @vali | |
| Hasan | +998935554433 | — | Telegram'ga yuborish xato beradi |
| Zarina | 90-123 | @zarina | SMS shlyuzi 400 qaytaradi |

Guruhlar: `301-guruh` = Ali, Vali; `302-guruh` = Hasan, Zarina; `3-kurs` = 301 + 302.
Hasan va Zarina statistikadagi xatolarni ko'rsatish uchun ataylab qo'shilgan.

## Himoya savollariga qisqa javoblar

1. **Bridge va oddiy meros.** Meros bilan har bir tur va kanal juftligi uchun alohida klass kerak:
   3 × 4 = 12 ta klass. Yangi kanal qo'shilsa yana 3 ta klass qo'shiladi. Bridge bilan 3 + 4 = 7 ta
   klass yetadi va har bir o'q (tur yoki kanal) alohida kengaytiriladi.
2. **Nega Abstract Factory.** Bizga bitta til uchun bir-biriga mos shablonlar oilasi kerak.
   Factory Method esa bitta mahsulot yaratadi. Bitta fabrika ishlatilgani uchun tillar aralashmaydi.
3. **Decorator va flaglar.** Flaglar bilan har bir yangi qo'shimcha `Notification` ni o'zgartirishga
   va `if` lar ko'payishiga olib keladi. Bundan tashqari, tartibni boshqarib bo'lmaydi
   (urgent → signature yoki signature → urgent). Decorator bilan yangi qo'shimcha = yangi klass,
   tartib va son esa erkin.
4. **Nega LegacySmsGateway o'zgartirilmaydi.** Bu tashqi kutubxona: kodi bizda emas, uni boshqa
   tizimlar ham ishlatadi va yangilanganda bizning o'zgartirishlarimiz o'chib ketadi.
   Shuning uchun uni Adapter bilan o'raymiz.
5. **Singleton kamchiliklari.** Global holat yashirin bog'liqlik yaratadi va testlarni izolyatsiya
   qilish qiyinlashadi (shu sababli `reset()` qo'shilgan). Ko'p oqimli dasturda qulf kerak
   (`threading.Lock` qo'shilgan). Bir nechta mustaqil instansiya kerak bo'lganda, masalan
   multi-tenant tizimda, Singleton ishlatilmaydi.
