import 'message.dart';

/// Decorator: xabarga qo‘shimchalarni ketma-ket yoki takroran qo‘shish uchun.
abstract class MessageDecorator implements Message {
  const MessageDecorator(this.inner);
  final Message inner;
}
