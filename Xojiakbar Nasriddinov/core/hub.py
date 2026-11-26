from __future__ import annotations

from collections import Counter
from collections.abc import Iterable

from channels.factory import ChannelFactory
from core.builder import NotificationBuilder
from core.history import NotificationHistory
from core.templates import TemplateRegistry, build_demo_templates
from decorators.message_decorators import AVAILABLE_DECORATORS
from locales.factories import LOCALE_FACTORIES
from notifications.base import DeliveryReport
from notifications.types import NOTIFICATION_TYPES
from recipients.recipients import Recipient, RecipientDirectory, build_demo_directory


class NotifyHub:
    def __init__(
        self,
        directory: RecipientDirectory | None = None,
        templates: TemplateRegistry | None = None,
    ) -> None:
        self._directory = build_demo_directory() if directory is None else directory
        self._templates = (
            build_demo_templates(self._directory) if templates is None else templates
        )
        self._history = NotificationHistory()

    @property
    def kinds(self) -> tuple[str, ...]:
        return tuple(NOTIFICATION_TYPES)

    @property
    def locales(self) -> tuple[str, ...]:
        return tuple(LOCALE_FACTORIES)

    @property
    def channels(self) -> tuple[str, ...]:
        return ChannelFactory.available()

    @property
    def extras(self) -> tuple[str, ...]:
        return AVAILABLE_DECORATORS

    @property
    def template_count(self) -> int:
        return len(self._templates)

    def recipient_names(self) -> list[str]:
        return self._directory.names()

    def has_recipient(self, name: str) -> bool:
        return self._directory.find(name) is not None

    def send(
        self,
        kind: str,
        locale: str,
        channel: str,
        recipient: str,
        text: str,
        extras: Iterable[str] = (),
    ) -> DeliveryReport:
        notification = (
            NotificationBuilder()
            .type(kind)
            .locale(locale)
            .channel(channel)
            .to(self._find_recipient(recipient))
            .text(text)
            .with_extras(extras)
            .build()
        )
        return notification.send()

    def send_from_template(
        self,
        number: int,
        text: str | None = None,
        recipient: str | None = None,
    ) -> DeliveryReport:
        target = None if recipient is None else self._find_recipient(recipient)
        copy = self._templates.clone_at(number, text=text, recipient=target)
        notification = (
            NotificationBuilder()
            .type(copy.kind)
            .locale(copy.locale)
            .channel(copy.channel)
            .to(copy.recipient)
            .text(copy.text)
            .with_extras(copy.extras)
            .build()
        )
        return notification.send()

    def show_templates(self) -> None:
        for number, template in enumerate(self._templates.all(), start=1):
            print(
                f"{number}. {template.title} "
                f"[{template.kind}/{template.locale}/{template.channel} → "
                f"{template.recipient.name}]"
            )
            print(f"   Matn: {template.text}")

    def show_history(self) -> None:
        records = self._history.records()
        if not records:
            print("Tarix bo'sh.")
            return
        for number, record in enumerate(records, start=1):
            mark = "✅" if record.success else "❌"
            print(
                f"{number}. [{record.sent_at:%d.%m.%Y %H:%M}] {mark} "
                f"{record.kind}/{record.locale} | {record.channel} → {record.recipient}: "
                f"{record.text}"
            )

    def show_stats(self) -> None:
        stats = self._history.statistics()
        print(f"Jami yuborilgan: {stats.total_sent}")
        print(f"  {self._format_counts(self.channels, stats.by_channel)}")
        print(f"  {self._format_counts(self.kinds, stats.by_kind)}")

        details = ""
        if stats.total_failed:
            failed_channels = self._format_nonzero(self.channels, stats.failed_by_channel)
            failed_kinds = self._format_nonzero(self.kinds, stats.failed_by_kind)
            details = f" ({failed_channels}; {failed_kinds})"
        print(f"  Xatolar: {stats.total_failed}{details}")

    def _find_recipient(self, name: str) -> Recipient:
        recipient = self._directory.find(name)
        if recipient is None:
            raise ValueError(f"Qabul qiluvchi topilmadi: {name!r}")
        return recipient

    @staticmethod
    def _format_counts(names: Iterable[str], counts: Counter[str]) -> str:
        return " | ".join(f"{name}: {counts[name]}" for name in names)

    @staticmethod
    def _format_nonzero(names: Iterable[str], counts: Counter[str]) -> str:
        return " | ".join(f"{name}: {counts[name]}" for name in names if counts[name])
