"""Kanal fabrikasi.

PATTERN: Factory Method (bonus).
Nega: menyu, Builder va Facade kanalni faqat nomi bo'yicha ("telegram")
bilishadi. Qaysi konkret klass yaratilishini shu bitta joy hal qiladi —
yangi kanal qo'shilsa faqat `register()` chaqiriladi, chaqiruvchilar o'zgarmaydi.
"""

from typing import Callable

from channels.base import Channel
from channels.console import ConsoleChannel
from channels.file import FileChannel
from channels.sms_adapter import SmsChannelAdapter
from channels.telegram import TelegramChannel


class ChannelFactory:
    _registry: dict[str, Callable[[], Channel]] = {
        "console": ConsoleChannel,
        "file": FileChannel,
        "telegram": TelegramChannel,
        "sms": SmsChannelAdapter,
    }

    @classmethod
    def create(cls, name: str) -> Channel:
        key = name.strip().lower()
        if key not in cls._registry:
            raise ValueError(f"Noma'lum kanal: {name!r}. Mavjud: {', '.join(cls.names())}")
        return cls._registry[key]()

    @classmethod
    def register(cls, name: str, creator: Callable[[], Channel]) -> None:
        cls._registry[name.lower()] = creator

    @classmethod
    def names(cls) -> list[str]:
        return list(cls._registry)
