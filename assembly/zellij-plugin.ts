import { JSON } from "json-as/assembly";
import { readLine } from "./log";
import { event } from "./proto/event";
import { Console, Descriptor } from "as-wasi/assembly";

export interface ZellijPlugin {
  load(configuration: Map<string, string>): void;
  update(ev: event.Event): bool;
  render(rows: i32, cols: i32): void;
}

let STATE: ZellijPlugin | null = null;

export function registerPlugin(p: ZellijPlugin): void {
  STATE = p;
}

export function load(): void {
  if (STATE !== null) {
    STATE!.load(new Map());
  }
}

export function update(): bool {
  const text = readLine();
  const bytes = JSON.parse<u8[]>(text);
  const a = changetype<ArrayBufferView>(bytes).buffer;
  const ev: event.Event = event.Event.decode(a);
  if (STATE !== null) {
    return STATE!.update(ev);
  } else {
    return false;
  }
}

export function render(rows: i32, cols: i32): void {
  if (STATE !== null) {
    STATE!.render(rows, cols);
  }
}

export function plugin_version(): void {
  console.log("0.39.2");
}
