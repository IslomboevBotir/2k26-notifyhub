from __future__ import annotations

from locales.factories import MessageTemplate
from notifications.base import Notification


class AlertNotification(Notification):
    kind = "alert"

    def _create_template(self) -> MessageTemplate:
        return self.locale.create_alert_template()


class ReminderNotification(Notification):
    kind = "reminder"

    def _create_template(self) -> MessageTemplate:
        return self.locale.create_reminder_template()


class PromoNotification(Notification):
    kind = "promo"

    def _create_template(self) -> MessageTemplate:
        return self.locale.create_promo_template()


NOTIFICATION_TYPES: dict[str, type[Notification]] = {
    notification.kind: notification
    for notification in (AlertNotification, ReminderNotification, PromoNotification)
}
