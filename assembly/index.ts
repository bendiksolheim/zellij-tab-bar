import { debug, write } from "./log";
import { ZellijPlugin, registerPlugin } from "./zellij-plugin";
export { load, render, update, plugin_version } from "./zellij-plugin";
import { requestPermission, subscribe } from "./shim";
import { colors, hexBackground, hexForeground } from "./terminal/color";
import { Match, RegExp } from "./regexp";
import { InputMode } from "./proto/input_mode";
import { Event, EventType, TabInfo } from "./proto/event";
import { PermissionType } from "./proto/plugin_permission";

class Tab {
  number: u32;
  name: string;
  active: bool;

  constructor(number: u32, name: string, active: bool) {
    this.number = number;
    this.name = name;
    this.active = active;
  }
}

class Configuration {
  // Info from Zellij
  tabs: Tab[];
  sessionName: string;
  mode: InputMode = 0;

  // Config from layout
  left: string = "";
  tab_normal: string = "";
  tab_active: string = "";

  constructor(config: Map<string, string>) {
    if (config.has("left")) {
      this.left = replaceColors(config.get("left"));
    }
    if (config.has("tab_normal")) {
      this.tab_normal = replaceColors(config.get("tab_normal"));
    }
    if (config.has("tab_active")) {
      this.tab_active = replaceColors(config.get("tab_active"));
    }
    this.sessionName = "";
    this.tabs = [];
  }
}

class StatusBar implements ZellijPlugin {
  config: Configuration = new Configuration(new Map());

  load(configuration: Map<string, string>): void {
    this.config = new Configuration(configuration);
    requestPermission([PermissionType.ReadApplicationState]);
    subscribe([EventType.ModeUpdate, EventType.TabUpdate]);
  }

  update(ev: Event): bool {
    debug(`Event: ${ev.name}`);
    switch (ev.name) {
      case EventType.TabUpdate:
        if (ev.tab_update_payload !== null) {
          this.config.tabs = ev.tab_update_payload!.tab_info.map(
            (tab: TabInfo): Tab =>
              new Tab(tab.position + 1, tab.name, tab.active),
          );
        }
        return true;
      case EventType.ModeUpdate:
        if (ev.mode_update_payload !== null) {
          this.config.mode = ev.mode_update_payload!.current_mode;
          this.config.sessionName = ev.mode_update_payload!.session_name;
        }
        return true;
      default:
        return false;
    }
  }

  render(rows: i32, cols: i32): void {
    const output: string = renderLeft(this.config);
    write(output);
  }
}

function renderLeft(config: Configuration): string {
  const tabs = renderTabs(config);

  return config.left
    .replace("{mode}", inputModeStringValue(config.mode))
    .replace("{session_name}", config.sessionName)
    .replace("{tabs}", tabs);
}

function renderTabs(config: Configuration): string {
  if (config.tabs.length === 0) {
    debug("No tabs, not rendering anything");
    return "";
  }
  let output = "";
  for (let i = 0; i < config.tabs.length; i++) {
    const tab = config.tabs[i];
    output += (tab.active ? config.tab_active : config.tab_normal)
      .replaceAll("{name}", tab.name)
      .replaceAll("{position}", tab.number.toString());
  }
  return output;
}

function replaceColors(input: string): string {
  let output = input;
  // Matches colors on the form: ${bg=#aabbcc,fb=#aabbcc,italic}(text)
  const pattern = new RegExp("\\$\\{(.+?)\\}\\((.+?)\\)", "g");
  let match: Match | null = pattern.exec(input);
  while (match !== null) {
    const modifiers = match.matches[1].split(",");
    let text = match.matches[2];
    for (let i = 0; i < modifiers.length; i++) {
      const modifier = modifiers[i];
      if (modifier.startsWith("bg=")) {
        text = hexBackground(text, modifier.replace("bg=", ""));
      } else if (modifier.startsWith("fg=")) {
        text = hexForeground(text, modifier.replace("fg=", ""));
      }
      if (colors.has(modifier)) {
        text = colors.get(modifier)(text);
      }
    }
    output = output.replace(match.matches[0], text);

    match = pattern.exec(input);
  }
  return output;
}

registerPlugin(new StatusBar());

function inputModeStringValue(mode: InputMode): string {
  switch (mode) {
    case 0:
      return "N";
    case 1:
      return "\uD83D\uDD12";
    case 2:
      return "Resize";
    case 3:
      return "Pane";
    case 4:
      return "→";
    case 5:
      return "\u21c5";
    case 6:
      return "EnterSearch";
    case 7:
      return "Search";
    case 8:
      return "RenameTab";
    case 9:
      return "RenamePane";
    case 10:
      return "Session";
    case 11:
      return "Move";
    case 12:
      return "Prompt";
    case 13:
      return "…";
    default:
      return `Unknown mode ${mode}`;
  }
}
