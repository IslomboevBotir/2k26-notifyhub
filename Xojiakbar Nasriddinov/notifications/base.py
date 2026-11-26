from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Iterable
from dataclasses import dataclass
from typing import TYPE_CHECKING, ClassVar

from core.history import NotificationHistory
from decorators.message_decorators import Message, apply_decorators
from locales.factories import LocaleFactory, MessageTemplate, UzFactory

if TYPE_CHECKING:
    from channels.base import Channel
    from recipients.recipients import Recipient


@dataclass(frozen=True)
class DeliveryReport:
    text: str
    delivered: tuple[str, ...]
    failed: tuple[str, ...]

    @property
    def sent(self) -> int:
        return len(self.delivered)

    @property
    def total(self) -> int:
        return len(self.delivered) + len(self.failed)


class Notification(ABC):
    kind: ClassVar[str]

    def __init__(
        self,
        channel: Channel,
        *,
        locale: LocaleFactory | None = None,
        text: str = "",
        recipient: Recipient | None = None,
        extras: Iterable[str] = (),
    ) -> None:
        self.channel = channel
        self.locale = UzFactory() if locale is None else locale
        self.text = text
        self.recipient = recipient
        self.extras = tuple(extras)

    @abstractmethod
    def _create_template(self) -> MessageTemplate:
        ...

    def compose(self) -> str:
        body = Message(self._create_template().render(self.text))
        return apply_decorators(body, self.extras, self.locale.signature).render()

    def send(self, recipient: Recipient | None = None) -> DeliveryReport:
        target = self.recipient if recipient is None else recipient
        if target is None:
            raise ValueError("Qabul qiluvchi ko'rsatilmagan")

        text = self.compose()
        channel = self.channel.for_kind(self.kind)
        history = NotificationHistory()
        delivered: list[str] = []
        failed: list[str] = []

        for user in target.users():
            success = channel.send(user, text)
            history.record(self.kind, self.locale.code, channel.name, user.name, text, success)
            (delivered if success else failed).append(user.name)

        return DeliveryReport(text, tuple(delivered), tuple(failed))
