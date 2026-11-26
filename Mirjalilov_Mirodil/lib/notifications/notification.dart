import 'package:uni_tests/models/message.dart';
import 'package:uni_tests/models/recipient.dart';

import '../channels/channel.dart';

// Bridge тип уведомления хранит канал и не зависит от способа отправки
abstract class Notification{
final Channel channel;
Notification(this.channel);

void notify(Recipient to, Message msg);

}
