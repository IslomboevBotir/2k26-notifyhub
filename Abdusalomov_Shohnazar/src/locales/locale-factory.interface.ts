/**
 * @file locales/locale-factory.interface.ts
 * @pattern Abstract Factory Pattern - Abstract Factory
 */

import type { IAlertTemplate, IReminderTemplate, IPromoTemplate } from './template.interface.ts';
import type { LocaleType } from '../types/index.ts';

export interface ILocaleFactory {
  readonly locale: LocaleType;
  createAlertTemplate(): IAlertTemplate;
  createReminderTemplate(): IReminderTemplate;
  createPromoTemplate(): IPromoTemplate;
}
