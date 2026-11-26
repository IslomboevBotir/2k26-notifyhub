// Singleton один объект на всю программу, хранит историю и статистику.
class NotificationHistory {
  static final NotificationHistory _instance = NotificationHistory._();

  NotificationHistory._();

  factory NotificationHistory() => _instance;

  final List<String> _history = [];

  List<String> get history => _history;

  final Map<String, int> _counterType = {};
  final Map<String, int> _counterChannel = {};

  Map<String, int> get counterType => _counterType;

  Map<String, int> get counterChannel => _counterChannel;

  void addType(String type) =>
      _counterType[type] = (_counterType[type] ?? 0) + 1;

  void addChannel(String channel) =>
      _counterChannel[channel] = (_counterChannel[channel] ?? 0) + 1;

  int _errors = 0;

  void addError() => _errors++;

  void add(String text) => _history.add(text);

  void clear() {
    _history.clear();
    _counterType.clear();
    _counterChannel.clear();
    _errors = 0;
  }

  void showAll() => _history.forEach(print);

  void showStats() {
    print('Всего отправлено: ${_history.length}');

    print('По типам:');
    _counterType.forEach((key, value) => print('  $key: $value'));

    print('По каналам:');
    _counterChannel.forEach((key, value) => print('  $key: $value'));

    print('Ошибок: $_errors');
  }
}
