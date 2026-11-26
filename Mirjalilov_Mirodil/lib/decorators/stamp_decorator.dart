import 'channel_decorator.dart';
import '../models/recipient.dart';
class StampDecorator extends ChannelDecorator{
  StampDecorator(super.channel);

  @override
  bool send(Recipient to, String text, {int priority = 2}) => channel.send(to, "Подпись: NotifyHub ${text}", priority: priority);
}
