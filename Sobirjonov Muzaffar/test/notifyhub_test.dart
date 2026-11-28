import '../lib/channels/sms_channel_adapter.dart';
import '../lib/core/broadcast_template.dart';
import '../lib/core/notification_history.dart';
import '../lib/core/notification_type.dart';
import '../lib/core/notify_hub.dart';
import '../lib/decorators/decorate.dart';
import '../lib/decorators/text_message.dart';
import '../lib/locales/en_factory.dart';
import '../lib/locales/ru_factory.dart';
import '../lib/locales/uz_factory.dart';
import '../lib/recipients/group.dart';
import '../lib/recipients/user.dart';
import 'dart:convert';
import 'dart:io';
import 'recording_gateway.dart';
import 'unreliable_channel.dart';

void check(bool condition, String message) {
  if (!condition) throw StateError(message);
}

void main() {
  final temp = Directory.systemTemp.createTempSync('notifyhub_test_');
  try {
    final user = User('Muzaffar', phone: '+998901112233', telegram: '@demo');
    final hub = NotifyHub(filePath: '${temp.path}/messages.jsonl');
    check(identical(NotificationHistory(), hub.history), 'Singleton buzilgan');
    final baseline = hub.history.entries.length;
    // Integratsiya: barcha 3 tur × 3 til × 4 kanal haqiqatan yuboriladi.
    for (final type in NotificationType.values) {
      for (final locale in ['uz', 'ru', 'en']) {
        for (final channel in hub.channels.keys) {
          final result = hub.send(BroadcastTemplate(
              name: 'test',
              type: type,
              locale: locale,
              channel: channel,
              recipient: user,
              text: 'O‘zbekcha / Русский / English',
              decorators: ['timestamp', 'signature']));
          check(
              result.sent == 1 && result.failed == 0, '$type/$locale/$channel');
        }
      }
    }
    check(hub.history.entries.length - baseline == 36,
        '36 ta tarix yozuvi kerak');
    final lines = File('${temp.path}/messages.jsonl').readAsLinesSync();
    check(lines.length == 9, 'Fayl append qilinishi kerak');
    check((jsonDecode(lines.first) as Map)['text'].contains('Русский'),
        'UTF-8 yo‘qolgan');
    check(hub.showStats().contains('Muvaffaqiyatli yuborilgan: 36'),
        'Statistika noto‘g‘ri');
    check(hub.showStats().contains('sms: 9'), 'Kanal statistikasi noto‘g‘ri');
    check(hub.showStats().contains('alert: 12'), 'Tur statistikasi noto‘g‘ri');

    final families = [UzFactory(), RuFactory(), EnFactory()];
    final expected = [
      ['⚠️ DIQQAT', 'Eslatma', 'Reklama', 'NotifyHub jamoasi'],
      ['⚠️ ВНИМАНИЕ', 'Напоминание', 'Реклама', 'Команда NotifyHub'],
      ['⚠️ ALERT', 'Reminder', 'Promotion', 'NotifyHub team'],
    ];
    for (var i = 0; i < families.length; i++) {
      final f = families[i];
      check(f.createAlertTemplate().render('x') == '${expected[i][0]}: x',
          'Alert tili');
      check(f.createReminderTemplate().render('x') == '${expected[i][1]}: x',
          'Reminder tili');
      check(f.createPromoTemplate().render('x') == '${expected[i][2]}: x',
          'Promo tili');
      check(f.signature == expected[i][3], 'Imzo tili');
    }

    final fakeGateway = RecordingGateway();
    final adapter = SmsChannelAdapter(fakeGateway);
    for (final type in NotificationType.values) {
      check(adapter.send(user, 'O‘zbek Русский', type: type), '200 → true');
      check(fakeGateway.priority == type.priorityCode, 'SMS ustuvorligi');
      check(utf8.decode(fakeGateway.payload!) == 'O‘zbek Русский', 'SMS UTF-8');
    }
    fakeGateway.status = 400;
    check(!adapter.send(user, 'x'), '400 → false');

    final time = DateTime(2026, 11, 28, 9, 5);
    final decorated = decorate(const TextMessage('salom'),
            ['timestamp', 'signature', 'encrypt'], 'Jamoa',
            time: time)
        .render();
    check(
        utf8.decode(base64Decode(decorated)) ==
            'salom [28.11.2026 09:05] — Jamoa',
        'O‘ram tartibi');
    check(
        decorate(const TextMessage('salom'), ['urgent', 'urgent'], '')
                .render() ==
            '🔴 🔴 SALOM',
        'Takroriy dekorator');
    check(
        decorate(const TextMessage('salom'), ['encrypt', 'signature'], 'Jamoa')
                .render() ==
            'c2Fsb20= — Jamoa',
        'Teskari tartib');

    final group = Group('Kurs', [
      Group('301', [user]),
      Group('302', [User('Bad'), user])
    ]);
    final request = BroadcastTemplate(
        name: 'original',
        type: NotificationType.alert,
        locale: 'uz',
        channel: 'custom',
        recipient: group,
        text: 'original',
        decorators: ['timestamp']);
    final copy = request.clone();
    copy.text = 'changed';
    copy.decorators.add('urgent');
    copy.recipient = user;
    check(
        request.text == 'original' &&
            request.decorators.length == 1 &&
            identical(request.recipient, group),
        'Prototype aslini o‘zgartirdi');
    final customHub = NotifyHub(channels: {'custom': UnreliableChannel()});
    final groupResult = customHub.send(request);
    check(
        groupResult.total == 3 &&
            groupResult.sent == 2 &&
            groupResult.failed == 1,
        'Composite/xatodan keyin davom etish');
    check(hub.showStats().contains('Xatolar: 1'), 'Xato statistikasi');
    check(
        hub.showHistory().contains('Test failure'), 'Xato sababi tarixda yo‘q');

    request.channel = 'sms';
    request.recipient = User('No phone');
    check(hub.send(request).failed == 1, 'Noto‘g‘ri SMS raqami');
    request.channel = 'telegram';
    check(hub.send(request).failed == 1, 'Telegram kontakti yo‘q');
    request.channel = 'file';
    final blocked = NotifyHub(filePath: '${temp.path}/messages.jsonl/blocked');
    check(blocked.send(request).failed == 1,
        'Fayl xatosi tarixga yozilishi kerak');

    for (final invalid in ['locale', 'channel', 'decorator', 'text']) {
      final bad = request.clone();
      switch (invalid) {
        case 'locale':
          bad.locale = 'xx';
        case 'channel':
          bad.channel = 'xx';
        case 'decorator':
          bad.decorators.add('xx');
        case 'text':
          bad.text = ' ';
      }
      final before = hub.history.entries.length;
      var rejected = false;
      try {
        hub.send(bad);
      } on ArgumentError {
        rejected = true;
      }
      check(rejected, 'Noto‘g‘ri $invalid rad etilmadi');
      check(hub.history.entries.length == before, 'Yaroqsiz so‘rov yuborilgan');
    }
    stdout.writeln(
        'PASS: 36 kombinatsiya, 5 majburiy va 3 bonus pattern, xato holatlari.');
  } finally {
    temp.deleteSync(recursive: true);
  }
}
