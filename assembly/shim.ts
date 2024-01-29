import { Console } from "as-wasi/assembly";
import { JSON } from "json-as";
import { PluginCommand, CommandName } from "./plugin-command";
import { hostRunPluginCommand } from "./zellij";
import { EventType } from "./event";

export function subscribe(eventTypes: Array<EventType>): void {
  const payload: PluginCommand = {
    name: CommandName.Subscribe,
    payload: {
      subscriptions: eventTypes,
    },
  };

  Console.write(JSON.stringify<PluginCommand>(payload));
  hostRunPluginCommand();
}
