import 'dart:convert';
import 'dart:io';

/// Tashqi kutubxona imitatsiyasi. Adapter uchun bu klass o‘zgartirilmaydi.
class LegacySmsGateway {
  int send_sms(String phone, List<int> payload, int priority_code) {
    if (!RegExp(r'^\+?[1-9]\d{7,14}$').hasMatch(phone) ||
        payload.isEmpty ||
        priority_code < 1 ||
        priority_code > 3) {
      return 400;
    }
    stdout.writeln(
        '[SMS (imitatsiya), priority=$priority_code → $phone] ${utf8.decode(payload)}');
    return 200;
  }
}
