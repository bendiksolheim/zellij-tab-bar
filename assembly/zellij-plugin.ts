import { JSON } from "json-as/assembly";
import { debug, readLine } from "./log";
import { event, action } from "./proto/event";

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
  const configuration = action.PluginConfiguration.decode(readBytesFromStdIn());
  const configurationMap = configuration.name_and_value.reduce(
    (
      map: Map<string, string>,
      entry: action.NameAndValue,
    ): Map<string, string> => map.set(entry.name, entry.value),
    new Map<string, string>(),
  );

  if (STATE !== null) {
    STATE!.load(configurationMap);
  }
}

export function update(): bool {
  const ev = event.Event.decode(readBytesFromStdIn());
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

@inline function readBytesFromStdIn(): ArrayBuffer {
  const line = readLine();
  const bytes = JSON.parse<u8[]>(line);
  const typedArray = new Uint8Array(bytes.length);
  typedArray.set(bytes);
  return typedArray.buffer;
}
