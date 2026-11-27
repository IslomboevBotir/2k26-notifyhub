/**
 * Chiqish va fayl muhiti.
 *
 * Kanallar natijani konsolga chiqaradi, fayl kanali esa log-faylga yozadi.
 * Bular interfeys orqali berilgani uchun testlarda ularni xotiradagi
 * analoglar bilan almashtirish mumkin va haqiqiy fayl buzilmaydi.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type OutputLevel = "info" | "success" | "error" | "muted";

export interface OutputPort {
  write(line: string, level?: OutputLevel): void;
}

export interface FileStorage {
  readonly location: string;
  append(line: string): void;
  read(): string;
  clear(): void;
}

export interface Environment {
  output: OutputPort;
  fileStorage: FileStorage;
}

const COLORS: Record<OutputLevel, string> = {
  info: "",
  success: "\x1b[32m",
  error: "\x1b[31m",
  muted: "\x1b[90m",
};
const RESET = "\x1b[0m";

/** Konsolga chiqarish (terminalda rangli). */
export class ConsoleOutput implements OutputPort {
  constructor(private readonly colors = process.stdout.isTTY ?? false) {}

  write(line: string, level: OutputLevel = "info"): void {
    const color = this.colors ? COLORS[level] : "";
    console.log(color ? `${color}${line}${RESET}` : line);
  }
}

/** Diskdagi haqiqiy log-fayl: outbox/notifications.log */
export class DiskFileStorage implements FileStorage {
  private readonly absolutePath: string;

  constructor(readonly location = "outbox/notifications.log") {
    this.absolutePath = resolve(location);
  }

  append(line: string): void {
    mkdirSync(dirname(this.absolutePath), { recursive: true });
    appendFileSync(this.absolutePath, `${line}\n`, "utf8");
  }

  read(): string {
    return existsSync(this.absolutePath) ? readFileSync(this.absolutePath, "utf8") : "";
  }

  clear(): void {
    if (existsSync(this.absolutePath)) writeFileSync(this.absolutePath, "", "utf8");
  }
}

/** Xotiradagi fayl (testlar uchun). */
export class MemoryFileStorage implements FileStorage {
  private lines: string[] = [];

  constructor(readonly location = "outbox/notifications.log") {}

  append(line: string): void {
    this.lines.push(line);
  }

  read(): string {
    return this.lines.join("\n");
  }

  clear(): void {
    this.lines = [];
  }
}

let current: Environment = {
  output: new ConsoleOutput(),
  fileStorage: new DiskFileStorage(),
};

export function getEnvironment(): Environment {
  return current;
}

export function configureEnvironment(changes: Partial<Environment>): void {
  current = { ...current, ...changes };
}
