import 'package:uni_tests/factories/template_factory.dart';
import '../models/message.dart';

class RuTemplateFactory implements TemplateFactory {

  @override
  Message alert(String text) => Message("Внимание", "ВНИМАНИЕ: $text");
  @override
  Message reminder(String text) => Message("Напоминание", "Напоминание: $text");
  @override
  Message promo(String text) => Message("Акция", "Акция: $text");
}
