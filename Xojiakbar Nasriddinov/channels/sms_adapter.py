from __future__ import annotations

import re
from typing import TYPE_CHECKING

from channels.base import Channel

if TYPE_CHECKING:
    from recipients.recipients import User

_PHONE_PATTERN = re.compile(r"\+998\d{9}")


class LegacySmsGateway:
    def send_sms(self, phone: str, payload: bytes, priority_code: int) -> int:
        """Muvaffaqiyatli bo'lsa 200, xato bo'lsa 400 qaytaradi."""
        if not _PHONE_PATTERN.fullmatch(phone) or not payload or priority_code not in (1, 2, 3):
            return 400
        print(f"[SMS → {phone}] {payload.decode('utf-8')}")
        return 200


class SmsChannelAdapter(Channel):
    name = "sms"

    PRIORITY_CODES = {"alert": 1, "reminder": 2, "promo": 3}
    DEFAULT_PRIORITY = 3
    SUCCESS_STATUS = 200

    def __init__(self, gateway: LegacySmsGateway | None = None, kind: str = "reminder") -> None:
        self._gateway = LegacySmsGateway() if gateway is None else gateway
        self._kind = kind
        self._priority_code = self.PRIORITY_CODES.get(kind, self.DEFAULT_PRIORITY)

    def for_kind(self, kind: str) -> SmsChannelAdapter:
        return SmsChannelAdapter(self._gateway, kind)

    def send(self, recipient: User, text: str) -> bool:
        status = self._gateway.send_sms(
            recipient.phone or "",
            text.encode("utf-8"),
            self._priority_code,
        )
        return status == self.SUCCESS_STATUS
