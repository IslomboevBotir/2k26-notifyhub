/**
 * @file types/node-globals.d.ts
 * @description
 * Node.js global turlari (Buffer, process, console va h.k.) uchun
 * ambient type deklaratsiyalari. Ushbu fayl @types/node o'rnatilmagan
 * yoki oflayn muhitda ham IDE (VS Code) da hech qanday qizil xatoliklar
 * chiqmasligini to'liq kafolatlaydi.
 */

declare global {
  interface Buffer {
    toString(encoding?: string): string;
    readonly length: number;
  }

  const Buffer: {
    from(str: string, encoding?: string): Buffer;
    from(arrayBuffer: ArrayBuffer): Buffer;
    alloc(size: number): Buffer;
  };

  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }

    interface Process {
      stdin: any;
      stdout: any;
      env: ProcessEnv;
      exit(code?: number): never;
      cwd(): string;
    }
  }

  const process: NodeJS.Process;

  interface Console {
    log(...data: any[]): void;
    error(...data: any[]): void;
    warn(...data: any[]): void;
    info(...data: any[]): void;
  }

  const console: Console;
}

export {};
