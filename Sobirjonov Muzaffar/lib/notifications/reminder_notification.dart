import '../core/notification_type.dart';
import '../locales/locale_factory.dart';
import '../locales/message_template.dart';
import 'notification.dart';

class ReminderNotification extends Notification {
  const ReminderNotification(super.channel);
  @override
  NotificationType get type => NotificationType.reminder;
  @override
  MessageTemplate template(LocaleFactory factory) =>
      factory.createReminderTemplate();
}
