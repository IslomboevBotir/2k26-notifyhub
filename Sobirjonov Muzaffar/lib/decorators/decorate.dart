import 'encrypt_decorator.dart';
import 'message.dart';
import 'signature_decorator.dart';
import 'timestamp_decorator.dart';
import 'urgent_decorator.dart';

Message decorate(
  Message message,
  List<String> decorators,
  String signature, {
  DateTime? time,
}) {
  for (final name in decorators) {
    message = switch (name) {
      'timestamp' => TimestampDecorator(message, time: time),
      'signature' => SignatureDecorator(message, signature),
      'encrypt' => EncryptDecorator(message),
      'urgent' => UrgentDecorator(message),
      _ => throw ArgumentError('Noma’lum qo‘shimcha: $name'),
    };
  }
  return message;
}
