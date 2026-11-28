import 'message_template.dart';

/// Abstract Factory: uchala xabar shabloni va imzo bitta tildan olinadi.
abstract class LocaleFactory {
  MessageTemplate createAlertTemplate();
  MessageTemplate createReminderTemplate();
  MessageTemplate createPromoTemplate();
  String get signature;
}
