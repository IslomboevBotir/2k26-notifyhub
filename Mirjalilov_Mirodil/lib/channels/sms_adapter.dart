import 'dart:convert';

import '../models/recipient.dart';
import 'channel.dart';
import 'legacy_sms_gateway.dart';

// Adapter приводит старый LegacySmsGateway к интерфейсу Channel (текст ,биты, тип, приоритет, 200или400 , true/false).
class SmsAdapter implements Channel {
  final LegacySmsGateway legacySmsGateway;
  SmsAdapter(this.legacySmsGateway);

  @override
  bool send(Recipient to, String text, {int priority = 2}) {
    List<int> bytes = utf8.encode(text);
    int code = legacySmsGateway.sendSms(to.phone, bytes, priority);
    return code == 200;
  }

  @override
  String get name => "SMS";
}
