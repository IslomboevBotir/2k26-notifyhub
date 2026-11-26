"""Til shablonlari.

PATTERN: Abstract Factory.
Nega: bitta til uchun bir-biriga mos shablonlar OILASI kerak
(alert + reminder + promo). Notification bitta `LocaleFactory` oladi va
barcha shablonlarni shundan oladi — shuning uchun bitta xabarda o'zbekcha
va ruscha shablon aralashib ketishi mumkin emas.
"""

from __future__ import annotations

from abc import ABC, abstractmethod


# ---- Mahsulotlar (products) -------------------------------------------------

class Template(ABC):
    prefix: str = ""

    def render(self, text: str) -> str:
        return f"{self.prefix}{text}"


class AlertTemplate(Template, ABC):
    pass


class ReminderTemplate(Template, ABC):
    pass


class PromoTemplate(Template, ABC):
    pass


class UzAlertTemplate(AlertTemplate):
    prefix = "⚠️ DIQQAT: "


class UzReminderTemplate(ReminderTemplate):
    prefix = "Eslatma: "


class UzPromoTemplate(PromoTemplate):
    prefix = "🎁 Aksiya: "


class RuAlertTemplate(AlertTemplate):
    prefix = "⚠️ ВНИМАНИЕ: "


class RuReminderTemplate(ReminderTemplate):
    prefix = "Напоминание: "


class RuPromoTemplate(PromoTemplate):
    prefix = "🎁 Акция: "


class EnAlertTemplate(AlertTemplate):
    prefix = "⚠️ ATTENTION: "


class EnReminderTemplate(ReminderTemplate):
    prefix = "Reminder: "


class EnPromoTemplate(PromoTemplate):
    prefix = "🎁 Promo: "


# ---- Fabrikalar -------------------------------------------------------------

class LocaleFactory(ABC):
    code: str = ""

    @abstractmethod
    def create_alert_template(self) -> AlertTemplate: ...

    @abstractmethod
    def create_reminder_template(self) -> ReminderTemplate: ...

    @abstractmethod
    def create_promo_template(self) -> PromoTemplate: ...


class UzFactory(LocaleFactory):
    code = "uz"

    def create_alert_template(self) -> AlertTemplate:
        return UzAlertTemplate()

    def create_reminder_template(self) -> ReminderTemplate:
        return UzReminderTemplate()

    def create_promo_template(self) -> PromoTemplate:
        return UzPromoTemplate()


class RuFactory(LocaleFactory):
    code = "ru"

    def create_alert_template(self) -> AlertTemplate:
        return RuAlertTemplate()

    def create_reminder_template(self) -> ReminderTemplate:
        return RuReminderTemplate()

    def create_promo_template(self) -> PromoTemplate:
        return RuPromoTemplate()


class EnFactory(LocaleFactory):
    code = "en"

    def create_alert_template(self) -> AlertTemplate:
        return EnAlertTemplate()

    def create_reminder_template(self) -> ReminderTemplate:
        return EnReminderTemplate()

    def create_promo_template(self) -> PromoTemplate:
        return EnPromoTemplate()


LOCALES: dict[str, type[LocaleFactory]] = {"uz": UzFactory, "ru": RuFactory, "en": EnFactory}


def get_locale_factory(code: str) -> LocaleFactory:
    key = code.strip().lower()
    if key not in LOCALES:
        raise ValueError(f"Noma'lum til: {code!r}. Mavjud: {', '.join(LOCALES)}")
    return LOCALES[key]()
