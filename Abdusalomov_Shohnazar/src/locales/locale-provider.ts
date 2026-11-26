/**
 * @file locales/locale-provider.ts
 * @pattern Abstract Factory & Factory Method
 */

import type { ILocaleFactory } from './locale-factory.interface.ts';
import { UzLocaleFactory } from './uz.factory.ts';
import { RuLocaleFactory } from './ru.factory.ts';
import { EnLocaleFactory } from './en.factory.ts';
import type { LocaleType } from '../types/index.ts';

export class LocaleProvider {
  private static readonly factories: Record<LocaleType, ILocaleFactory> = {
    uz: new UzLocaleFactory(),
    ru: new RuLocaleFactory(),
    en: new EnLocaleFactory(),
  };

  public static getFactory(locale: LocaleType): ILocaleFactory {
    const factory = this.factories[locale];
    if (!factory) {
      throw new Error(`Noma'lum til tanlandi: "${locale}". Mavjud tillar: uz, ru, en`);
    }
    return factory;
  }
}
