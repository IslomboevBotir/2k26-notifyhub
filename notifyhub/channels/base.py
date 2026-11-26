"""Yuborish kanali.

PATTERN: Bridge — realizatsiya (Implementor) tomoni.
Nega: bildirishnoma turi (Alert/Reminder/Promo) va yetkazish usuli
(console/file/telegram/sms) mustaqil o'zgaradi. Yangi kanal qo'shish uchun
faqat shu klassdan meros olinadi, Notification klasslariga tegilmaydi.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from recipients.recipients import User


class Channel(ABC):
    #: Statistika va menyu uchun kanal nomi.
    name: str = "channel"

    @abstractmethod
    def send(self, recipient: User, text: str, kind: str = "alert") -> bool:
        """Matnni foydalanuvchiga yuboradi. Muvaffaqiyatli bo'lsa True.

        `kind` — bildirishnoma turi (alert/reminder/promo). Ko'p kanallar uni
        e'tiborsiz qoldiradi, lekin SMS adapteri undan priority_code yasaydi.
        """
