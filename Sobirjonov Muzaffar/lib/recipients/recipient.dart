import 'user.dart';

/// Composite: foydalanuvchi va guruhga bir xil usulda murojaat qilinadi.
abstract class Recipient {
  String get name;
  Iterable<User> get users;
}
