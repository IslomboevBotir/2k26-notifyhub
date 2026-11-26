import 'dart:convert';

import 'channel_decorator.dart';
import '../models/recipient.dart';
class EncryptionDecorator extends ChannelDecorator{
  EncryptionDecorator(super.channel);

  @override
  bool send(Recipient to, String text, {int priority = 2}) => channel.send(to, base64.encode(utf8.encode(text)), priority: priority);
}
