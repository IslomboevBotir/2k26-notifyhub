"""Xabarni qo'shimcha qayta ishlash.

PATTERN: Decorator.
Nega: timestamp, imzo, shifrlash, urgent — istalgan tartibda va istalgan
miqdorda qo'llanadi. `Notification` ga `with_timestamp=True, encrypt=True`
kabi flaglar qo'shish o'rniga har bir qo'shimcha alohida o'ram bo'ladi:
yangi qo'shimcha = yangi klass, mavjud kod o'zgarmaydi; tartibni ham
chaqiruvchi belgilaydi: Signature(Timestamp(Message("...")))
"""

from __future__ import annotations

import base64
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Callable
from zoneinfo import ZoneInfo

TASHKENT = ZoneInfo("Asia/Tashkent")


class Message(ABC):
    """Decorator komponenti."""

    @abstractmethod
    def render(self) -> str: ...


class PlainMessage(Message):
    """Konkret komponent: oddiy matn."""

    def __init__(self, text: str) -> None:
        self.text = text

    def render(self) -> str:
        return self.text


class MessageDecorator(Message, ABC):
    """Bazaviy decorator: ichidagi xabarni o'raydi."""

    def __init__(self, inner: Message) -> None:
        self.inner = inner


class TimestampDecorator(MessageDecorator):
    def __init__(self, inner: Message, clock: Callable[[], datetime] | None = None) -> None:
        super().__init__(inner)
        self._clock = clock or (lambda: datetime.now(TASHKENT))

    def render(self) -> str:
        return f"{self.inner.render()} [{self._clock():%d.%m.%Y %H:%M}]"


class SignatureDecorator(MessageDecorator):
    def __init__(self, inner: Message, signature: str = "— NotifyHub") -> None:
        super().__init__(inner)
        self.signature = signature

    def render(self) -> str:
        return f"{self.inner.render()} {self.signature}"


class EncryptDecorator(MessageDecorator):
    """Base64 bilan 'shifrlaydi' (o'quv maqsadida)."""

    def render(self) -> str:
        encoded = base64.b64encode(self.inner.render().encode("utf-8")).decode("ascii")
        return f"ENC[{encoded}]"

    @staticmethod
    def decrypt(text: str) -> str:
        body = text.removeprefix("ENC[").removesuffix("]")
        return base64.b64decode(body).decode("utf-8")


class UrgentDecorator(MessageDecorator):
    def render(self) -> str:
        return f"🔴 {self.inner.render().upper()}"


DECORATORS: dict[str, type[MessageDecorator]] = {
    "timestamp": TimestampDecorator,
    "signature": SignatureDecorator,
    "encrypt": EncryptDecorator,
    "urgent": UrgentDecorator,
}


def apply_decorators(message: Message, names: list[str]) -> Message:
    """Nomlar ro'yxatini tartib bo'yicha o'raydi: birinchisi eng ichkarida."""
    for name in names:
        key = name.strip().lower()
        if not key:
            continue
        if key not in DECORATORS:
            raise ValueError(f"Noma'lum qo'shimcha: {name!r}. Mavjud: {', '.join(DECORATORS)}")
        message = DECORATORS[key](message)
    return message
