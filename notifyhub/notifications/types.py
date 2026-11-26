"""Bildirishnoma turlari — Bridge'ning aniqlangan abstraksiyalari (Refined Abstraction)."""

from locales.factories import Template
from notifications.base import Notification


class AlertNotification(Notification):
    kind = "alert"

    def _template(self) -> Template:
        return self.locale.create_alert_template()


class ReminderNotification(Notification):
    kind = "reminder"

    def _template(self) -> Template:
        return self.locale.create_reminder_template()


class PromoNotification(Notification):
    kind = "promo"

    def _template(self) -> Template:
        return self.locale.create_promo_template()


NOTIFICATION_TYPES: dict[str, type[Notification]] = {
    "alert": AlertNotification,
    "reminder": ReminderNotification,
    "promo": PromoNotification,
}


def notification_class(kind: str) -> type[Notification]:
    key = kind.strip().lower()
    if key not in NOTIFICATION_TYPES:
        raise ValueError(f"Noma'lum tur: {kind!r}. Mavjud: {', '.join(NOTIFICATION_TYPES)}")
    return NOTIFICATION_TYPES[key]
