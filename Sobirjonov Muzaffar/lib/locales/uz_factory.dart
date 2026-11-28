import 'locale_factory.dart';
import 'message_template.dart';
import 'prefixed_template.dart';

class UzFactory implements LocaleFactory {
  @override
  MessageTemplate createAlertTemplate() => const PrefixedTemplate('⚠️ DIQQAT');
  @override
  MessageTemplate createReminderTemplate() => const PrefixedTemplate('Eslatma');
  @override
  MessageTemplate createPromoTemplate() => const PrefixedTemplate('Reklama');
  @override
  String get signature => 'NotifyHub jamoasi';
}
