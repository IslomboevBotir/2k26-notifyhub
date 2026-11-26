from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from recipients.recipients import User


class Channel(ABC):
    name: str = "channel"

    @abstractmethod
    def send(self, recipient: User, text: str) -> bool:
        ...

    def for_kind(self, kind: str) -> Channel:
        return self
