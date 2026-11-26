from __future__ import annotations

from typing import TYPE_CHECKING

from channels.base import Channel

if TYPE_CHECKING:
    from recipients.recipients import User


class ConsoleChannel(Channel):
    name = "console"

    def send(self, recipient: User, text: str) -> bool:
        print(f"[CONSOLE → {recipient.name}] {text}")
        return True
