"""Konsol kanali (Bridge realizatsiyasi)."""

from channels.base import Channel
from recipients.recipients import User


class ConsoleChannel(Channel):
    name = "console"

    def send(self, recipient: User, text: str, kind: str = "alert") -> bool:
        print(f"[Console → {recipient.name}] {text}")
        return True
