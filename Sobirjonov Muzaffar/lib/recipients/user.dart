import 'recipient.dart';

class User implements Recipient {
  User(this.name, {this.phone = '', this.telegram = ''}) {
    if (name.trim().isEmpty) throw ArgumentError('Ism bo‘sh bo‘lmasin.');
  }

  @override
  final String name;
  final String phone;
  final String telegram;

  @override
  Iterable<User> get users => [this];
}
