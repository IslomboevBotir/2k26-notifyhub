import type { Channel } from "../channels/channel.ts";
import type { NotificationTemplate } from "../locales/templates.ts";
import { Notification } from "./base.ts";

export class AlertNotification extends Notification {
  readonly type = "alert" as const;

  constructor(channel: Channel, template: NotificationTemplate) {
    super(channel, template);
  }
}

export class ReminderNotification extends Notification {
  readonly type = "reminder" as const;

  constructor(channel: Channel, template: NotificationTemplate) {
    super(channel, template);
  }
}

export class PromoNotification extends Notification {
  readonly type = "promo" as const;

  constructor(channel: Channel, template: NotificationTemplate) {
    super(channel, template);
  }
}
