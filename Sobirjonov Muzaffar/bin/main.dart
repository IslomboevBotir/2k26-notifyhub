import '../lib/console/console_menu.dart';
import '../lib/console/end_of_input.dart';
import '../lib/core/broadcast_template.dart';
import '../lib/core/notification_type.dart';
import '../lib/core/notify_hub.dart';
import '../lib/recipients/group.dart';
import '../lib/recipients/recipient.dart';
import '../lib/recipients/user.dart';
import 'dart:convert';
import 'dart:io';

void main() {
  stdout.encoding = utf8;
  final hub = NotifyHub();
  final muzaffar =
      User('Muzaffar', phone: '+998901112233', telegram: '@muzaffar_demo');
  final aziza = User('Aziza', phone: '+998907778899', telegram: '@aziza_demo');
  final group301 = Group('301-guruh', [muzaffar]);
  final group302 = Group('302-guruh', [aziza]);
  final recipients = <String, Recipient>{
    muzaffar.name: muzaffar,
    aziza.name: aziza,
    group301.name: group301,
    group302.name: group302,
    '3-kurs': Group('3-kurs', [group301, group302]),
  };
  final templates = <String, BroadcastTemplate>{
    'Haftalik eslatma': BroadcastTemplate(
      name: 'Haftalik eslatma',
      type: NotificationType.reminder,
      locale: 'uz',
      channel: 'console',
      recipient: recipients['3-kurs']!,
      text: 'Ertaga imtihon soat 9:00 da',
      decorators: ['timestamp', 'signature'],
    ),
  };
  final cli = ConsoleMenu(hub, recipients, templates);
  try {
    cli.run();
  } on EndOfInput {
    stdout.writeln('\nKiritish tugadi. Xayr!');
  }
}
