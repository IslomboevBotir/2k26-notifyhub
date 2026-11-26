from __future__ import annotations

import sys

from core.hub import NotifyHub
from notifications.base import DeliveryReport

MENU = """
========= NotifyHub =========
1. Bildirishnoma yuborish
2. Tarix
3. Statistika
4. Tarqatma shablonlari
0. Chiqish"""


def ask(prompt: str) -> str:
    return input(prompt).encode("utf-8", "replace").decode("utf-8").strip()


def ask_choice(label: str, options: tuple[str, ...]) -> str:
    prompt = f"{label} ({' / '.join(options)}): "
    while True:
        value = ask(prompt).lower()
        if value in options:
            return value
        print(f"Noto'g'ri qiymat. Tanlang: {', '.join(options)}")


def ask_recipient(hub: NotifyHub, prompt: str, *, optional: bool = False) -> str | None:
    while True:
        value = ask(prompt)
        if optional and not value:
            return None
        if hub.has_recipient(value):
            return value
        print(f"Topilmadi. Mavjudlari: {', '.join(hub.recipient_names())}")


def ask_text() -> str:
    while True:
        value = ask("Matn: ")
        if value:
            return value
        print("Matn bo'sh bo'lishi mumkin emas.")


def ask_extras(hub: NotifyHub) -> list[str]:
    prompt = f"Qo'shimchalar ({', '.join(hub.extras)}): "
    while True:
        chosen = [part.strip().lower() for part in ask(prompt).split(",") if part.strip()]
        unknown = [name for name in chosen if name not in hub.extras]
        if not unknown:
            return chosen
        print(f"Noma'lum: {', '.join(unknown)}. Bo'sh qoldirish ham mumkin.")


def print_report(report: DeliveryReport) -> None:
    if report.total == 0:
        print("⚠️ Guruhda qabul qiluvchilar yo'q.")
        return
    if report.sent == report.total:
        mark = "✅"
    elif report.sent:
        mark = "⚠️"
    else:
        mark = "❌"
    print(f"{mark} Yuborildi: {report.total} tadan {report.sent} tasi")
    if report.failed:
        print(f"   Yetkazilmadi: {', '.join(report.failed)}")


def send_flow(hub: NotifyHub) -> None:
    kind = ask_choice("Tur", hub.kinds)
    locale = ask_choice("Til", hub.locales)
    channel = ask_choice("Kanal", hub.channels)
    recipient = ask_recipient(hub, "Qabul qiluvchi (ism yoki guruh): ")
    text = ask_text()
    extras = ask_extras(hub)
    print()
    print_report(hub.send(kind, locale, channel, recipient, text, extras))


def templates_flow(hub: NotifyHub) -> None:
    print("\n--- Tarqatma shablonlari ---")
    hub.show_templates()
    print("0. Orqaga")

    while True:
        value = ask("Shablon raqami: ")
        if value == "0":
            return
        if value.isascii() and value.isdigit() and 1 <= int(value) <= hub.template_count:
            number = int(value)
            break
        print("Ro'yxatdagi raqamni kiriting.")

    text = ask("Yangi matn (Enter: o'zgarishsiz): ") or None
    recipient = ask_recipient(
        hub,
        "Yangi qabul qiluvchi (Enter: o'zgarishsiz): ",
        optional=True,
    )
    print()
    print_report(hub.send_from_template(number, text=text, recipient=recipient))


def run(hub: NotifyHub) -> None:
    actions = {
        "1": lambda: send_flow(hub),
        "2": hub.show_history,
        "3": hub.show_stats,
        "4": lambda: templates_flow(hub),
    }
    while True:
        print(MENU)
        choice = ask("> ")
        if choice == "0":
            print("Xayr!")
            return
        action = actions.get(choice)
        if action is None:
            print("Menyudagi raqamni tanlang.")
            continue
        action()


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    try:
        run(NotifyHub())
    except (EOFError, KeyboardInterrupt):
        print("\nXayr!")


if __name__ == "__main__":
    main()
