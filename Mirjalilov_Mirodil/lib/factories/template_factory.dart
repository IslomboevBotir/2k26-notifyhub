import 'package:uni_tests/models/message.dart';

// Abstract Factory: создаёт семейство шаблонов на одном языке (Ru / Uz / Eng).
abstract class TemplateFactory {
  Message alert(String text);
  Message reminder(String text);
  Message promo(String text);
}
