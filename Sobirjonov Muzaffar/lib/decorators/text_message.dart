import 'message.dart';

class TextMessage implements Message {
  const TextMessage(this.text);
  final String text;
  @override
  String render() => text;
}
