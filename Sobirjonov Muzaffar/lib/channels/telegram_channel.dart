import '../core/notification_type.dart';
import '../recipients/user.dart';
import 'channel.dart';
import 'dart:io';

class TelegramChannel implements Channel {
  @override
  String get name => 'telegram';
  @override
  bool send(User recipient, String text,
      {NotificationType type = NotificationType.reminder}) {
    if (recipient.telegram.trim().isEmpty) return false;
    stdout.writeln('[TELEGRAM (imitatsiya) → ${recipient.telegram}] $text');
    return true;
  }
}
