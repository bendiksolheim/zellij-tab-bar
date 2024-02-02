import { hostRunPluginCommand } from "./zellij";
import { debug, write } from "./log";
import { event } from "./proto/event";
import { plugin_command, plugin_permission } from "./proto/plugin_command";
import { Descriptor } from "as-wasi/assembly";
import { fd_write } from "@assemblyscript/wasi-shim/assembly/bindings/wasi_snapshot_preview1";
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
  // const payload: PluginCommand = {
  //   name: CommandName.Subscribe,
  //   payload: {
  //     subscriptions: eventTypes,
  //   },
  // };

  const bytes: ArrayBuffer = payload.encode();
  const ar = Uint8Array.wrap(bytes);
  // const text = new TextDecoder().decode(ar);
  // write(text);
  // Descriptor.Stdout.writeString(text);
  write(JSON.stringify(ar));
  // debug(`subscribe: ${JSON.stringify(payload).replace("undefined,", "")}`);
  // write(JSON.stringify(payload).replace("undefined,", ""));
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
  const ar = Uint8Array.wrap(bytes);
  // write(text);
  // Descriptor.Stdout.writeString(text);
  write(JSON.stringify(ar));
  // const payload = new plugin_command.PluginCommand(
  //   CommandName.RequestPluginPermissions,
  //   new RequestPluginPermissionPayload(permissions),
  // );
  // const payload: PluginCommand<PermissionPayload> = {
  //   name: CommandName.RequestPluginPermissions,
  //   payload: {
  //     permissions: permissions,
  //   },
  // };

  // debug(
  // `requestPermission: ${JSON.stringify(payload).replace("undefined,", "")}`,
  // );
  // write(JSON.stringify(payload).replace("undefined,", ""));
  hostRunPluginCommand();
}

// function write(data: u8[]): void {
// function write(data: Uint8Array): void {
//   let data_buf_len = data.length;
//   let data_buf_out = changetype<usize>(new ArrayBuffer(data_buf_len));
//   // @ts-ignore: cast
//   let data_buf_in = changetype<ArrayBufferView>(data).dataStart;
//   memory.copy(data_buf_out, data_buf_in, data_buf_len);
//   let iov = memory.data(16);
//   store<u32>(iov, data_buf_out, 0);
//   store<u32>(iov, data_buf_len, sizeof<usize>());
//   let written_ptr = memory.data(8);
//   fd_write(Descriptor.Stdout.rawfd, iov, 1, written_ptr);
// }
