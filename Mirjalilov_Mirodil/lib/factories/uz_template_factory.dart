import 'package:uni_tests/factories/template_factory.dart';
import '../models/message.dart';

class UzTemplateFactory implements TemplateFactory {

  @override
  Message alert(String text) => Message("Diqqat", "⚠️ DIQQAT: $text");
  @override
  Message reminder(String text) => Message("Eslatma", "⏰ Eslatma: $text");
  @override
  Message promo(String text) => Message("Aksiya", "🎁 Aksiya: $text");
}
