from __future__ import annotations

from abc import ABC, abstractmethod

from channels.base import Channel
from channels.console import ConsoleChannel
from channels.file import FileChannel
from channels.sms_adapter import LegacySmsGateway, SmsChannelAdapter
from channels.telegram import TelegramChannel


class ChannelFactory(ABC):
    _registry: dict[str, type[ChannelFactory]] = {}

    def __init_subclass__(cls, channel_name: str, **kwargs) -> None:
        super().__init_subclass__(**kwargs)
        ChannelFactory._registry[channel_name] = cls

    @abstractmethod
    def create_channel(self) -> Channel:
        ...

    @classmethod
    def create(cls, name: str) -> Channel:
        key = name.strip().lower()
        if key not in cls._registry:
            options = ", ".join(cls._registry)
            raise ValueError(f"Noma'lum kanal: {name!r}. Mavjudlari: {options}")
        return cls._registry[key]().create_channel()

    @classmethod
    def available(cls) -> tuple[str, ...]:
        return tuple(cls._registry)


class ConsoleChannelFactory(ChannelFactory, channel_name="console"):
    def create_channel(self) -> Channel:
        return ConsoleChannel()


class FileChannelFactory(ChannelFactory, channel_name="file"):
    def create_channel(self) -> Channel:
        return FileChannel()


class TelegramChannelFactory(ChannelFactory, channel_name="telegram"):
    def create_channel(self) -> Channel:
        return TelegramChannel()


class SmsChannelFactory(ChannelFactory, channel_name="sms"):
    def create_channel(self) -> Channel:
        return SmsChannelAdapter(LegacySmsGateway())
