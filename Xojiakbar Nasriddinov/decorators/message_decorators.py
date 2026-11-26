from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Callable, Iterable
from datetime import datetime

DEFAULT_SIGNATURE = "— NotifyHub jamoasi"
AVAILABLE_DECORATORS = ("timestamp", "signature", "encrypt", "urgent")

_ALPHABETS = (
    "abcdefghijklmnopqrstuvwxyz",
    "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
)


def caesar(text: str, shift: int) -> str:
    table: dict[int, str] = {}
    for alphabet in _ALPHABETS:
        for index, letter in enumerate(alphabet):
            target = alphabet[(index + shift) % len(alphabet)]
            table[ord(letter)] = target
            table[ord(letter.upper())] = target.upper()
    return text.translate(table)


class MessageComponent(ABC):
    @abstractmethod
    def render(self) -> str:
        ...


class Message(MessageComponent):
    def __init__(self, text: str) -> None:
        self._text = text

    def render(self) -> str:
        return self._text


class MessageDecorator(MessageComponent, ABC):
    def __init__(self, wrapped: MessageComponent) -> None:
        self._wrapped = wrapped


class TimestampDecorator(MessageDecorator):
    def __init__(
        self,
        wrapped: MessageComponent,
        clock: Callable[[], datetime] = datetime.now,
    ) -> None:
        super().__init__(wrapped)
        self._clock = clock

    def render(self) -> str:
        return f"{self._wrapped.render()} [{self._clock():%d.%m.%Y %H:%M}]"


class SignatureDecorator(MessageDecorator):
    def __init__(self, wrapped: MessageComponent, signature: str = DEFAULT_SIGNATURE) -> None:
        super().__init__(wrapped)
        self._signature = signature

    def render(self) -> str:
        return f"{self._wrapped.render()} {self._signature}"


class EncryptDecorator(MessageDecorator):
    def __init__(self, wrapped: MessageComponent, shift: int = 3) -> None:
        super().__init__(wrapped)
        self._shift = shift

    def render(self) -> str:
        return caesar(self._wrapped.render(), self._shift)


class UrgentDecorator(MessageDecorator):
    def render(self) -> str:
        return f"🔴 {self._wrapped.render().upper()}"


def apply_decorators(
    message: MessageComponent,
    names: Iterable[str],
    signature: str = DEFAULT_SIGNATURE,
) -> MessageComponent:
    wrappers: dict[str, Callable[[MessageComponent], MessageComponent]] = {
        "timestamp": TimestampDecorator,
        "signature": lambda wrapped: SignatureDecorator(wrapped, signature),
        "encrypt": EncryptDecorator,
        "urgent": UrgentDecorator,
    }
    for name in names:
        if name not in wrappers:
            options = ", ".join(AVAILABLE_DECORATORS)
            raise ValueError(f"Noma'lum qo'shimcha: {name!r}. Mavjudlari: {options}")
        message = wrappers[name](message)
    return message
