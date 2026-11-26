"""Telegram kanali (Bridge realizatsiyasi, imitatsiya — tarmoq so'rovi yo'q)."""

from channels.base import Channel
from recipients.recipients import User


class TelegramChannel(Channel):
    name = "telegram"

    def send(self, recipient: User, text: str, kind: str = "alert") -> bool:
        if not recipient.telegram:
            print(f"[Telegram ✗ {recipient.name}] Telegram akkaunti yo'q")
            return False
        print(f"[Telegram → {recipient.telegram}] {text}")
        return True
