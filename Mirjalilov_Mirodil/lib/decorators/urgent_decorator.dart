import 'channel_decorator.dart';
import '../models/recipient.dart';
class UrgentDecorator extends ChannelDecorator{
  UrgentDecorator(super.channel);

  @override
  bool send(Recipient to, String text, {int priority = 2}) => channel.send(to, "Срочно: $text", priority: priority);
}
