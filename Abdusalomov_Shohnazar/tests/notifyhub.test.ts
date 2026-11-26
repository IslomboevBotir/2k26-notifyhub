/**
 * @file tests/notifyhub.test.ts
 * @description
 * NotifyHub tizimidagi barcha 5 ta majburiy va 5 ta bonus patternlarni,
 * shuningdek biznes mantiqini tekshiruvchi to'liq avtomatlashtirilgan test to'plami.
 */

import * as assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import * as process from 'node:process';

// Core
import { NotificationHistory } from '../src/core/history.singleton.ts';
import { NotificationBuilder } from '../src/core/notification.builder.ts';
import { NotifyHub } from '../src/core/hub.facade.ts';

// Notifications (Bridge Abstraction)
import { AlertNotification, ReminderNotification, PromoNotification } from '../src/notifications/notification.types.ts';

// Channels (Bridge Implementor & Adapter)
import { ConsoleChannel } from '../src/channels/console.channel.ts';
import { TelegramChannel } from '../src/channels/telegram.channel.ts';
import { SmsChannelAdapter } from '../src/channels/sms-adapter.channel.ts';
import { LegacySmsGateway } from '../src/channels/legacy-sms-gateway.ts';
import { ChannelFactory } from '../src/channels/channel.factory.ts';

// Locales (Abstract Factory)
import { UzLocaleFactory } from '../src/locales/uz.factory.ts';
import { RuLocaleFactory } from '../src/locales/ru.factory.ts';
import { EnLocaleFactory } from '../src/locales/en.factory.ts';
import { LocaleProvider } from '../src/locales/locale-provider.ts';

// Decorators
import { BaseMessage } from '../src/decorators/base-message.ts';
import { TimestampDecorator } from '../src/decorators/timestamp.decorator.ts';
import { SignatureDecorator } from '../src/decorators/signature.decorator.ts';
import { EncryptDecorator } from '../src/decorators/encrypt.decorator.ts';
import { UrgentDecorator } from '../src/decorators/urgent.decorator.ts';

// Recipients (Composite)
import { User } from '../src/recipients/user.ts';
import { Group } from '../src/recipients/group.ts';

// Prototypes
import { CampaignTemplate } from '../src/prototypes/campaign-template.prototype.ts';

async function runAllTests(): Promise<void> {
  console.log('🧪 ================= NotifyHub Test Suitasi =================\n');
  let passedTests = 0;

  function test(description: string, fn: () => void): void {
    try {
      fn();
      console.log(`  ✅ [PASS] ${description}`);
      passedTests++;
    } catch (error) {
      console.error(`  ❌ [FAIL] ${description}`);
      console.error(error);
      process.exit(1);
    }
  }

  // Tarixni har testdan oldin tozalab olamiz
  NotificationHistory.getInstance().clear();

  // ==========================================
  // 1. PATTERN: SINGLETON
  // ==========================================
  console.log('📌 1. Singleton Pattern Testlari (NotificationHistory):');
  test('NotificationHistory yagona instansiyaga ega bo\'lishi shart', () => {
    const inst1 = NotificationHistory.getInstance();
    const inst2 = NotificationHistory.getInstance();
    assert.strictEqual(inst1, inst2, 'Ikkala nusxa bitta xotira manziliga ishora qilishi kerak');
  });

  test('Tarix va statistika to\'g\'ri hisoblanishi kerak', () => {
    const history = NotificationHistory.getInstance();
    history.clear();

    history.record({
      notificationType: 'alert',
      channel: 'sms',
      recipientName: 'Ali',
      recipientContact: '+998901112233',
      originalText: 'Test',
      renderedText: '⚠️ DIQQAT: Test',
      success: true,
    });

    history.record({
      notificationType: 'reminder',
      channel: 'telegram',
      recipientName: 'Vali',
      recipientContact: '@vali',
      originalText: 'Test 2',
      renderedText: 'Eslatma: Test 2',
      success: false,
      errorMessage: 'Tarmoq xatosi',
    });

    const stats = history.getStatistics();
    assert.strictEqual(stats.totalSent, 2);
    assert.strictEqual(stats.successful, 1);
    assert.strictEqual(stats.failed, 1);
    assert.strictEqual(stats.byChannel.sms, 1);
    assert.strictEqual(stats.byChannel.telegram, 1);
    assert.strictEqual(stats.byType.alert, 1);
    assert.strictEqual(stats.byType.reminder, 1);
  });

  // ==========================================
  // 2. PATTERN: ABSTRACT FACTORY
  // ==========================================
  console.log('\n📌 2. Abstract Factory Pattern Testlari (LocaleFactory):');
  test('O\'zbek tili fabrikasi barcha shablonlarni to\'g\'ri yaratadi', () => {
    const factory = new UzLocaleFactory();
    assert.strictEqual(factory.createAlertTemplate().render('Xatolik'), '⚠️ DIQQAT: Xatolik');
    assert.strictEqual(factory.createReminderTemplate().render('Dars'), 'Eslatma: Dars');
    assert.strictEqual(factory.createPromoTemplate().render('Chegirma'), '🎉 Aksiya: Chegirma');
  });

  test('Rus tili fabrikasi barcha shablonlarni to\'g\'ri yaratadi', () => {
    const factory = new RuLocaleFactory();
    assert.strictEqual(factory.createAlertTemplate().render('Ошибка'), '⚠️ ВНИМАНИЕ: Ошибка');
    assert.strictEqual(factory.createReminderTemplate().render('Урок'), 'Напоминание: Урок');
    assert.strictEqual(factory.createPromoTemplate().render('Скидка'), '🎉 Акция: Скидка');
  });

  test('Ingliz tili fabrikasi barcha shablonlarni to\'g\'ri yaratadi', () => {
    const factory = new EnLocaleFactory();
    assert.strictEqual(factory.createAlertTemplate().render('Error'), '⚠️ ALERT: Error');
    assert.strictEqual(factory.createReminderTemplate().render('Lesson'), 'Reminder: Lesson');
    assert.strictEqual(factory.createPromoTemplate().render('Discount'), '🎉 Promo: Discount');
  });

  test('LocaleProvider to\'g\'ri fabrikani qaytaradi', () => {
    assert.ok(LocaleProvider.getFactory('uz') instanceof UzLocaleFactory);
    assert.ok(LocaleProvider.getFactory('ru') instanceof RuLocaleFactory);
    assert.ok(LocaleProvider.getFactory('en') instanceof EnLocaleFactory);
  });

  // ==========================================
  // 3. PATTERN: DECORATOR
  // ==========================================
  console.log('\n📌 3. Decorator Pattern Testlari:');
  test('BaseMessage asl matnni qaytarishi kerak', () => {
    const base = new BaseMessage('Salom Dunyo');
    assert.strictEqual(base.getContent(), 'Salom Dunyo');
  });

  test('SignatureDecorator imzo qo\'shishi kerak', () => {
    const msg = new SignatureDecorator(new BaseMessage('Xabar'));
    assert.strictEqual(msg.getContent(), 'Xabar — NotifyHub');
  });

  test('UrgentDecorator matnni KATTA HARFLARGA o\'tkazishi va 🔴 qo\'shishi kerak', () => {
    const msg = new UrgentDecorator(new BaseMessage('xavf'));
    assert.strictEqual(msg.getContent(), '🔴 XAVF');
  });

  test('TimestampDecorator belgilangan sanani to\'g\'ri formatlab qo\'shishi kerak', () => {
    const fixedDate = new Date(2026, 10, 7, 15, 30); // 07.11.2026 15:30
    const msg = new TimestampDecorator(new BaseMessage('Dars'), fixedDate);
    assert.strictEqual(msg.getContent(), 'Dars [07.11.2026 15:30]');
  });

  test('EncryptDecorator Base64 va Caesar algoritmlarini to\'g\'ri bajarishi kerak', () => {
    const msgBase64 = new EncryptDecorator(new BaseMessage('maxfiy'), 'base64');
    assert.strictEqual(msgBase64.getContent(), Buffer.from('maxfiy').toString('base64'));

    // Sezar shifri (Lotin va Kirill)
    const msgCaesar = new EncryptDecorator(new BaseMessage('abc XYZ'), 'caesar', 3);
    assert.strictEqual(msgCaesar.getContent(), 'def ABC');
  });

  test('Dekoratorlar zanjiri istalgan tartibda ishlashi kerak', () => {
    const fixedDate = new Date(2026, 10, 7, 15, 30);
    const decorated = new SignatureDecorator(
      new TimestampDecorator(new BaseMessage('Dars ko\'chirildi'), fixedDate)
    );
    assert.strictEqual(
      decorated.getContent(),
      'Dars ko\'chirildi [07.11.2026 15:30] — NotifyHub'
    );
  });

  // ==========================================
  // 4. PATTERN: ADAPTER
  // ==========================================
  console.log('\n📌 4. Adapter Pattern Testlari (LegacySmsGateway & SmsChannelAdapter):');
  test('LegacySmsGateway to\'g\'ri parametrlar berilganda 200, xatoda 400 qaytarishi kerak', () => {
    const legacy = new LegacySmsGateway();
    const payload = Buffer.from('Test SMS', 'utf-8');
    assert.strictEqual(legacy.sendSms('+998901234567', payload, 1), 200);
    assert.strictEqual(legacy.send_sms('+998901234567', payload, 1), 200);
    assert.strictEqual(legacy.sendSms('', payload, 1), 400);
    assert.strictEqual(legacy.sendSms('+998901234567', Buffer.alloc(0), 1), 400);
  });

  test('SmsChannelAdapter IChannel interfeysiga moslashib, boolean natija qaytarishi kerak', () => {
    const adapter = new SmsChannelAdapter();
    const user = new User('Ali', '+998901112233');

    const alertResult = adapter.send(user, 'Test Alert', 'alert');
    assert.strictEqual(alertResult, true);

    const invalidUser = new User('Noma\'lum', '');
    const failResult = adapter.send(invalidUser, 'Test Fail', 'promo');
    assert.strictEqual(failResult, false);
  });

  // ==========================================
  // 5. PATTERN: BRIDGE
  // ==========================================
  console.log('\n📌 5. Bridge Pattern Testlari (Notification x Channel):');
  test('Istalgan bildirishnoma turi istalgan kanal orqali yuborilishi mumkin', () => {
    const consoleChannel = new ConsoleChannel();
    const telegramChannel = new TelegramChannel();
    const user = new User('Ali', '+998901112233');

    const alertOnConsole = new AlertNotification(consoleChannel);
    const result1 = alertOnConsole.send(user, 'Server to\'xtadi', 'uz');
    assert.strictEqual(result1.sent, 1);
    assert.strictEqual(result1.finalContent, '⚠️ DIQQAT: Server to\'xtadi');

    alertOnConsole.setChannel(telegramChannel);
    const result2 = alertOnConsole.send(user, 'Server qayta ishga tushdi', 'en');
    assert.strictEqual(result2.sent, 1);
    assert.strictEqual(result2.finalContent, '⚠️ ALERT: Server qayta ishga tushdi');
  });

  // ==========================================
  // 6. PATTERN: COMPOSITE (Bonus)
  // ==========================================
  console.log('\n📌 6. Composite Pattern Testlari (Recipients: User & Group):');
  test('Guruh ichidagi guruhlar va foydalanuvchilar rekursiv olinishi kerak', () => {
    const ali = new User('Ali', '+998901112233');
    const vali = new User('Vali', '+998907778899');
    const olim = new User('Olim', '+998901234567');

    const group301 = new Group('301-guruh', [ali, vali]);
    const group302 = new Group('302-guruh', [olim]);
    const course3 = new Group('3-kurs', [group301, group302]);

    const subscribers = course3.getSubscribers();
    assert.strictEqual(subscribers.length, 3);
    assert.strictEqual(subscribers[0]?.getName(), 'Ali');
    assert.strictEqual(subscribers[1]?.getName(), 'Vali');
    assert.strictEqual(subscribers[2]?.getName(), 'Olim');
  });

  // ==========================================
  // 7. PATTERN: BUILDER (Bonus)
  // ==========================================
  console.log('\n📌 7. Builder Pattern Testlari:');
  test('NotificationBuilder parametrlarni bosqichma-bosqich yig\'ib yuborishi kerak', () => {
    const user = new User('Ali', '+998901112233');
    const builder = new NotificationBuilder()
      .setType('reminder')
      .setLocale('uz')
      .setChannel('console')
      .setTo(user)
      .setText('Ertaga dars')
      .withTimestamp()
      .withSignature();

    const result = builder.send();
    assert.strictEqual(result.sent, 1);
    assert.ok(result.finalContent.includes('Eslatma: Ertaga dars'));
    assert.ok(result.finalContent.includes('— NotifyHub'));
  });

  test('NotificationBuilder.build().send() ham ishlashi kerak', () => {
    const user = new User('Ali', '+998901112233');
    const built = new NotificationBuilder()
      .setType('alert')
      .setLocale('uz')
      .setChannel('console')
      .setTo(user)
      .setText('Tizim xatosi')
      .build();

    const result = built.send();
    assert.strictEqual(result.sent, 1);
    assert.strictEqual(result.finalContent, '⚠️ DIQQAT: Tizim xatosi');
  });

  // ==========================================
  // 8. PATTERN: PROTOTYPE (Bonus)
  // ==========================================
  console.log('\n📌 8. Prototype Pattern Testlari:');
  test('CampaignTemplate.clone() mustaqil chuqur nusxa yaratishi kerak', () => {
    const original = new CampaignTemplate({
      id: 'proto-1',
      name: 'Eslatma Shablon',
      type: 'reminder',
      locale: 'uz',
      channelType: 'console',
      text: 'Boshlang\'ich matn',
      decorators: ['timestamp'],
    });

    const cloned = original.clone();
    cloned.setText('O\'zgartirilgan matn');
    cloned.decorators.push('signature');

    assert.strictEqual(original.text, 'Boshlang\'ich matn', 'Asl nusxa matni o\'zgarmasligi kerak');
    assert.strictEqual(original.decorators.length, 1, 'Asl nusxa dekoratorlari o\'zgarmasligi kerak');
    assert.strictEqual(cloned.text, 'O\'zgartirilgan matn');
    assert.strictEqual(cloned.decorators.length, 2);
  });

  // ==========================================
  // 9. PATTERN: FACADE (Bonus)
  // ==========================================
  console.log('\n📌 9. Facade Pattern Testlari (NotifyHub):');
  test('NotifyHub barcha quyi tizimlarni bitta sodda interfeys bilan boshqarishi kerak', () => {
    const hub = new NotifyHub();
    const group = hub.getRecipients().find('3-kurs');
    assert.ok(group, '3-kurs guruhi mavjud bo\'lishi kerak');

    const sendResult = hub.send({
      type: 'reminder',
      locale: 'uz',
      channel: 'console',
      recipient: group,
      text: 'Imtihon yaqinlashmoqda',
      decorators: ['timestamp', 'signature'],
    });

    assert.strictEqual(sendResult.total, 2);
    assert.strictEqual(sendResult.sent, 2);
    assert.strictEqual(sendResult.failed, 0);
  });

  // ==========================================
  // 10. PATTERN: FACTORY METHOD (Bonus)
  // ==========================================
  console.log('\n📌 10. Factory Method Pattern Testlari (ChannelFactory):');
  test('ChannelFactory barcha turdagi kanallarni to\'g\'ri yaratishi kerak', () => {
    assert.ok(ChannelFactory.create('console') instanceof ConsoleChannel);
    assert.ok(ChannelFactory.create('telegram') instanceof TelegramChannel);
    assert.ok(ChannelFactory.create('sms') instanceof SmsChannelAdapter);
  });

  console.log('\n🎉 ================= Barcha testlar muvaffaqiyatli yakunlandi! =================');
  console.log(`Jami o'tgan testlar: ${passedTests} ta\n`);
}

runAllTests().catch((err) => {
  console.error('Test jarayonida kutilmagan xatolik:', err);
  process.exit(1);
});
