import 'package:uni_tests/notifications/notification.dart';
import '../history/notification_history.dart';
import '../models/message.dart';
import '../models/recipient.dart';


class PromoNotification extends Notification {
  PromoNotification(super.channel);

  @override
  void notify(Recipient to, Message msg) {
    bool ok = channel.send(to, msg.text, priority: 3);
    NotificationHistory().add("Promo: ${msg.text}");
    NotificationHistory().addType("Promo");
    NotificationHistory().addChannel(channel.name);
    if (!ok) NotificationHistory().addError();
  }
}
