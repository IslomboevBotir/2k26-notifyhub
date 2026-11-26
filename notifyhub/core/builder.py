"""Bildirishnoma quruvchisi.

PATTERN: Builder (bonus).
Nega: tarqatma 6-7 ta parametrdan yig'iladi (tur, til, kanal, qabul qiluvchi,
matn, qo'shimchalar). Bitta uzun konstruktor o'rniga zanjirli, o'qilishi
oson API beradi va `build()` da hamma majburiy maydon borligini tekshiradi:

    NotificationBuilder().type("alert").locale("uz").channel("sms") \
        .to(group).text("...").with_timestamp().build().send()

PATTERN: Prototype (bonus) — `Dispatch.clone()`.
Nega: «Haftalik eslatma» kabi saqlangan tarqatmalarni noldan yig'ish
o'rniga nusxalab, faqat matn yoki qabul qiluvchini o'zgartiramiz. Asl
shablon o'zgarmay qoladi.
"""

from __future__ import annotations

import copy

from channels.factory import ChannelFactory
from locales.factories import get_locale_factory
from notifications.base import Notification, SendResult
from notifications.types import notification_class
from recipients.recipients import Recipient


class Dispatch:
    """Yuborishga tayyor tarqatma (Builder mahsuloti, Prototype)."""

    def __init__(self, notification: Notification, recipient: Recipient, text: str,
                 decorators: list[str]) -> None:
        self.notification = notification
        self.recipient = recipient
        self.text = text
        self.decorators = decorators

    def preview(self) -> str:
        return self.notification.compose(self.text, self.decorators)

    def send(self) -> SendResult:
        return self.notification.send(self.recipient, self.text, self.decorators)

    def clone(self, *, text: str | None = None, recipient: Recipient | None = None) -> "Dispatch":
        # Sayoz nusxa: Notification/kanal/qabul qiluvchi umumiy bo'lishi mumkin,
        # lekin decorators ro'yxati alohida — nusxani o'zgartirish aslini buzmaydi.
        twin = copy.copy(self)
        twin.decorators = list(self.decorators)
        if text is not None:
            twin.text = text
        if recipient is not None:
            twin.recipient = recipient
        return twin


class NotificationBuilder:
    def __init__(self) -> None:
        self._kind: str | None = None
        self._locale = "uz"
        self._channel: str | None = None
        self._recipient: Recipient | None = None
        self._text: str | None = None
        self._decorators: list[str] = []

    def type(self, kind: str) -> "NotificationBuilder":
        self._kind = kind
        return self

    def locale(self, code: str) -> "NotificationBuilder":
        self._locale = code
        return self

    def channel(self, name: str) -> "NotificationBuilder":
        self._channel = name
        return self

    def to(self, recipient: Recipient) -> "NotificationBuilder":
        self._recipient = recipient
        return self

    def text(self, text: str) -> "NotificationBuilder":
        self._text = text
        return self

    def decorate(self, *names: str) -> "NotificationBuilder":
        self._decorators.extend(n.strip().lower() for n in names if n.strip())
        return self

    def with_timestamp(self) -> "NotificationBuilder":
        return self.decorate("timestamp")

    def with_signature(self) -> "NotificationBuilder":
        return self.decorate("signature")

    def encrypted(self) -> "NotificationBuilder":
        return self.decorate("encrypt")

    def urgent(self) -> "NotificationBuilder":
        return self.decorate("urgent")

    def build(self) -> Dispatch:
        missing = [name for name, value in (("type", self._kind), ("channel", self._channel),
                                            ("to", self._recipient)) if value is None]
        if missing:
            raise ValueError(f"Builder: majburiy maydon yo'q: {', '.join(missing)}")
        if not self._text or not self._text.strip():
            raise ValueError("Builder: matn bo'sh bo'lmasligi kerak")
        notification = notification_class(self._kind)(
            channel=ChannelFactory.create(self._channel),
            locale=get_locale_factory(self._locale),
        )
        # Noto'g'ri qo'shimcha nomi yuborishdan oldin aniqlansin.
        notification.compose(self._text, self._decorators)
        return Dispatch(notification, self._recipient, self._text.strip(), list(self._decorators))
