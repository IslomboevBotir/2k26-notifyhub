import type { Channel } from "../channels/channel.ts";
import type { MessageDecoratorType } from "../decorators/message.ts";
import { createDecorator, PlainMessage } from "../decorators/message.ts";
import type { MessageDecorator } from "../decorators/message.ts";
import type { UserRecipient } from "../recipients/recipients.ts";
import type { NotificationTemplate } from "../locales/templates.ts";

export type NotificationType = "alert" | "reminder" | "promo";

// Bridge: tur va kanal bir-biridan mustaqil bo'lib, istalgan kombinatsiyada ishlaydi.
export abstract class Notification {
  abstract readonly type: NotificationType;
  protected readonly channel: Channel;
  private readonly template: NotificationTemplate;

  constructor(
    channel: Channel,
    template: NotificationTemplate,
  ) {
    this.channel = channel;
    this.template = template;
  }

  renderMessage(text: string, decorators: MessageDecoratorType[]): string {
    let message: MessageDecorator = new PlainMessage(this.template.render(text));

    for (const decorator of decorators) {
      message = createDecorator(decorator, message);
    }

    return message.getText();
  }

  send(recipient: UserRecipient, text: string): boolean {
    return this.channel.send(recipient.address, text, this.type);
  }

  get channelName(): string {
    return this.channel.name;
  }
}
