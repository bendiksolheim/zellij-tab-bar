import { hostRunPluginCommand } from "./zellij";
import { write } from "./log";
import { event } from "./proto/event";
import { plugin_command, plugin_permission } from "./proto/plugin_command";
import { JSON } from "json-as/assembly";

export function subscribe(eventTypes: Array<event.EventType>): void {
  const payload: plugin_command.PluginCommand = {
    name: plugin_command.CommandName.Subscribe,
    subscribe_payload: {
      subscriptions: {
        event_types: eventTypes.map((ev: i32) => u32(ev)),
      },
    },
  };

  const bytes = payload.encode();
  const array = Uint8Array.wrap(bytes);
  write(JSON.stringify(array));

  hostRunPluginCommand();
}

export function unsubscribe(eventTypes: Array<event.EventType>): void {
  const payload: plugin_command.PluginCommand = {
    name: plugin_command.CommandName.Unsubscribe,
    unsubscribe_payload: {
      subscriptions: {
        event_types: eventTypes.map((ev: i32) => u32(ev)),
      },
    },
  };

  const bytes = payload.encode();
  const array = Uint8Array.wrap(bytes);
  write(JSON.stringify(array));

  hostRunPluginCommand();
}

export function setSelectable(selectable: bool): void {
  const payload: plugin_command.PluginCommand = {
    name: plugin_command.CommandName.SetSelectable,
    set_selectable_payload: selectable,
  };

  const bytes = payload.encode();
  const array = Uint8Array.wrap(bytes);
  write(JSON.stringify(array));

  hostRunPluginCommand();
}

export function requestPermission(
  permissions: Array<plugin_permission.PermissionType>,
): void {
  const payload: plugin_command.PluginCommand = {
    name: plugin_command.CommandName.RequestPluginPermissions,
    request_plugin_permission_payload: {
      permissions: permissions.map((ev: i32) => u32(ev)),
    },
  };
  const bytes = payload.encode();
  const array = Uint8Array.wrap(bytes);
  write(JSON.stringify(array));

  hostRunPluginCommand();
}
