// The entry file of your WebAssembly module.

import { Console } from "as-wasi/assembly";
import { ZellijPlugin, registerPlugin } from "./zellij-plugin";
import { subscribe } from "./shim";
import { CommandName } from "./plugin-command";
export { load, render, update, plugin_version } from "./zellij-plugin";
import { EventType } from "./event";

export function add(a: i32, b: i32): i32 {
  return a + b;
}

class StatusBar implements ZellijPlugin {
  load(configuration: Map<string, string>): void {
    Console.error("load");
    subscribe([EventType.TabUpdate]);
  }

  update(): bool {
    Console.error("update");
    return false;
  }

  render(rows: i32, cols: i32): void {
    Console.error(`rows: ${rows}, cols: ${cols}`);
    Console.write("Hello", false);
  }
}

registerPlugin(new StatusBar());
