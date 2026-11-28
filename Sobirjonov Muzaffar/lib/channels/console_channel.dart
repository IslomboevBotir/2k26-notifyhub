import '../core/notification_type.dart';
import '../recipients/user.dart';
import 'channel.dart';
import 'dart:io';

class ConsoleChannel implements Channel {
  @override
  String get name => 'console';
  @override
  bool send(User recipient, String text,
      {NotificationType type = NotificationType.reminder}) {
    stdout.writeln('[CONSOLE → ${recipient.name}] $text');
    return true;
  }
}
