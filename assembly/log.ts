import { Console } from "as-wasi/assembly";

export function write(s: string): void {
  Console.write(s, false);
}

export function debug(s: string): void {
  Console.error(s);
}

export function readLine(): string {
  return Console.readLine() || "";
}
