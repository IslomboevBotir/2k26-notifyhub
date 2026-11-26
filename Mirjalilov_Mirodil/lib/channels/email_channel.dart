import '../models/recipient.dart';
import 'channel.dart';

class EmailChannel extends Channel {
  @override
  bool send(Recipient to, String text, {int priority = 2}) {
    print("Email Channel:${to.email} Text:$text");
    return true;
  }
  @override
  String get name => "Email";

}
