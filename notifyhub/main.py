"""NotifyHub konsol menyusi. Faqat Facade (NotifyHub) bilan ishlaydi.

Ishga tushirish:  python notifyhub/main.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from core.hub import NotifyHub  # noqa: E402

MENU = """
========= NotifyHub =========
1. Bildirishnoma yuborish
2. Tarix
3. Statistika
4. Tarqatma shablonlari
0. Chiqish"""


def ask(prompt: str) -> str:
    return input(prompt).strip()


def print_result(result) -> None:
    mark = "✅" if result.ok else "⚠️"
    print(f"{mark} Yuborildi: {result.total} tadan {result.sent} tasi")


def send_flow(hub: NotifyHub) -> None:
    kind = ask(f"Tur ({' / '.join(hub.KINDS)}): ")
    locale = ask(f"Til ({' / '.join(hub.LOCALES)}): ")
    channel = ask(f"Kanal ({' / '.join(hub.channels)}): ")
    recipient = ask(f"Qabul qiluvchi ({', '.join(hub.recipient_names())}): ")
    text = ask("Matn: ")
    extras = ask(f"Qo'shimchalar ({', '.join(hub.EXTRAS)}): ")
    print()
    print_result(hub.send(kind, locale, channel, recipient, text, extras.split(",")))


def templates_flow(hub: NotifyHub) -> None:
    names = hub.templates()
    for i, name in enumerate(names, 1):
        print(f"{i}. {name}\n   {hub.preview_template(name)}")
    choice = ask("Shablon raqami (bo'sh — orqaga): ")
    if not choice:
        return
    if not choice.isdigit() or not 1 <= int(choice) <= len(names):
        print("Noto'g'ri raqam.")
        return
    name = names[int(choice) - 1]
    text = ask("Yangi matn (bo'sh — shablondagi): ")
    recipient = ask("Yangi qabul qiluvchi (bo'sh — shablondagi): ")
    print()
    print_result(hub.send_template(name, text or None, recipient or None))


def main() -> None:
    hub = NotifyHub()
    actions = {
        "1": lambda: send_flow(hub),
        "2": lambda: print(hub.show_history()),
        "3": lambda: print(hub.show_stats()),
        "4": lambda: templates_flow(hub),
    }
    while True:
        print(MENU)
        try:
            choice = ask("> ")
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if choice == "0":
            break
        action = actions.get(choice)
        if action is None:
            print("Bunday band yo'q.")
            continue
        try:
            action()
        except ValueError as exc:
            print(f"❌ {exc}")
        except (EOFError, KeyboardInterrupt):
            print()
            break
    print("Xayr!")


if __name__ == "__main__":
    main()
