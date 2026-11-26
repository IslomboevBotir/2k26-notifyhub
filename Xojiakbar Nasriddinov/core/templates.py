from __future__ import annotations

from dataclasses import dataclass, replace

from recipients.recipients import Recipient, RecipientDirectory


@dataclass(frozen=True)
class BroadcastTemplate:
    title: str
    kind: str
    locale: str
    channel: str
    recipient: Recipient
    text: str
    extras: tuple[str, ...] = ()

    def clone(
        self,
        *,
        text: str | None = None,
        recipient: Recipient | None = None,
    ) -> BroadcastTemplate:
        return replace(
            self,
            text=self.text if text is None else text,
            recipient=self.recipient if recipient is None else recipient,
        )


class TemplateRegistry:
    def __init__(self, templates: tuple[BroadcastTemplate, ...] = ()) -> None:
        self._templates = list(templates)

    def __len__(self) -> int:
        return len(self._templates)

    def all(self) -> tuple[BroadcastTemplate, ...]:
        return tuple(self._templates)

    def clone_at(
        self,
        index: int,
        *,
        text: str | None = None,
        recipient: Recipient | None = None,
    ) -> BroadcastTemplate:
        if not 1 <= index <= len(self._templates):
            raise ValueError(f"Bunday shablon yo'q: {index}")
        return self._templates[index - 1].clone(text=text, recipient=recipient)


def build_demo_templates(directory: RecipientDirectory) -> TemplateRegistry:
    course = directory.find("3-kurs")
    university = directory.find("Universitet")
    if course is None or university is None:
        raise ValueError("Namunaviy shablonlar uchun guruhlar topilmadi")

    return TemplateRegistry(
        (
            BroadcastTemplate(
                title="Haftalik eslatma",
                kind="reminder",
                locale="uz",
                channel="telegram",
                recipient=course,
                text="Haftalik hisobotni juma kuniga qadar topshiring",
                extras=("timestamp", "signature"),
            ),
            BroadcastTemplate(
                title="Texnik ishlar",
                kind="alert",
                locale="ru",
                channel="console",
                recipient=university,
                text="Портал не будет работать в субботу с 02:00 до 04:00",
                extras=("urgent", "timestamp"),
            ),
            BroadcastTemplate(
                title="Yangi kurslar aksiyasi",
                kind="promo",
                locale="en",
                channel="sms",
                recipient=course,
                text="20% off all online courses this week",
                extras=("signature",),
            ),
        )
    )
