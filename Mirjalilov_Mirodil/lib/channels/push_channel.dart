import '../models/recipient.dart';
import 'channel.dart';

class PushChannel extends Channel {
  @override
  bool send(Recipient to, String text, {int priority = 2}) {
    print("Push Channel:${to.phone} Text:$text");
    return true;
  }
  @override
  String get name => "Push";

}
