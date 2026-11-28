import '../core/notification_type.dart';
import '../locales/locale_factory.dart';
import '../locales/message_template.dart';
import 'notification.dart';

class PromoNotification extends Notification {
  const PromoNotification(super.channel);
  @override
  NotificationType get type => NotificationType.promo;
  @override
  MessageTemplate template(LocaleFactory factory) =>
      factory.createPromoTemplate();
}
