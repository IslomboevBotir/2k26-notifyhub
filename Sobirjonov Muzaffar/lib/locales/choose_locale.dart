import 'en_factory.dart';
import 'locale_factory.dart';
import 'ru_factory.dart';
import 'uz_factory.dart';

LocaleFactory localeFactory(String locale) => switch (locale) {
      'uz' => UzFactory(),
      'ru' => RuFactory(),
      'en' => EnFactory(),
      _ => throw ArgumentError('Noma’lum til: $locale'),
    };
