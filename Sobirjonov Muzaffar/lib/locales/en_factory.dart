import 'locale_factory.dart';
import 'message_template.dart';
import 'prefixed_template.dart';

class EnFactory implements LocaleFactory {
  @override
  MessageTemplate createAlertTemplate() => const PrefixedTemplate('⚠️ ALERT');
  @override
  MessageTemplate createReminderTemplate() =>
      const PrefixedTemplate('Reminder');
  @override
  MessageTemplate createPromoTemplate() => const PrefixedTemplate('Promotion');
  @override
  String get signature => 'NotifyHub team';
}
