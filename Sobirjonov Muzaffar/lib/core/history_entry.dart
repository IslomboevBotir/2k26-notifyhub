import 'notification_type.dart';

class HistoryEntry {
  const HistoryEntry(
      {required this.time,
      required this.recipient,
      required this.channel,
      required this.type,
      required this.text,
      required this.success,
      this.error});
  final DateTime time;
  final String recipient;
  final String channel;
  final NotificationType type;
  final String text;
  final bool success;
  final String? error;
}
