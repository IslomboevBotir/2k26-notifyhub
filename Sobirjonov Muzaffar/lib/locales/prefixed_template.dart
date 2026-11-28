import 'message_template.dart';

class PrefixedTemplate implements MessageTemplate {
  const PrefixedTemplate(this.prefix);
  final String prefix;

  @override
  String render(String text) => '$prefix: $text';
}
