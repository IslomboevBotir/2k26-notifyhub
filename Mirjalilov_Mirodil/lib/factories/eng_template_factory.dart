import 'package:uni_tests/factories/template_factory.dart';
import '../models/message.dart';

class EngTemplateFactory implements TemplateFactory {

  @override
  Message alert(String text) => Message("Attention", "ATTENTION: $text");
  @override
  Message reminder(String text) => Message("Reminder", "Reminder: $text");
  @override
  Message promo(String text) => Message("Promo", "Promo: $text");
}
