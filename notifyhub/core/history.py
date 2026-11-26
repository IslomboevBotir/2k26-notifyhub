"""Tarix va statistika.

PATTERN: Singleton.
Nega: dastur bo'yicha barcha yuborishlar BITTA joyda yig'ilishi kerak —
qaysi Notification, qaysi kanal orqali yuborgan bo'lishidan qat'i nazar.
`NotificationHistory()` har chaqirilganda o'sha bitta obyektni qaytaradi.

Kamchiligi (himoya uchun): global holat — testlarda izolyatsiya qiyin
(shuning uchun `reset()` bor), bog'liqlik yashirin bo'ladi, ko'p oqimli
dasturda qulf (lock) kerak.
"""

from __future__ import annotations

import threading
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime
from zoneinfo import ZoneInfo

TASHKENT = ZoneInfo("Asia/Tashkent")


@dataclass(frozen=True)
class HistoryRecord:
    kind: str
    channel: str
    recipient: str
    text: str
    success: bool
    at: datetime = field(default_factory=lambda: datetime.now(TASHKENT))


@dataclass
class Stats:
    total_sent: int
    by_channel: Counter
    by_kind: Counter
    failures: int


class NotificationHistory:
    _instance: "NotificationHistory | None" = None
    _lock = threading.Lock()

    def __new__(cls) -> "NotificationHistory":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    instance = super().__new__(cls)
                    instance._records = []
                    cls._instance = instance
        return cls._instance

    def record(self, kind: str, channel: str, recipient: str, text: str, success: bool) -> None:
        self._records.append(HistoryRecord(kind, channel, recipient, text, success))

    @property
    def records(self) -> list[HistoryRecord]:
        return list(self._records)

    def stats(self) -> Stats:
        ok = [r for r in self._records if r.success]
        return Stats(
            total_sent=len(ok),
            by_channel=Counter(r.channel for r in ok),
            by_kind=Counter(r.kind for r in ok),
            failures=sum(1 for r in self._records if not r.success),
        )

    def reset(self) -> None:
        """Faqat testlar uchun."""
        self._records.clear()
