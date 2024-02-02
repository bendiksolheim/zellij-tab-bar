import { debug, write } from "./log";
import { ZellijPlugin, registerPlugin } from "./zellij-plugin";
export { load, render, update, plugin_version } from "./zellij-plugin";
import { command, plugin_permission } from "./proto/plugin_command";
import { event } from "./proto/event";
import { requestPermission, subscribe } from "./shim";
import { JSON } from "json-as/assembly";

export function add(a: i32, b: i32): i32 {
  return a + b;
}

class StatusBar implements ZellijPlugin {
  sessionName: string | null = null;
  tabInfo: event.TabInfo[] = [];

  load(configuration: Map<string, string>): void {
    requestPermission([plugin_permission.PermissionType.ReadApplicationState]);
    subscribe([event.EventType.TabUpdate]);
  }

  update(ev: event.Event): bool {
    debug(`Event: ${ev.name}`);
    switch (ev.name) {
      case event.EventType.TabUpdate:
        this.tabInfo = ev.tab_update_payload!.tab_info;
        return true;
      case event.EventType.ModeUpdate:
        debug(
          ifNotNull<event.ModeUpdatePayload, string>(
            ev.mode_update_payload,
            (v) => v.session_name,
          ) || "",
        );
        this.sessionName = ifNotNull<event.ModeUpdatePayload, string>(
          ev.mode_update_payload,
          (v) => v.session_name,
        );
        return true;
      default:
        return false;
    }
  }

  render(rows: i32, cols: i32): void {
    let output: string =
      (this.sessionName || "") +
      " " +
      this.tabInfo
        .map((tab: event.TabInfo): string => {
          return `${tab.position} ${tab.name}`;
        })
        .join(" ");
    write(output);
  }
}

function ifNotNull<T, U>(value: T | null, fn: (v: T) => U): U | null {
  if (value !== null) {
    return fn(value);
  } else {
    return null;
  }
}

registerPlugin(new StatusBar());
