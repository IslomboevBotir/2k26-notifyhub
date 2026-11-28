import '../recipients/recipient.dart';
import 'notification_type.dart';

/// Prototype: asl shablonni o‘zgartirmasdan yangi tarqatma tayyorlash uchun.
class BroadcastTemplate {
  BroadcastTemplate(
      {required this.name,
      required this.type,
      required this.locale,
      required this.channel,
      required this.recipient,
      required this.text,
      List<String> decorators = const []})
      : decorators = List.of(decorators);

  String name;
  NotificationType type;
  String locale;
  String channel;
  Recipient recipient;
  String text;
  final List<String> decorators;

  BroadcastTemplate clone() => BroadcastTemplate(
        name: name,
        type: type,
        locale: locale,
        channel: channel,
        recipient: recipient,
        text: text,
        decorators: decorators,
      );
  // Qabul qiluvchi o‘zgarmas obyekt, dekoratorlar ro‘yxati esa nusxalanadi.
}
