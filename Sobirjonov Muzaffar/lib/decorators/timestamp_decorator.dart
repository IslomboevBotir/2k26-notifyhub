import 'message_decorator.dart';

class TimestampDecorator extends MessageDecorator {
  TimestampDecorator(super.inner, {DateTime? time})
      : time = time ?? DateTime.now();
  final DateTime time;

  @override
  String render() {
    String pad(int number) => number.toString().padLeft(2, '0');
    final date = '${pad(time.day)}.${pad(time.month)}.${time.year}';
    return '${inner.render()} [$date ${pad(time.hour)}:${pad(time.minute)}]';
  }
}
