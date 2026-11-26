"""Har bir pattern uchun testlar.  Ishga tushirish:  cd notifyhub && python -m unittest -v"""

import io
import os
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from channels.base import Channel  # noqa: E402
from channels.factory import ChannelFactory  # noqa: E402
from channels.file import FileChannel  # noqa: E402
from channels.sms_adapter import LegacySmsGateway, SmsChannelAdapter  # noqa: E402
from channels.telegram import TelegramChannel  # noqa: E402
from core.builder import NotificationBuilder  # noqa: E402
from core.history import NotificationHistory  # noqa: E402
from core.hub import NotifyHub, demo_directory  # noqa: E402
from decorators.message_decorators import (  # noqa: E402
    EncryptDecorator, PlainMessage, SignatureDecorator, TimestampDecorator, UrgentDecorator,
    apply_decorators,
)
from locales.factories import EnFactory, RuFactory, UzFactory  # noqa: E402
from notifications.types import AlertNotification, ReminderNotification  # noqa: E402
from recipients.recipients import Group, User  # noqa: E402


class SpyChannel(Channel):
    name = "spy"

    def __init__(self, ok: bool = True) -> None:
        self.calls = []
        self.ok = ok

    def send(self, recipient, text, kind="alert"):
        self.calls.append((recipient.name, text, kind))
        return self.ok


def quiet(fn, *args, **kwargs):
    with redirect_stdout(io.StringIO()):
        return fn(*args, **kwargs)


class Base(unittest.TestCase):
    def setUp(self):
        NotificationHistory().reset()


class BridgeTest(Base):
    def test_any_notification_with_any_channel(self):
        spy = SpyChannel()
        AlertNotification(spy, UzFactory()).send(User("Ali"), "Server ishlamayapti")
        ReminderNotification(spy, UzFactory()).send(User("Vali"), "Dars")
        self.assertEqual(spy.calls[0], ("Ali", "⚠️ DIQQAT: Server ishlamayapti", "alert"))
        self.assertEqual(spy.calls[1][2], "reminder")

    def test_new_channel_needs_no_notification_change(self):
        class PigeonChannel(Channel):
            name = "pigeon"

            def send(self, recipient, text, kind="alert"):
                return True

        result = AlertNotification(PigeonChannel(), EnFactory()).send(User("Ali"), "x")
        self.assertEqual((result.sent, result.total), (1, 1))


class AbstractFactoryTest(unittest.TestCase):
    def test_example_from_task(self):
        self.assertEqual(UzFactory().create_alert_template().render("Server ishlamayapti"),
                         "⚠️ DIQQAT: Server ishlamayapti")

    def test_families_do_not_mix(self):
        for factory, word in ((UzFactory(), "Eslatma"), (RuFactory(), "Напоминание"), (EnFactory(), "Reminder")):
            spy = SpyChannel()
            ReminderNotification(spy, factory).send(User("A"), "t")
            self.assertTrue(spy.calls[0][1].startswith(word))


class DecoratorTest(unittest.TestCase):
    clock = staticmethod(lambda: datetime(2026, 11, 7, 15, 30))

    def test_order_from_task(self):
        msg = SignatureDecorator(TimestampDecorator(PlainMessage("Dars ko'chirildi"), clock=self.clock))
        self.assertEqual(msg.render(), "Dars ko'chirildi [07.11.2026 15:30] — NotifyHub")

    def test_order_matters_and_stacks(self):
        a = UrgentDecorator(SignatureDecorator(PlainMessage("x"))).render()
        b = SignatureDecorator(UrgentDecorator(PlainMessage("x"))).render()
        self.assertEqual(a, "🔴 X — NOTIFYHUB")
        self.assertEqual(b, "🔴 X — NotifyHub")
        self.assertEqual(SignatureDecorator(SignatureDecorator(PlainMessage("x"))).render(),
                         "x — NotifyHub — NotifyHub")

    def test_encrypt_roundtrip(self):
        enc = EncryptDecorator(PlainMessage("Maxfiy: parol 1234")).render()
        self.assertNotIn("parol", enc)
        self.assertEqual(EncryptDecorator.decrypt(enc), "Maxfiy: parol 1234")

    def test_unknown_decorator(self):
        with self.assertRaises(ValueError):
            apply_decorators(PlainMessage("x"), ["glitter"])


class AdapterTest(Base):
    class FakeGateway(LegacySmsGateway):
        def __init__(self, code=200):
            self.code, self.args = code, None

        def send_sms(self, phone, payload, priority_code):
            self.args = (phone, payload, priority_code)
            return self.code

    def test_converts_text_kind_and_code(self):
        gw = self.FakeGateway()
        ok = SmsChannelAdapter(gw).send(User("A", phone="+998901112233"), "Salom", "reminder")
        self.assertTrue(ok)
        self.assertEqual(gw.args, ("+998901112233", "Salom".encode(), 2))

    def test_priorities(self):
        for kind, code in (("alert", 1), ("reminder", 2), ("promo", 3)):
            gw = self.FakeGateway()
            SmsChannelAdapter(gw).send(User("A", phone="+998901112233"), "x", kind)
            self.assertEqual(gw.args[2], code)

    def test_400_becomes_false(self):
        ok = quiet(SmsChannelAdapter(self.FakeGateway(400)).send, User("A", phone="+1"), "x")
        self.assertFalse(ok)

    def test_real_gateway_rejects_bad_phone(self):
        self.assertFalse(quiet(SmsChannelAdapter().send, User("A", phone="90-123"), "x"))
        self.assertFalse(quiet(SmsChannelAdapter().send, User("A"), "x"))


class SingletonTest(Base):
    def test_same_instance(self):
        self.assertIs(NotificationHistory(), NotificationHistory())

    def test_stats_count_success_and_failures(self):
        AlertNotification(SpyChannel(), UzFactory()).send(Group("g", [User("A"), User("B")]), "x")
        quiet(AlertNotification(TelegramChannel(), UzFactory()).send, User("C"), "x")
        s = NotificationHistory().stats()
        self.assertEqual(s.total_sent, 2)
        self.assertEqual(s.by_channel["spy"], 2)
        self.assertEqual(s.by_kind["alert"], 2)
        self.assertEqual(s.failures, 1)


class CompositeTest(Base):
    def test_nested_groups_reach_each_user_once(self):
        ali = User("Ali")
        g = Group("3-kurs", [Group("301", [ali, User("Vali")]), Group("302", [User("Hasan"), ali])])
        self.assertEqual([u.name for u in g.users()], ["Ali", "Vali", "Hasan"])

    def test_empty_group(self):
        result = AlertNotification(SpyChannel(), UzFactory()).send(Group("bo'sh"), "x")
        self.assertEqual((result.sent, result.total), (0, 0))
        self.assertFalse(result.ok)


class BuilderAndPrototypeTest(Base):
    def test_builder_example(self):
        group = demo_directory()["301-guruh"]
        d = (NotificationBuilder().type("alert").locale("uz").channel("sms").to(group)
             .text("Imtihon").with_signature().build())
        self.assertEqual(d.preview(), "⚠️ DIQQAT: Imtihon — NotifyHub")
        self.assertEqual(quiet(d.send).sent, 2)

    def test_builder_validates(self):
        with self.assertRaises(ValueError):
            NotificationBuilder().type("alert").channel("sms").text("x").build()
        with self.assertRaises(ValueError):
            NotificationBuilder().type("alert").channel("sms").to(User("A")).text("  ").build()
        with self.assertRaises(ValueError):
            NotificationBuilder().type("alert").channel("fax").to(User("A")).text("x").build()

    def test_clone_does_not_touch_original(self):
        original = (NotificationBuilder().type("reminder").channel("console").to(User("A"))
                    .text("Haftalik").with_timestamp().build())
        twin = original.clone(text="Yangi", recipient=User("B"))
        twin.decorators.append("urgent")
        self.assertEqual(original.text, "Haftalik")
        self.assertEqual(original.recipient.name, "A")
        self.assertEqual(original.decorators, ["timestamp"])


class FactoryMethodTest(unittest.TestCase):
    def test_create_by_name(self):
        self.assertIsInstance(ChannelFactory.create("Telegram"), TelegramChannel)
        self.assertIsInstance(ChannelFactory.create("sms"), SmsChannelAdapter)
        with self.assertRaises(ValueError):
            ChannelFactory.create("fax")


class FacadeTest(Base):
    def test_end_to_end_sms_to_course(self):
        hub = NotifyHub()
        out = io.StringIO()
        with redirect_stdout(out):
            result = hub.send("reminder", "uz", "sms", "3-kurs", "Ertaga imtihon", ["signature"])
        # Zarina'ning raqami noto'g'ri -> 4 tadan 3 tasi
        self.assertEqual((result.sent, result.total), (3, 4))
        self.assertIn("[SMS → +998901112233] Eslatma: Ertaga imtihon — NotifyHub", out.getvalue())
        stats = hub.show_stats()
        self.assertIn("Jami yuborilgan: 3", stats)
        self.assertIn("sms: 3", stats)
        self.assertIn("Xatolar: 1", stats)

    def test_file_channel_writes(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "out.log")
            quiet(AlertNotification(FileChannel(path), UzFactory()).send, User("Ali"), "x")
            self.assertIn("[File → Ali] ⚠️ DIQQAT: x", Path(path).read_text(encoding="utf-8"))

    def test_templates_send(self):
        hub = NotifyHub()
        result = quiet(hub.send_template, "Haftalik eslatma", text="Boshqa matn", recipient="301-guruh")
        self.assertEqual((result.sent, result.total), (2, 2))
        self.assertIn("Haftalik hisobotni", hub.preview_template("Haftalik eslatma"))

    def test_unknown_recipient(self):
        with self.assertRaises(ValueError):
            NotifyHub().send("alert", "uz", "console", "Nobody", "x")


if __name__ == "__main__":
    unittest.main()
