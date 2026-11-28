import type { Channel } from "./channel.ts";
import type { NotificationType } from "../notifications/base.ts";

// Tashqi, eski SMS shlyuzi: uning interfeysini Adapter emas, o'zgartirmay ishlatamiz.
export class LegacySmsGateway {
  send_sms(phone: string, payload: Buffer, priority_code: number): number {
    if (!/^\+?\d{9,15}$/.test(phone)) {
      return 400;
    }

    console.log(
      `[SMS -> ${phone}] ${payload.toString("utf8")} (ustuvorlik: ${priority_code})`,
    );
    return 200;
  }
}

// Adapter: Channel interfeysini eski shlyuzning send_sms interfeysiga moslaydi.
export class SmsChannelAdapter implements Channel {
  readonly name = "sms";
  private readonly gateway: LegacySmsGateway;

  constructor(gateway = new LegacySmsGateway()) {
    this.gateway = gateway;
  }

  send(recipient: string, text: string, type: NotificationType): boolean {
    const priorityCodes: Record<NotificationType, number> = {
      alert: 1,
      reminder: 2,
      promo: 3,
    };

    return this.gateway.send_sms(
      recipient,
      Buffer.from(text, "utf8"),
      priorityCodes[type],
    ) === 200;
  }
}
