import 'message_decorator.dart';

class SignatureDecorator extends MessageDecorator {
  const SignatureDecorator(super.inner, this.signature);
  final String signature;
  @override
  String render() => '${inner.render()} — $signature';
}
