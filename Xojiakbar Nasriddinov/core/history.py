from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from threading import Lock


@dataclass(frozen=True)
class HistoryRecord:
    sent_at: datetime
    kind: str
    locale: str
    channel: str
    recipient: str
    text: str
    success: bool


@dataclass(frozen=True)
class Statistics:
    total_sent: int
    by_channel: Counter[str]
    by_kind: Counter[str]
    total_failed: int
    failed_by_channel: Counter[str]
    failed_by_kind: Counter[str]


class NotificationHistory:
    _instance: NotificationHistory | None = None
    _lock = Lock()
    _records: list[HistoryRecord]

    def __new__(cls) -> NotificationHistory:
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    instance = super().__new__(cls)
                    instance._records = []
                    cls._instance = instance
        return cls._instance

    def record(
        self,
        kind: str,
        locale: str,
        channel: str,
        recipient: str,
        text: str,
        success: bool,
    ) -> None:
        entry = HistoryRecord(datetime.now(), kind, locale, channel, recipient, text, success)
        with self._lock:
            self._records.append(entry)

    def records(self) -> tuple[HistoryRecord, ...]:
        with self._lock:
            return tuple(self._records)

    def statistics(self) -> Statistics:
        records = self.records()
        sent = [record for record in records if record.success]
        failed = [record for record in records if not record.success]
        return Statistics(
            total_sent=len(sent),
            by_channel=Counter(record.channel for record in sent),
            by_kind=Counter(record.kind for record in sent),
            total_failed=len(failed),
            failed_by_channel=Counter(record.channel for record in failed),
            failed_by_kind=Counter(record.kind for record in failed),
        )
