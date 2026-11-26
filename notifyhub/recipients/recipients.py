"""Qabul qiluvchilar.

PATTERN: Composite (bonus).
Nega: xabarni bitta odamga ham, guruhga ham, guruhlar guruhiga ham
("3-kurs" -> "301-guruh", "302-guruh") bir xil usulda yuborish kerak.
Mijoz kod (Notification) faqat `Recipient.users()` ni chaqiradi va
oddiy foydalanuvchi bilan guruhni farqlamaydi.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Iterator


class Recipient(ABC):
    """Composite komponenti: barg (User) va konteyner (Group) uchun umumiy interfeys."""

    name: str

    @abstractmethod
    def users(self) -> Iterator["User"]:
        """Ichidagi barcha yakuniy foydalanuvchilarni rekursiv qaytaradi."""


@dataclass(frozen=True)
class User(Recipient):
    """Composite bargi (leaf)."""

    name: str
    phone: str | None = None
    telegram: str | None = None

    def users(self) -> Iterator["User"]:
        yield self


class Group(Recipient):
    """Composite konteyneri: ichida User va boshqa Group bo'lishi mumkin."""

    def __init__(self, name: str, members: list[Recipient] | None = None) -> None:
        self.name = name
        self._members: list[Recipient] = list(members or [])

    def add(self, member: Recipient) -> "Group":
        self._members.append(member)
        return self

    def users(self) -> Iterator[User]:
        # Bitta odam ikki guruhda bo'lsa ham xabar unga bir marta boradi.
        seen: set[User] = set()
        for member in self._members:
            for user in member.users():
                if user not in seen:
                    seen.add(user)
                    yield user
