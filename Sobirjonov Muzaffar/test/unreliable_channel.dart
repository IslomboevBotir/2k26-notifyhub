import '../lib/channels/channel.dart';
import '../lib/core/notification_type.dart';
import '../lib/recipients/user.dart';
import 'dart:io';

class UnreliableChannel implements Channel {
  @override
  String get name => 'custom';
  @override
  bool send(User recipient, String text,
      {NotificationType type = NotificationType.reminder}) {
    if (recipient.name == 'Bad')
      throw const FileSystemException('Test failure');
    return true;
  }
}
