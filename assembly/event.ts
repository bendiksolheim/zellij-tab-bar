export enum EventType {
  /// The input mode or relevant metadata changed
  ModeUpdate = 0,
  /// The tab state in the app was changed
  TabUpdate = 1,
  /// The pane state in the app was changed
  PaneUpdate = 2,
  /// A key was pressed while the user is focused on this plugin's pane
  Key = 3,
  /// A mouse event happened while the user is focused on this plugin's pane
  Mouse = 4,
  /// A timer expired set by the `set_timeout` method exported by `zellij-tile`.
  Timer = 5,
  /// Text was copied to the clipboard anywhere in the app
  CopyToClipboard = 6,
  /// Failed to copy text to clipboard anywhere in the app
  SystemClipboardFailure = 7,
  /// Input was received anywhere in the app
  InputReceived = 8,
  /// This plugin became visible or invisible
  Visible = 9,
  /// A message from one of the plugin's workers
  CustomMessage = 10,
  /// A file was created somewhere in the Zellij CWD folder
  FileSystemCreate = 11,
  /// A file was accessed somewhere in the Zellij CWD folder
  FileSystemRead = 12,
  /// A file was modified somewhere in the Zellij CWD folder
  FileSystemUpdate = 13,
  /// A file was deleted somewhere in the Zellij CWD folder
  FileSystemDelete = 14,
  PermissionRequestResult = 15,
  SessionUpdate = 16,
  RunCommandResult = 17,
  WebRequestResult = 18,
}
