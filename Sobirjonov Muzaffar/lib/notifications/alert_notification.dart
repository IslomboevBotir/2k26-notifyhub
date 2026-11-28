import '../core/notification_type.dart';
import '../locales/locale_factory.dart';
import '../locales/message_template.dart';
import 'notification.dart';

class AlertNotification extends Notification {
  const AlertNotification(super.channel);
  @override
  NotificationType get type => NotificationType.alert;
  @override
  MessageTemplate template(LocaleFactory factory) =>
      factory.createAlertTemplate();
}
