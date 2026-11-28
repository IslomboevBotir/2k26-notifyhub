import 'history_entry.dart';
import 'notification_type.dart';

/// Singleton: barcha NotifyHub obyektlari bitta tarixdan foydalanadi.
class NotificationHistory {
  NotificationHistory._();
  static final NotificationHistory _instance = NotificationHistory._();
  factory NotificationHistory() => _instance;

  final List<HistoryEntry> _entries = [];
  List<HistoryEntry> get entries => List.unmodifiable(_entries);
  void add(HistoryEntry entry) => _entries.add(entry);

  String showHistory() {
    if (_entries.isEmpty) return 'Tarix hozircha bo‘sh.';
    return _entries
        .map((e) =>
            '${e.time.toIso8601String()} | ${e.channel} | ${e.type.name} | '
            '${e.recipient} | ${e.success ? "OK" : "XATO"}\n'
            '${e.text}${e.error == null ? "" : "\nSabab: ${e.error}"}')
        .join('\n\n');
  }

  String showStats() {
    final successes = _entries.where((e) => e.success).toList();
    final channels = <String, int>{
      'console': 0,
      'file': 0,
      'telegram': 0,
      'sms': 0
    };
    final types = {for (final t in NotificationType.values) t.name: 0};
    for (final entry in successes) {
      channels.update(entry.channel, (n) => n + 1, ifAbsent: () => 1);
      types.update(entry.type.name, (n) => n + 1);
    }
    String counts(Map<String, int> values) =>
        values.entries.map((e) => '${e.key}: ${e.value}').join(' | ');
    return 'Jami urinishlar: ${_entries.length}\n'
        'Muvaffaqiyatli yuborilgan: ${successes.length}\n'
        '${counts(channels)}\n${counts(types)}\n'
        'Xatolar: ${_entries.length - successes.length}';
  }
}
