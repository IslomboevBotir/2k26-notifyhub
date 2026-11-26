from __future__ import annotations

from abc import ABC, abstractmethod


class MessageTemplate(ABC):
    @property
    @abstractmethod
    def prefix(self) -> str:
        ...

    def render(self, text: str) -> str:
        return f"{self.prefix}: {text}"


class AlertTemplate(MessageTemplate, ABC):
    pass


class ReminderTemplate(MessageTemplate, ABC):
    pass


class PromoTemplate(MessageTemplate, ABC):
    pass


class UzAlertTemplate(AlertTemplate):
    prefix = "⚠️ DIQQAT"


class UzReminderTemplate(ReminderTemplate):
    prefix = "Eslatma"


class UzPromoTemplate(PromoTemplate):
    prefix = "🎁 Aksiya"


class RuAlertTemplate(AlertTemplate):
    prefix = "⚠️ ВНИМАНИЕ"


class RuReminderTemplate(ReminderTemplate):
    prefix = "Напоминание"


class RuPromoTemplate(PromoTemplate):
    prefix = "🎁 Акция"


class EnAlertTemplate(AlertTemplate):
    prefix = "⚠️ ATTENTION"


class EnReminderTemplate(ReminderTemplate):
    prefix = "Reminder"


class EnPromoTemplate(PromoTemplate):
    prefix = "🎁 Promo"


class LocaleFactory(ABC):
    code: str
    signature: str

    @abstractmethod
    def create_alert_template(self) -> AlertTemplate:
        ...

    @abstractmethod
    def create_reminder_template(self) -> ReminderTemplate:
        ...

    @abstractmethod
    def create_promo_template(self) -> PromoTemplate:
        ...


class UzFactory(LocaleFactory):
    code = "uz"
    signature = "— NotifyHub jamoasi"

    def create_alert_template(self) -> AlertTemplate:
        return UzAlertTemplate()

    def create_reminder_template(self) -> ReminderTemplate:
        return UzReminderTemplate()

    def create_promo_template(self) -> PromoTemplate:
        return UzPromoTemplate()


class RuFactory(LocaleFactory):
    code = "ru"
    signature = "— Команда NotifyHub"

    def create_alert_template(self) -> AlertTemplate:
        return RuAlertTemplate()

    def create_reminder_template(self) -> ReminderTemplate:
        return RuReminderTemplate()

    def create_promo_template(self) -> PromoTemplate:
        return RuPromoTemplate()


class EnFactory(LocaleFactory):
    code = "en"
    signature = "— NotifyHub team"

    def create_alert_template(self) -> AlertTemplate:
        return EnAlertTemplate()

    def create_reminder_template(self) -> ReminderTemplate:
        return EnReminderTemplate()

    def create_promo_template(self) -> PromoTemplate:
        return EnPromoTemplate()


LOCALE_FACTORIES: dict[str, type[LocaleFactory]] = {
    factory.code: factory for factory in (UzFactory, RuFactory, EnFactory)
}


def get_locale_factory(code: str) -> LocaleFactory:
    key = code.strip().lower()
    if key not in LOCALE_FACTORIES:
        options = ", ".join(LOCALE_FACTORIES)
        raise ValueError(f"Noma'lum til: {code!r}. Mavjudlari: {options}")
    return LOCALE_FACTORIES[key]()
