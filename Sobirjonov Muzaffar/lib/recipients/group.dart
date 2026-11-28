import 'recipient.dart';
import 'user.dart';

class Group implements Recipient {
  Group(this.name, Iterable<Recipient> members)
      : members = List.unmodifiable(members);

  @override
  final String name;

  // Guruh tuzilgandan keyin a’zolari o‘zgarmaydi.
  final List<Recipient> members;

  @override
  Iterable<User> get users sync* {
    for (final member in members) {
      yield* member.users;
    }
  }
}
