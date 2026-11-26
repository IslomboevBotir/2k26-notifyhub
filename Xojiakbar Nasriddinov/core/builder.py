from __future__ import annotations

from collections.abc import Iterable

from channels.factory import ChannelFactory
from decorators.message_decorators import AVAILABLE_DECORATORS
from locales.factories import get_locale_factory
from notifications.base import Notification
from notifications.types import NOTIFICATION_TYPES
from recipients.recipients import Recipient


class NotificationBuilder:
    def __init__(self) -> None:
        self._kind: str | None = None
        self._locale = "uz"
        self._channel: str | None = None
        self._recipient: Recipient | None = None
        self._text: str | None = None
        self._extras: list[str] = []

    def type(self, kind: str) -> NotificationBuilder:
        key = kind.strip().lower()
        if key not in NOTIFICATION_TYPES:
            options = ", ".join(NOTIFICATION_TYPES)
            raise ValueError(f"Noma'lum tur: {kind!r}. Mavjudlari: {options}")
        self._kind = key
        return self

    def locale(self, code: str) -> NotificationBuilder:
        self._locale = code
        return self

    def channel(self, name: str) -> NotificationBuilder:
        self._channel = name
        return self

    def to(self, recipient: Recipient) -> NotificationBuilder:
        self._recipient = recipient
        return self

    def text(self, text: str) -> NotificationBuilder:
        self._text = text
        return self

    def with_timestamp(self) -> NotificationBuilder:
        return self.with_extras(["timestamp"])

    def with_signature(self) -> NotificationBuilder:
        return self.with_extras(["signature"])

    def with_encryption(self) -> NotificationBuilder:
        return self.with_extras(["encrypt"])

    def with_urgent(self) -> NotificationBuilder:
        return self.with_extras(["urgent"])

    def with_extras(self, names: Iterable[str]) -> NotificationBuilder:
        for name in names:
            if name not in AVAILABLE_DECORATORS:
                options = ", ".join(AVAILABLE_DECORATORS)
                raise ValueError(f"Noma'lum qo'shimcha: {name!r}. Mavjudlari: {options}")
            self._extras.append(name)
        return self

    def build(self) -> Notification:
        missing = [
            label
            for label, value in (
                ("tur", self._kind),
                ("kanal", self._channel),
                ("qabul qiluvchi", self._recipient),
                ("matn", self._text),
            )
            if value is None or value == ""
        ]
        if missing:
            raise ValueError(f"To'ldirilmagan maydonlar: {', '.join(missing)}")

        notification_class = NOTIFICATION_TYPES[self._kind]
        return notification_class(
            channel=ChannelFactory.create(self._channel),
            locale=get_locale_factory(self._locale),
            text=self._text,
            recipient=self._recipient,
            extras=self._extras,
        )
