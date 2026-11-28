import '../channels/channel.dart';
import '../channels/console_channel.dart';
import '../channels/file_channel.dart';
import '../channels/legacy_sms_gateway.dart';
import '../channels/sms_channel_adapter.dart';
import '../channels/telegram_channel.dart';
import '../decorators/decorate.dart';
import '../decorators/text_message.dart';
import '../locales/choose_locale.dart';
import '../notifications/alert_notification.dart';
import '../notifications/notification.dart';
import '../notifications/promo_notification.dart';
import '../notifications/reminder_notification.dart';
import 'broadcast_template.dart';
import 'history_entry.dart';
import 'notification_history.dart';
import 'notification_type.dart';
import 'send_result.dart';

/// Facade: menyu xabar yuborish va tarix bilan shu klass orqali ishlaydi.
class NotifyHub {
  NotifyHub(
      {String filePath = 'output/notifications.jsonl',
      Map<String, Channel>? channels})
      : channels = Map.unmodifiable(channels ??
            {
              'console': ConsoleChannel(),
              'file': FileChannel(filePath),
              'telegram': TelegramChannel(),
              'sms': SmsChannelAdapter(LegacySmsGateway()),
            });

  final Map<String, Channel> channels;
  final NotificationHistory history = NotificationHistory();

  SendResult send(BroadcastTemplate request) {
    if (request.text.trim().isEmpty)
      throw ArgumentError('Matn bo‘sh bo‘lmasin.');
    final channel = channels[request.channel];
    if (channel == null)
      throw ArgumentError('Noma’lum kanal: ${request.channel}');
    final factory = localeFactory(request.locale);
    final Notification notification = switch (request.type) {
      NotificationType.alert => AlertNotification(channel),
      NotificationType.reminder => ReminderNotification(channel),
      NotificationType.promo => PromoNotification(channel),
    };
    final now = DateTime.now();
    final text = decorate(
            TextMessage(notification.template(factory).render(request.text)),
            request.decorators,
            factory.signature,
            time: now)
        .render();
    var total = 0;
    var sent = 0;
    for (final user in request.recipient.users) {
      total++;
      var success = false;
      String? error;
      try {
        success = notification.send(user, text);
        if (!success)
          error =
              'Kanal qabul qiluvchini yoki xabarni rad etdi. Kontaktni tekshiring.';
      } catch (e) {
        // Bitta qabul qiluvchidagi xato guruhning qolganiga xalaqit bermaydi.
        error = e.toString();
      }
      if (success) sent++;
      history.add(HistoryEntry(
          time: now,
          recipient: user.name,
          channel: channel.name,
          type: request.type,
          text: text,
          success: success,
          error: error));
    }
    return SendResult(total, sent);
  }

  String showHistory() => history.showHistory();
  String showStats() => history.showStats();
}
