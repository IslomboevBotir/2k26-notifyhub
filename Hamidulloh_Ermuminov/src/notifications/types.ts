import type { Channel } from "../channels/base.js";
import type { LocaleFactory, MessageTemplate } from "../locales/factories.js";
import type { NotificationType } from "../types.js";
import { Notification } from "./base.js";

/**
 * PATTERN: Bridge (Ko'prik) — Refined Abstractions
 * Nima uchun ishlatilgan:
 *   Har xil bildirishnoma turlari istalgan Channel bilan birgalikda ishlay oladi
 *   (AlertNotification + Telegram, ReminderNotification + SMS va h.k.).
 */

export class AlertNotification extends Notification {
  public readonly type: NotificationType = "alert";

  constructor(channel: Channel) {
    super(channel);
  }

  protected selectTemplate(factory: LocaleFactory): MessageTemplate {
    return factory.createAlertTemplate();
  }
}

export class ReminderNotification extends Notification {
  public readonly type: NotificationType = "reminder";

  constructor(channel: Channel) {
    super(channel);
  }

  protected selectTemplate(factory: LocaleFactory): MessageTemplate {
    return factory.createReminderTemplate();
  }
}

export class PromoNotification extends Notification {
  public readonly type: NotificationType = "promo";

  constructor(channel: Channel) {
    super(channel);
  }

  protected selectTemplate(factory: LocaleFactory): MessageTemplate {
    return factory.createPromoTemplate();
  }
}

export function createNotification(type: NotificationType, channel: Channel): Notification {
  switch (type) {
    case "alert":
      return new AlertNotification(channel);
    case "reminder":
      return new ReminderNotification(channel);
    case "promo":
      return new PromoNotification(channel);
    default: {
      const exhaustive: never = type;
      throw new Error(`Noma'lum bildirishnoma turi: ${String(exhaustive)}`);
    }
  }
}
