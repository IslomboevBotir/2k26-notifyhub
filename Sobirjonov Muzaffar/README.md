# NotifyHub

Sobirjonov Muzaffar. Laboratoriya ishi №1, Dart tili.

Dastur konsol orqali bildirishnoma yuborishni ko‘rsatadi. Xabar turi
`alert`, `reminder` yoki `promo` bo‘lishi mumkin. Tillar: o‘zbek, rus va ingliz.
Kanallar: konsol, fayl, Telegram va SMS. Telegram va SMS konsolda imitatsiya qilinadi.

## Ishga tushirish

Dart SDK 3.0 yoki undan yangi versiya kerak. Shu papkada terminal ochib:

```sh
dart pub get
dart run bin/main.dart
```

Tekshirish uchun:

```sh
dart analyze
dart run test/notifyhub_test.dart
```

## Foydalanish

Menyuda xabar yuborish, tarix, statistika va tarqatma shablonlari bor.
Chiqish uchun `0` kiritiladi.

Xabar yuborishda tur, til, kanal, qabul qiluvchi va matn tanlanadi.
Tayyor qabul qiluvchilar: `Muzaffar`, `Aziza`, `301-guruh`, `302-guruh`, `3-kurs`.
`3-kurs` ichida ikkala guruh bor. Yangi ism kiritilsa, telefon va Telegram
kontakti ham so‘raladi. SMS uchun telefon raqami, Telegram uchun kontakt kerak.

Qo‘shimchalar vergul bilan yoziladi:

- `timestamp` — sana va vaqt;
- `signature` — tanlangan tildagi imzo;
- `encrypt` — Base64 kodlash;
- `urgent` — katta harflar va qizil belgi.

Masalan, `timestamp, signature` yozilsa, avval vaqt, keyin imzo qo‘shiladi.
Tartibni o‘zgartirish va qo‘shimchani takrorlash mumkin. Hech biri kerak bo‘lmasa,
bo‘sh qoldiriladi. Base64 xavfsiz shifrlash usuli emas, bu yerda topshiriq uchun ishlatilgan.

Yuborilgan xabar sozlamalarini shablon sifatida saqlash mumkin. Shablonlar
menyusida undan nusxa olinadi va matni yoki qabul qiluvchisi o‘zgartiriladi.

## Papkalar

```text
bin/main.dart       — dasturni boshlash
lib/console/        — console_menu.dart, end_of_input.dart
lib/channels/       — channel.dart, console_channel.dart, file_channel.dart,
                       telegram_channel.dart, sms_channel_adapter.dart,
                       legacy_sms_gateway.dart
lib/core/           — notify_hub.dart, notification_history.dart,
                       history_entry.dart, send_result.dart,
                       broadcast_template.dart, notification_type.dart
lib/decorators/     — message.dart, text_message.dart, message_decorator.dart,
                       timestamp_decorator.dart, signature_decorator.dart,
                       encrypt_decorator.dart, urgent_decorator.dart, decorate.dart
lib/locales/        — message_template.dart, prefixed_template.dart,
                       locale_factory.dart, uz_factory.dart, ru_factory.dart,
                       en_factory.dart, choose_locale.dart
lib/notifications/  — notification.dart, alert_notification.dart,
                       reminder_notification.dart, promo_notification.dart
lib/recipients/     — recipient.dart, user.dart, group.dart
test/               — notifyhub_test.dart, recording_gateway.dart,
                       unreliable_channel.dart
```

Har bir klass alohida faylda. `main.dart` faqat boshlang‘ich ma’lumotlarni
tayyorlab, menyuni ishga tushiradi.

## Ishlatilgan patternlar

| Pattern | Dasturdagi o‘rni |
| --- | --- |
| Bridge | `Notification` kanalni `Channel` orqali ishlatadi. Yangi kanal uchun bildirishnoma klasslarini o‘zgartirish kerak emas. |
| Abstract Factory | `UzFactory`, `RuFactory`, `EnFactory` har bir til uchun uchta xabar shabloni va imzoni beradi. |
| Decorator | `Message` obyektiga vaqt, imzo, Base64 va urgent o‘ramlari qo‘shiladi. |
| Adapter | `SmsChannelAdapter` eski shlyuzga UTF-8 baytlar va ustuvorlik kodini beradi, javobni bool ga aylantiradi. Alert — 1, Reminder — 2, Promo — 3. |
| Singleton | `NotificationHistory` butun dastur uchun bitta tarixni saqlaydi. |
| Composite | `User` va `Group` bir xil interfeysda ishlaydi. Guruh ichida boshqa guruh bo‘lishi mumkin. |
| Prototype | `BroadcastTemplate.clone()` saqlangan tarqatmadan nusxa oladi. |
| Facade | `NotifyHub` xabar yuborish, tarix va statistikani bitta klass orqali boshqaradi. |

SMS uchun xabar turi `Channel.send` metodining ixtiyoriy `type` parametri orqali
uzatiladi. Eski shlyuzning `send_sms(phone, payload, priority_code)` interfeysi saqlangan.

Tarix va tarqatma shablonlari xotirada saqlanadi, dastur yopilganda tozalanadi.
Fayl kanali `output/notifications.jsonl` fayliga yozadi. Vaqt kompyuterning
mahalliy vaqtida olinadi. Statistikada muvaffaqiyatli xabarlar kanal va tur
bo‘yicha sanaladi, xatolar alohida ko‘rsatiladi.

Guruhdagi bir odamga yuborishda xato chiqsa, qolganlariga yuborish davom etadi.
Bir foydalanuvchi guruhlar ichida ikki marta uchrasa, unga ikki marta yuboriladi.

Testda 36 ta tur, til va kanal kombinatsiyasi, SMS ustuvorligi, qo‘shimchalar
tartibi, shablondan nusxa olish va xato holatlari tekshiriladi.
