/**
 * @file decorators/message.interface.ts
 * @pattern Decorator Pattern - Component
 * @description
 * Decorator patternidagi asosiy "Component" interfeysi.
 * Oddiy xabar ham, dekoratorlar bilan o'ralgan xabar ham
 * ushbu interfeysni amalga oshiradi.
 */

export interface IMessage {
  /**
   * Xabarning yakuniy matnini qaytaradi
   */
  getContent(): string;
}
