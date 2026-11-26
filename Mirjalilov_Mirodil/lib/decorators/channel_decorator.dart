import '../channels/channel.dart';
import '../models/recipient.dart';


// Decorator оборачивает канал и добавляет обработку текста, обёртки можно комбинировать
abstract class ChannelDecorator implements Channel{
  final Channel channel;
  ChannelDecorator(this.channel);

  @override
  bool send(Recipient to, String text, {int priority = 2}) => channel.send(to, text, priority: priority);

  @override
  String get name => channel.name;

}
