import '../core/notification_type.dart';
import '../recipients/user.dart';

/// Bridge: barcha yuborish kanallari uchun umumiy interfeys.
abstract class Channel {
  String get name;

  // SMS ustuvorligi xabar turiga qarab tanlanadi.
  bool send(User recipient, String text,
      {NotificationType type = NotificationType.reminder});
}
