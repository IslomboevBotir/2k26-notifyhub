from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Iterable


class Recipient(ABC):
    def __init__(self, name: str) -> None:
        self.name = name

    @abstractmethod
    def users(self) -> list[User]:
        ...

    def contains(self, target: Recipient) -> bool:
        return False


class User(Recipient):
    def __init__(self, name: str, phone: str | None = None, telegram: str | None = None) -> None:
        super().__init__(name)
        self.phone = phone
        self.telegram = telegram

    def users(self) -> list[User]:
        return [self]


class Group(Recipient):
    def __init__(self, name: str, members: Iterable[Recipient] = ()) -> None:
        super().__init__(name)
        self._members: list[Recipient] = []
        for member in members:
            self.add(member)

    def add(self, member: Recipient) -> None:
        if member is self or member.contains(self):
            raise ValueError(f"{member.name!r} guruhini {self.name!r} ichiga qo'shib bo'lmaydi")
        self._members.append(member)

    def contains(self, target: Recipient) -> bool:
        return any(member is target or member.contains(target) for member in self._members)

    def users(self) -> list[User]:
        unique: dict[int, User] = {}
        for member in self._members:
            for user in member.users():
                unique.setdefault(id(user), user)
        return list(unique.values())


class RecipientDirectory:
    def __init__(self) -> None:
        self._items: dict[str, Recipient] = {}

    def register(self, *recipients: Recipient) -> None:
        for recipient in recipients:
            self._items[recipient.name.casefold()] = recipient

    def find(self, name: str) -> Recipient | None:
        return self._items.get(name.strip().casefold())

    def names(self) -> list[str]:
        return [recipient.name for recipient in self._items.values()]


def build_demo_directory() -> RecipientDirectory:
    ali = User("Ali", phone="+998901112233", telegram="@ali_student")
    malika = User("Malika", phone="+998907778899", telegram="@malika_uz")
    sardor = User("Sardor", phone="+998935556677", telegram="@sardor_teacher")
    rustam = User("Rustam", phone="901234")

    group_301 = Group("301-guruh", [ali])
    group_302 = Group("302-guruh", [malika])
    course_3 = Group("3-kurs", [group_301, group_302])
    teachers = Group("O'qituvchilar", [sardor, rustam])
    university = Group("Universitet", [course_3, teachers])

    directory = RecipientDirectory()
    directory.register(ali, malika, sardor, rustam)
    directory.register(group_301, group_302, course_3, teachers, university)
    return directory
