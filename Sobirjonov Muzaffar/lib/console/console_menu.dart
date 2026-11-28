import '../core/broadcast_template.dart';
import '../core/notification_type.dart';
import '../core/notify_hub.dart';
import '../recipients/recipient.dart';
import '../recipients/user.dart';
import 'dart:convert';
import 'dart:io';
import 'end_of_input.dart';

class ConsoleMenu {
  ConsoleMenu(this.hub, this.recipients, this.templates);
  final NotifyHub hub;
  final Map<String, Recipient> recipients;
  final Map<String, BroadcastTemplate> templates;

  String read(String prompt) {
    stdout.write(prompt);
    final line = stdin.readLineSync(encoding: utf8);
    if (line == null) throw EndOfInput();
    return line.trim();
  }

  String requiredText(String prompt) {
    while (true) {
      final value = read(prompt);
      if (value.isNotEmpty) return value;
      stdout.writeln('Qiymat bo‘sh bo‘lmasin.');
    }
  }

  String choice(String prompt, Iterable<String> options) {
    while (true) {
      final value = read('$prompt (${options.join(' / ')}): ').toLowerCase();
      if (options.contains(value)) return value;
      stdout.writeln('Ro‘yxatdagi qiymatlardan birini kiriting.');
    }
  }

  Recipient selectRecipient() {
    stdout.writeln('Qabul qiluvchilar: ${recipients.keys.join(', ')}');
    final name = requiredText('Ism/guruh yoki yangi foydalanuvchi ismi: ');
    final found = recipients[name];
    if (found != null) return found;
    final user = User(
      name,
      phone: read('Telefon (+998..., SMS uchun; bo‘sh qoldirish mumkin): '),
      telegram: read(
          'Telegram (@username, Telegram uchun; bo‘sh qoldirish mumkin): '),
    );
    recipients[name] = user;
    return user;
  }

  BroadcastTemplate compose() {
    final type = choice('Tur', NotificationType.values.map((t) => t.name));
    final locale = choice('Til', ['uz', 'ru', 'en']);
    final channel = choice('Kanal', hub.channels.keys);
    final recipient = selectRecipient();
    final text = requiredText('Matn: ');
    const supported = ['timestamp', 'signature', 'encrypt', 'urgent'];
    List<String> decorators;
    while (true) {
      decorators = read(
              'Qo‘shimchalar (${supported.join(', ')}; vergul bilan, ixtiyoriy): ')
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .where((s) => s.isNotEmpty)
          .toList();
      if (decorators.every(supported.contains)) break;
      stdout.writeln('Noma’lum qo‘shimcha. Qayta kiriting.');
    }
    return BroadcastTemplate(
        name: '',
        type: NotificationType.values.byName(type),
        locale: locale,
        channel: channel,
        recipient: recipient,
        text: text,
        decorators: decorators);
  }

  void run() {
    while (true) {
      stdout.writeln('\n========= NotifyHub =========\n'
          '1. Bildirishnoma yuborish\n2. Tarix\n3. Statistika\n'
          '4. Tarqatma shablonlari\n0. Chiqish');
      final command = read('> ');
      try {
        switch (command) {
          case '1':
            final request = compose();
            stdout.writeln(hub.send(request));
            if (choice('Shablon sifatida saqlash?', ['ha', 'yoq']) == 'ha') {
              final name = requiredText('Yangi shablon nomi: ');
              if (templates.containsKey(name)) {
                stdout.writeln('Bu nom band. Shablon saqlanmadi.');
              } else {
                templates[name] = request.clone()..name = name;
                stdout.writeln('Shablon saqlandi.');
              }
            }
          case '2':
            stdout.writeln(hub.showHistory());
          case '3':
            stdout.writeln(hub.showStats());
          case '4':
            useTemplate();
          case '0':
            stdout.writeln('Xayr!');
            return;
          default:
            stdout.writeln('Menyudan 0–4 oralig‘ida tanlang.');
        }
      } on ArgumentError catch (e) {
        stdout.writeln('Xato: ${e.message}');
      }
    }
  }

  void useTemplate() {
    stdout.writeln('Shablonlar:');
    for (final template in templates.values) {
      stdout.writeln(
          '  ${template.name}: ${template.type.name}, ${template.locale}, '
          '${template.channel}, ${template.recipient.name}\n  ${template.text}');
    }
    final name = read('Shablon nomi (bo‘sh — ortga): ');
    if (name.isEmpty) return;
    final original = templates[name];
    if (original == null) {
      stdout.writeln('Shablon topilmadi.');
      return;
    }
    final copy = original.clone();
    final text = read('Yangi matn (bo‘sh — avvalgisi): ');
    if (text.isNotEmpty) copy.text = text;
    if (choice('Qabul qiluvchini o‘zgartirish?', ['ha', 'yoq']) == 'ha') {
      copy.recipient = selectRecipient();
    }
    stdout.writeln(hub.send(copy));
  }
}
