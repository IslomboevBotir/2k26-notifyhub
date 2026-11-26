import 'package:uni_tests/notifications/notification.dart';
import '../history/notification_history.dart';
import '../models/message.dart';
import '../models/recipient.dart';


class ReminderNotification extends Notification {
  ReminderNotification(super.channel);

  @override
  void notify(Recipient to, Message msg) {
    bool ok = channel.send(to, msg.text, priority: 2);
    NotificationHistory().add("Reminder: ${msg.text}");
    NotificationHistory().addType("Reminder");
    NotificationHistory().addChannel(channel.name);
    if (!ok) NotificationHistory().addError();
  }
}
