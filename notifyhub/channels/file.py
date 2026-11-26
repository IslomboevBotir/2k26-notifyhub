"""Fayl kanali (Bridge realizatsiyasi): xabarlarni outbox faylga yozadi."""

from pathlib import Path

from channels.base import Channel
from recipients.recipients import User


class FileChannel(Channel):
    name = "file"

    def __init__(self, path: str | Path = "outbox.log") -> None:
        self.path = Path(path)

    def send(self, recipient: User, text: str, kind: str = "alert") -> bool:
        line = f"[File → {recipient.name}] {text}"
        try:
            with self.path.open("a", encoding="utf-8") as f:
                f.write(line + "\n")
        except OSError as exc:
            print(f"[File ✗ {recipient.name}] yozib bo'lmadi: {exc}")
            return False
        print(f"{line}  (→ {self.path})")
        return True
