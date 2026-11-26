# NotifyHub

Консольное приложение на Dart, которое имитирует сервис уведомлений.
Лабораторная работа №1 по паттернам проектирования.

## Запуск

```
dart pub get
dart run bin/main.dart
```

## Как пользоваться

Главное меню:
- `1`: отправить уведомление
- `2`: показать историю
- `3`: статистика (по типам, по каналам, ошибки)
- `4`: очистить историю и статистику
- `0`: выход

При отправке нужно по очереди выбрать:
1. Канал: Email, Push, SMS или Telegram.
2. Декораторы (y/n): время, подпись, «Срочно», шифрование (Base64).
3. Тип уведомления: Alert (приоритет 1), Reminder (2) или Promo (3).
4. Язык шаблона: русский, узбекский или английский.
5. Свой текст. Шаблон языка оборачивает его, например `⚠️ ВНИМАНИЕ: Сервер недоступен`.

## Паттерны

| Паттерн | Где | Что делает |
|---|---|---|
| **Bridge** | `lib/notifications/`, `lib/channels/` | Тип уведомления (`Notification`) отделён от канала отправки (`Channel`) и хранит его в поле `channel`. Любой тип можно отправить через любой канал: классов 3 + 4 = 7 вместо 3 × 4 = 12. |
| **Adapter** | `lib/channels/sms_adapter.dart` | `SmsAdapter` приводит старый `LegacySmsGateway` к интерфейсу `Channel`, не меняя сам шлюз: текст превращается в байты (`utf8.encode`), приоритет передаётся как `priorityCode`, ответ `200` / `400` превращается в `true` / `false`. |
| **Decorator** | `lib/decorators/` | `Time`, `Stamp`, `Urgent`, `Encryption` реализуют `Channel`, хранят внутри другой канал, меняют текст и передают его дальше. Их можно комбинировать в любом порядке. |
| **Abstract Factory** | `lib/factories/` | `TemplateFactory` создаёт семейство шаблонов `alert(text)`, `reminder(text)`, `promo(text)`, а `Ru`, `Uz` и `Eng` оборачивают текст пользователя на своём языке. |
| **Singleton** | `lib/history/notification_history.dart` | `NotificationHistory` существует в одном экземпляре (приватный конструктор, `static final _instance`, `factory`). Хранит историю, счётчики по типам и каналам и число ошибок. |

## Как сообщение проходит через программу

```
меню: канал → декораторы → тип → язык → текст
factory.alert(text) создаёт Message
AlertNotification(channel).notify(to, msg)
  → channel.send(to, msg.text, priority: 1)   // через слои декораторов
  → SmsAdapter → LegacySmsGateway (200 / 400)  // если выбран SMS
  → bool ok
NotificationHistory: add / addType / addChannel, при !ok addError
```

## Приоритеты

Alert = 1, Reminder = 2, Promo = 3 (чем меньше число, тем срочнее). Реально приоритет использует только SMS: адаптер передаёт его старому шлюзу, а остальные каналы его принимают, но не используют.

## Структура

```
bin/main.dart              точка входа
lib/models/                Recipient, Message
lib/channels/              Channel, Email, Push, Telegram, LegacySmsGateway, SmsAdapter
lib/notifications/         Notification, Alert, Reminder, Promo
lib/decorators/            ChannelDecorator и декораторы
lib/factories/             TemplateFactory и фабрики Ru / Uz / Eng
lib/history/               NotificationHistory
lib/console/               ConsoleMenu
```
