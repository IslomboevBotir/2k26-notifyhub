import 'locale_factory.dart';
import 'message_template.dart';
import 'prefixed_template.dart';

class RuFactory implements LocaleFactory {
  @override
  MessageTemplate createAlertTemplate() =>
      const PrefixedTemplate('⚠️ ВНИМАНИЕ');
  @override
  MessageTemplate createReminderTemplate() =>
      const PrefixedTemplate('Напоминание');
  @override
  MessageTemplate createPromoTemplate() => const PrefixedTemplate('Реклама');
  @override
  String get signature => 'Команда NotifyHub';
}
