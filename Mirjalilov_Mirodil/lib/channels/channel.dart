import "../models/recipient.dart";

// Bridge общий интерфейс всех каналов отправки
abstract class Channel {
  bool send(Recipient to, String text, {int priority = 2});
  String get name;
}
