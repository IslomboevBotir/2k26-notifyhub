"""Bildirishnoma.

PATTERN: Bridge — abstraksiya tomoni.
Nega: Notification ichida `channel` (realizatsiya) havolasi saqlanadi.
3 tur x 4 kanal uchun 12 ta klass (TelegramAlert, SmsReminder, ...) o'rniga
3 + 4 = 7 klass yetadi. Yangi kanal qo'shilsa bu fayl o'zgarmaydi.

Bu yerda boshqa patternlar ham uchrashadi:
- locale (Abstract Factory) — matn shablonini beradi;
- decorators (Decorator) — shablondan keyingi qayta ishlash;
- recipient (Composite) — bitta odam yoki guruh;
- NotificationHistory (Singleton) — har bir yuborish natijasi yoziladi.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

from channels.base import Channel
from core.history import NotificationHistory
from decorators.message_decorators import Message, PlainMessage, apply_decorators
from locales.factories import LocaleFactory, Template
from recipients.recipients import Recipient


@dataclass
class SendResult:
    sent: int
    total: int

    @property
    def ok(self) -> bool:
        return self.total > 0 and self.sent == self.total


class Notification(ABC):
    kind: str = ""

    def __init__(self, channel: Channel, locale: LocaleFactory) -> None:
        self.channel = channel
        self.locale = locale

    @abstractmethod
    def _template(self) -> Template:
        """Tur o'ziga mos shablonni til fabrikasidan oladi."""

    def compose(self, text: str, decorators: list[str] | None = None) -> str:
        message: Message = PlainMessage(self._template().render(text))
        return apply_decorators(message, decorators or []).render()

    def send(self, recipient: Recipient, text: str, decorators: list[str] | None = None) -> SendResult:
        body = self.compose(text, decorators)
        history = NotificationHistory()
        sent = total = 0
        for user in recipient.users():
            total += 1
            ok = self.channel.send(user, body, self.kind)
            sent += ok
            history.record(kind=self.kind, channel=self.channel.name,
                           recipient=user.name, text=body, success=ok)
        return SendResult(sent=sent, total=total)
