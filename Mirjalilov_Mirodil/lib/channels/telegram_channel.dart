import '../models/recipient.dart';
import 'channel.dart';

class TelegramChannel extends Channel {
  @override
  bool send(Recipient to, String text, {int priority = 2}) {
    print("Telegram Channel:${to.phone} Text:$text");
    return true;
  }
  @override
  String get name => "Telegram";

}
