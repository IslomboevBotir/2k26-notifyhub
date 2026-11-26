from __future__ import annotations

from typing import TYPE_CHECKING

from channels.base import Channel

if TYPE_CHECKING:
    from recipients.recipients import User


class TelegramChannel(Channel):
    name = "telegram"

    def send(self, recipient: User, text: str) -> bool:
        if not recipient.telegram:
            return False
        print(f"[TELEGRAM → {recipient.telegram}] {text}")
        return True
