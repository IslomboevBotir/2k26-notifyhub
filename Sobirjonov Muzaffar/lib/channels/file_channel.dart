import '../core/notification_type.dart';
import '../recipients/user.dart';
import 'channel.dart';
import 'dart:convert';
import 'dart:io';

class FileChannel implements Channel {
  FileChannel(this.path);
  final String path;
  @override
  String get name => 'file';
  @override
  bool send(User recipient, String text,
      {NotificationType type = NotificationType.reminder}) {
    final file = File(path);
    file.parent.createSync(recursive: true);
    // JSONL ko‘p qatorli matn va Unicode belgilarini yo‘qotmasdan saqlaydi.
    file.writeAsStringSync(
        '${jsonEncode({
              'time': DateTime.now().toIso8601String(),
              'recipient': recipient.name,
              'type': type.name,
              'text': text,
            })}\n',
        mode: FileMode.append,
        encoding: utf8);
    return true;
  }
}
