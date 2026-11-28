import 'message_decorator.dart';

class UrgentDecorator extends MessageDecorator {
  const UrgentDecorator(super.inner);
  @override
  String render() => '🔴 ${inner.render().toUpperCase()}';
}
