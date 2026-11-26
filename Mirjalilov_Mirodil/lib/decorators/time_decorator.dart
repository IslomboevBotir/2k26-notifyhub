import 'channel_decorator.dart';
import '../models/recipient.dart';
class TimeDecorator extends ChannelDecorator{
  TimeDecorator(super.channel);

  @override
  bool send(Recipient to, String text, {int priority = 2}) => channel.send(to, "Время: ${DateTime.now()} ${text}", priority: priority);
}
