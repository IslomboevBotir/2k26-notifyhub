import 'dart:io';

import 'package:uni_tests/channels/channel.dart';

import '../channels/email_channel.dart';
import '../channels/legacy_sms_gateway.dart';
import '../channels/push_channel.dart';
import '../channels/sms_adapter.dart';
import '../channels/telegram_channel.dart';
import '../decorators/encryption_decorator.dart';
import '../decorators/stamp_decorator.dart';
import '../decorators/time_decorator.dart';
import '../decorators/urgent_decorator.dart';
import '../factories/eng_template_factory.dart';
import '../factories/ru_template_factory.dart';
import '../factories/template_factory.dart';
import '../factories/uz_template_factory.dart';
import '../history/notification_history.dart';
import '../models/message.dart';
import '../models/recipient.dart';
import '../notifications/alert_notification.dart';
import '../notifications/notification.dart';
import '../notifications/promo_notification.dart';
import '../notifications/reminder_notification.dart';

class ConsoleMenu {
  Recipient recipient = Recipient("mike", "smth@gmail.com", "+998901234567");

  void run() {
    while (true) {
      print('1 - Отправить уведомление');
      print('2 - Показать историю');
      print('3 - Статистика');
      print('4 - Очистить историю');
      print('0 - Выход');
      stdout.write('Введите команду: ');
      String? input = stdin.readLineSync();

      if (input == '1') {
        //Канал
        print('Канал: 1 - Email');
        print('Канал: 2 - Push');
        print('Канал: 3 - SMS');
        print('Канал: 4 - Telegram');
        stdout.write('Введите команду: ');
        String? chn = stdin.readLineSync();

        Channel channel;
        if (chn == '1') {
          channel = EmailChannel();
        } else if (chn == '2') {
          channel = PushChannel();
        } else if (chn == '3') {
          channel = SmsAdapter(LegacySmsGateway());
        } else if (chn == '4') {
          channel = TelegramChannel();
        } else {
          print('Неверный канал');
          continue;
        }

        //Декораторы
        stdout.write('Добавить время? (y/n): ');
        if (stdin.readLineSync() == 'y') {
          channel = TimeDecorator(channel);
        }
        stdout.write('Добавить подпись? (y/n): ');
        if (stdin.readLineSync() == 'y') {
          channel = StampDecorator(channel);
        }
        stdout.write('Пометить срочным? (y/n): ');
        if (stdin.readLineSync() == 'y') {
          channel = UrgentDecorator(channel);
        }
        stdout.write('Зашифровать? (y/n): ');
        if (stdin.readLineSync() == 'y') {
          channel = EncryptionDecorator(channel);
        }

        //Тип уведомления
        print('1 - Alert (срочное)');
        print('2 - Reminder (напоминание)');
        print('3 - Promo (реклама)');
        stdout.write('Введите команду: ');
        String? type = stdin.readLineSync();
        if (type != '1' && type != '2' && type != '3') {
          print('Неверная команда');
          continue;
        }

        //Язык шаблона
        print('Язык: 1 - Русский');
        print('Язык: 2 - Узбекский');
        print('Язык: 3 - Английский');
        stdout.write('Введите команду: ');
        String? lang = stdin.readLineSync();

        TemplateFactory factory;
        if (lang == '1') {
          factory = RuTemplateFactory();
        } else if (lang == '2') {
          factory = UzTemplateFactory();
        } else if (lang == '3') {
          factory = EngTemplateFactory();
        } else {
          print('Неверный язык');
          continue;
        }

        //Текст пользователя
        stdout.write('Текст: ');
        String text = stdin.readLineSync() ?? '';

        Message message;
        Notification n;
        if (type == '1') {
          message = factory.alert(text);
          n = AlertNotification(channel);
        } else if (type == '2') {
          message = factory.reminder(text);
          n = ReminderNotification(channel);
        } else {
          message = factory.promo(text);
          n = PromoNotification(channel);
        }

        n.notify(recipient, message);
      } else if (input == '2') {
        NotificationHistory().showAll();
      } else if (input == '3') {
        NotificationHistory().showStats();
      } else if (input == '4') {
        NotificationHistory().clear();
      } else if (input == '0') {
        break;
      } else {
        print('Неверная команда');
      }
    }
  }
}
