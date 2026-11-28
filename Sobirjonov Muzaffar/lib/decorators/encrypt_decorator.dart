import 'dart:convert';
import 'message_decorator.dart';

class EncryptDecorator extends MessageDecorator {
  const EncryptDecorator(super.inner);
  // Base64 bilan kodlash, xavfsiz shifrlash emas.
  @override
  String render() => base64Encode(utf8.encode(inner.render()));
}
