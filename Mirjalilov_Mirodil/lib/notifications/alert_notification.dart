import 'package:uni_tests/notifications/notification.dart';
import '../history/notification_history.dart';
import '../models/message.dart';
import '../models/recipient.dart';


class AlertNotification extends Notification {
  AlertNotification(super.channel);

  @override
  void notify(Recipient to, Message msg) {
    bool ok = channel.send(to, msg.text, priority: 1);
    NotificationHistory().add("Alert: ${msg.text}");
    NotificationHistory().addType("Alert");
    NotificationHistory().addChannel(channel.name);
    if (!ok) NotificationHistory().addError();
  }
}
