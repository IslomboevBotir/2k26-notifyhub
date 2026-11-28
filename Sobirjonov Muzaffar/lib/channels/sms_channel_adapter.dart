import '../core/notification_type.dart';
import '../recipients/user.dart';
import 'channel.dart';
import 'dart:convert';
import 'legacy_sms_gateway.dart';

/// Adapter: matn va xabar turini eski SMS shlyuzi qabul qiladigan shaklga o‘giradi.
class SmsChannelAdapter implements Channel {
  SmsChannelAdapter(this.gateway);
  final LegacySmsGateway gateway;
  @override
  String get name => 'sms';
  @override
  bool send(User recipient, String text,
          {NotificationType type = NotificationType.reminder}) =>
      gateway.send_sms(recipient.phone, utf8.encode(text), type.priorityCode) ==
      200;
}
