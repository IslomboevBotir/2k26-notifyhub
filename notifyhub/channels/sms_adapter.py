"""SMS kanali.

PATTERN: Adapter.
Nega: `LegacySmsGateway` — tashqi kutubxona, uni o'zgartirib bo'lmaydi.
Uning interfeysi `send_sms(phone, payload: bytes, priority_code: int) -> int`,
bizniki esa `Channel.send(recipient, text) -> bool`. `SmsChannelAdapter`
ikkalasini bog'laydi: matn -> bytes, tur -> priority_code, 200/400 -> True/False.
Adapter bir vaqtda Bridge realizatsiyasi ham (Channel'dan meros oladi).
"""

import re

from channels.base import Channel
from recipients.recipients import User


class LegacySmsGateway:
    """«Tashqi kutubxona». O'ZGARTIRILMAYDI — faqat imitatsiya."""

    _PHONE_RE = re.compile(r"^\+998\d{9}$")

    def send_sms(self, phone: str, payload: bytes, priority_code: int) -> int:
        """Muvaffaqiyatli bo'lsa 200, xato bo'lsa 400 qaytaradi."""
        if not phone or not self._PHONE_RE.match(phone) or not payload:
            return 400
        if priority_code not in (1, 2, 3):
            return 400
        print(f"[SMS → {phone}] {payload.decode('utf-8')}")
        return 200


class SmsChannelAdapter(Channel):
    """Adapter: Channel interfeysini LegacySmsGateway ga o'giradi."""

    name = "sms"

    PRIORITY = {"alert": 1, "reminder": 2, "promo": 3}

    def __init__(self, gateway: LegacySmsGateway | None = None) -> None:
        self._gateway = gateway or LegacySmsGateway()

    def send(self, recipient: User, text: str, kind: str = "alert") -> bool:
        payload = text.encode("utf-8")
        priority_code = self.PRIORITY.get(kind, 1)
        code = self._gateway.send_sms(recipient.phone or "", payload, priority_code)
        if code != 200:
            print(f"[SMS ✗ {recipient.name}] shlyuz xatosi {code}")
        return code == 200
