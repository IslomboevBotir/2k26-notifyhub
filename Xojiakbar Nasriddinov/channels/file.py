from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import TYPE_CHECKING

from channels.base import Channel

if TYPE_CHECKING:
    from recipients.recipients import User

DEFAULT_LOG_PATH = Path(__file__).resolve().parent.parent / "data" / "notifications.log"


class FileChannel(Channel):
    name = "file"

    def __init__(self, path: str | Path = DEFAULT_LOG_PATH) -> None:
        self._path = Path(path)

    def send(self, recipient: User, text: str) -> bool:
        line = f"[{datetime.now():%d.%m.%Y %H:%M:%S}] [FILE → {recipient.name}] {text}\n"
        try:
            self._path.parent.mkdir(parents=True, exist_ok=True)
            with self._path.open("a", encoding="utf-8") as log_file:
                log_file.write(line)
        except OSError:
            return False
        print(f"[FILE → {recipient.name}] {self._path.name} fayliga yozildi")
        return True
