/**
 * BRIDGE: aniqlashtirilgan abstraksiyalar (RefinedAbstraction).
 * Har bir tur faqat o'ziga mos shablonni tanlaydi. Qaysi kanal orqali
 * ketishi bu klasslarni qiziqtirmaydi.
 *
 * Misol: new AlertNotification({ channel: new TelegramChannel(), text: "..." })
 */

import { Notification, type NotificationOptions } from "./base";
import type { NotificationKind } from "../core/types";
import type { LocaleFactory } from "../locales/factories";

export class AlertNotification extends Notification {
  readonly kind = "alert";
  protected createTemplate(factory: LocaleFactory) {
    return factory.createAlertTemplate();
  }
}

export class ReminderNotification extends Notification {
  readonly kind = "reminder";
  protected createTemplate(factory: LocaleFactory) {
    return factory.createReminderTemplate();
  }
}

export class PromoNotification extends Notification {
  readonly kind = "promo";
  protected createTemplate(factory: LocaleFactory) {
    return factory.createPromoTemplate();
  }
}

export const NOTIFICATION_CLASSES: Record<NotificationKind, new (options: NotificationOptions) => Notification> = {
  alert: AlertNotification,
  reminder: ReminderNotification,
  promo: PromoNotification,
};
