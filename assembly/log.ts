import { Console } from "as-wasi/assembly";

export function write(s: string): void {
  process.stdout.write(s);
  // Console.write(s, true);
}

export function debug(s: string): void {
  Console.error(s);
}

export function readLine(): string {
  return Console.readLine() || "";
}
