import '../channels/channel.dart';
import '../core/notification_type.dart';
import '../locales/locale_factory.dart';
import '../locales/message_template.dart';
import '../recipients/user.dart';

/// Bridge: bildirishnoma turi va yuborish kanali alohida ishlaydi.
abstract class Notification {
  const Notification(this.channel);
  final Channel channel;
  NotificationType get type;
  MessageTemplate template(LocaleFactory factory);

  bool send(User recipient, String text) =>
      channel.send(recipient, text, type: type);
}
