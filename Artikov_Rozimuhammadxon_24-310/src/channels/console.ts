import { Channel } from "./base";
import type { User } from "../recipients/recipients";

/** Konsol kanali: Bridge'ning aniq realizatsiyasi (ConcreteImplementor). */
export class ConsoleChannel extends Channel {
  readonly name = "console";

  send(recipient: User, text: string): boolean {
    this.output.write(`[Console → ${recipient.name}] ${text}`);
    return true;
  }
}
