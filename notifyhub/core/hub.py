"""NotifyHub — tizimga yagona kirish nuqtasi.

PATTERN: Facade (bonus).
Nega: main.py Bridge, Abstract Factory, Decorator, Adapter, Composite,
Builder, Prototype va Singleton haqida hech narsa bilmasligi kerak.
U faqat `send()`, `show_history()`, `show_stats()`, `templates()` ni chaqiradi.
"""

from __future__ import annotations

from channels.factory import ChannelFactory
from core.builder import Dispatch, NotificationBuilder
from core.history import NotificationHistory
from decorators.message_decorators import DECORATORS
from locales.factories import LOCALES
from notifications.base import SendResult
from notifications.types import NOTIFICATION_TYPES
from recipients.recipients import Group, Recipient, User


def demo_directory() -> dict[str, Recipient]:
    """Namuna qabul qiluvchilar (Composite daraxti)."""
    ali = User("Ali", phone="+998901112233", telegram="@ali_dev")
    vali = User("Vali", phone="+998907778899", telegram="@vali")
    hasan = User("Hasan", phone="+998935554433")            # Telegram'i yo'q
    zarina = User("Zarina", phone="90-123", telegram="@zarina")  # telefon noto'g'ri
    g301 = Group("301-guruh", [ali, vali])
    g302 = Group("302-guruh", [hasan, zarina])
    kurs3 = Group("3-kurs", [g301, g302])
    return {r.name.lower(): r for r in (ali, vali, hasan, zarina, g301, g302, kurs3)}


class NotifyHub:
    KINDS = list(NOTIFICATION_TYPES)
    LOCALES = list(LOCALES)
    EXTRAS = list(DECORATORS)

    def __init__(self, directory: dict[str, Recipient] | None = None) -> None:
        self._directory = directory if directory is not None else demo_directory()
        self._history = NotificationHistory()
        self._templates = self._default_templates()

    # ---- qabul qiluvchilar -------------------------------------------------
    @property
    def channels(self) -> list[str]:
        return ChannelFactory.names()

    def recipient_names(self) -> list[str]:
        return [r.name for r in self._directory.values()]

    def find_recipient(self, name: str) -> Recipient:
        key = name.strip().lower()
        if key not in self._directory:
            raise ValueError(f"Qabul qiluvchi topilmadi: {name!r}. Mavjud: {', '.join(self.recipient_names())}")
        return self._directory[key]

    # ---- yuborish ----------------------------------------------------------
    def send(self, kind: str, locale: str, channel: str, recipient: str, text: str,
             extras: list[str] | None = None) -> SendResult:
        dispatch = (NotificationBuilder().type(kind).locale(locale).channel(channel)
                    .to(self.find_recipient(recipient)).text(text)
                    .decorate(*(extras or [])).build())
        return dispatch.send()

    # ---- tarqatma shablonlari (Prototype) ----------------------------------
    def _default_templates(self) -> dict[str, Dispatch]:
        d = self._directory
        return {
            "Haftalik eslatma": NotificationBuilder().type("reminder").locale("uz").channel("telegram")
                .to(d["3-kurs"]).text("Haftalik hisobotni juma kuni 18:00 gacha topshiring")
                .with_timestamp().with_signature().build(),
            "Server avariyasi": NotificationBuilder().type("alert").locale("en").channel("sms")
                .to(d["301-guruh"]).text("Server is down").urgent().build(),
            "Chegirma": NotificationBuilder().type("promo").locale("ru").channel("console")
                .to(d["3-kurs"]).text("Скидка 20% на все курсы").with_signature().build(),
        }

    def templates(self) -> list[str]:
        return list(self._templates)

    def preview_template(self, name: str) -> str:
        return self._templates[name].preview()

    def send_template(self, name: str, text: str | None = None, recipient: str | None = None) -> SendResult:
        copy_ = self._templates[name].clone(
            text=text or None,
            recipient=self.find_recipient(recipient) if recipient else None,
        )
        return copy_.send()

    # ---- tarix va statistika (Singleton) -----------------------------------
    def show_history(self, limit: int = 20) -> str:
        records = self._history.records[-limit:]
        if not records:
            return "Tarix bo'sh."
        lines = []
        for r in records:
            mark = "✅" if r.success else "❌"
            lines.append(f"{mark} {r.at:%d.%m.%Y %H:%M} | {r.kind:<8} | {r.channel:<8} | {r.recipient:<8} | {r.text}")
        return "\n".join(lines)

    def show_stats(self) -> str:
        s = self._history.stats()
        by_channel = " | ".join(f"{c}: {s.by_channel.get(c, 0)}" for c in self.channels)
        by_kind = " | ".join(f"{k}: {s.by_kind.get(k, 0)}" for k in self.KINDS)
        return (f"Jami yuborilgan: {s.total_sent}\n"
                f"  {by_channel}\n"
                f"  {by_kind}\n"
                f"  Xatolar: {s.failures}")
