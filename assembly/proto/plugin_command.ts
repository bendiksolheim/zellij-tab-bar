namespace __proto {
  /**
   * Decoder implements protobuf message decode interface.
   *
   * Useful references:
   *
   * Protocol Buffer encoding: https://developers.google.com/protocol-buffers/docs/encoding
   * LEB128 encoding AKA varint 128 encoding: https://en.wikipedia.org/wiki/LEB128
   * ZigZag encoding/decoding (s32/s64): https://gist.github.com/mfuerstenau/ba870a29e16536fdbaba
   */
  export class Decoder {
    public view: DataView;
    public pos: i32;

    constructor(view: DataView) {
      this.view = view;
      this.pos = 0;
    }

    /**
     * Returns true if current reader has reached the buffer end
     * @returns True if current reader has reached the buffer end
     */
    @inline
    eof(): bool {
      return this.pos >= this.view.byteLength;
    }

    /**
     * Returns current buffer length in bytes
     * @returns Length in bytes
     */
    @inline
    get byteLength(): i32 {
      return this.view.byteLength;
    }

    /**
     * An alias method to fetch tag from the reader. Supposed to return tuple of [field number, wire_type].
     * TODO: Replace with return tuple when tuples become implemented in AS.
     * @returns Message tag value
     */
    @inline
    tag(): u32 {
      return this.uint32();
    }

    /**
     * Returns byte at offset, alias for getUint8
     * @param byteOffset Offset
     * @returns u8
     */
    @inline
    private u8at(byteOffset: i32): u8 {
      return this.view.getUint8(byteOffset);
    }

    /**
     * Reads and returns varint number (128 + 10 bits max) from a current position.
     * @returns Returns varint
     */
    varint(): u64 {
      let value: u64;

      // u32
      value = (u64(u8(this.u8at(this.pos))) & 127) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 7)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 14)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 21)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      // u32 remainder or u64 byte
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 28)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      // u64
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 35)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value =
        (value | ((u64(u8(this.u8at(this.pos))) & 127) << 42)) /* 42!!! */ >>>
        0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 49)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 28)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;
      // u64 remainder
      value = (value | ((u64(u8(this.u8at(this.pos))) & 127) << 35)) >>> 0;
      if (u8(this.u8at(this.pos++)) < 128) return value;

      if (this.pos > this.byteLength) {
        this.throwOutOfRange();
      }

      return value;
    }

    @inline
    int32(): i32 {
      return i32(this.varint());
    }

    @inline
    int64(): i64 {
      return i32(this.varint());
    }

    @inline
    uint32(): u32 {
      return u32(this.varint());
    }

    @inline
    uint64(): u64 {
      return u64(this.varint());
    }

    @inline
    sint32(): i32 {
      const n: u64 = this.varint();
      return i32((n >>> 1) ^ -(n & 1));
    }

    @inline
    sint64(): i64 {
      const n: u64 = this.varint();
      return i64((n >>> 1) ^ -(n & 1));
    }

    fixed32(): u32 {
      this.pos += 4;
      if (this.pos > this.byteLength) {
        this.throwOutOfRange();
      }

      // u32(u8) ensures that u8(-1) becomes u32(4294967295) instead of u8(255)
      return (
        u32(u8(this.u8at(this.pos - 4))) |
        (u32(u8(this.u8at(this.pos - 3))) << 8) |
        (u32(u8(this.u8at(this.pos - 2))) << 16) |
        (u32(u8(this.u8at(this.pos - 1))) << 24)
      );
    }

    @inline
    sfixed32(): i32 {
      return i32(this.fixed32());
    }

    fixed64(): u64 {
      this.pos += 8;
      if (this.pos > this.byteLength) {
        this.throwOutOfRange();
      }

      return (
        u64(u8(this.u8at(this.pos - 8))) |
        (u64(u8(this.u8at(this.pos - 7))) << 8) |
        (u64(u8(this.u8at(this.pos - 6))) << 16) |
        (u64(u8(this.u8at(this.pos - 5))) << 24) |
        (u64(u8(this.u8at(this.pos - 4))) << 32) |
        (u64(u8(this.u8at(this.pos - 3))) << 40) |
        (u64(u8(this.u8at(this.pos - 2))) << 48) |
        (u64(u8(this.u8at(this.pos - 1))) << 56)
      );
    }

    @inline
    sfixed64(): i64 {
      return i64(this.fixed64());
    }

    @inline
    float(): f32 {
      return f32.reinterpret_i32(this.fixed32());
    }

    @inline
    double(): f64 {
      return f64.reinterpret_i64(this.fixed64());
    }

    @inline
    bool(): boolean {
      return this.uint32() > 0;
    }

    /**
     * Reads and returns UTF8 string.
     * @returns String
     */
    string(): string {
      const length = this.uint32();
      if (this.pos + length > this.byteLength) {
        this.throwOutOfRange();
      }

      const p = this.pos + this.view.byteOffset;
      const value = String.UTF8.decode(this.view.buffer.slice(p, p + length));
      this.pos += length;
      return value;
    }

    /**
     * Reads and returns bytes array.
     * @returns Array<u8> of bytes
     */
    bytes(): Array<u8> {
      const len = this.uint32();
      if (this.pos + len > this.byteLength) {
        this.throwOutOfRange();
      }

      const a = new Array<u8>(len);
      for (let i: u32 = 0; i < len; i++) {
        a[i] = u8(this.u8at(this.pos++));
      }

      return a;
    }

    /**
     * Skips a message field if it can'be recognized by an object's decode() method
     * @param wireType Current wire type
     */
    skipType(wireType: u32): void {
      switch (wireType) {
        // int32, int64, uint32, uint64, sint32, sint64, bool, enum: varint, variable length
        case 0:
          this.varint(); // Just read a varint
          break;
        // fixed64, sfixed64, double: 8 bytes always
        case 1:
          this.skip(8);
          break;
        // length-delimited; length is determined by varint32; skip length bytes;
        case 2:
          this.skip(this.uint32());
          break;
        // tart group: skip till the end of the group, then skip group end marker
        case 3:
          while ((wireType = this.uint32() & 7) !== 4) {
            this.skipType(wireType);
          }
          break;
        // fixed32, sfixed32, float: 4 bytes always
        case 5:
          this.skip(4);
          break;

        // Something went beyond our capability to understand
        default:
          throw new Error(
            `Invalid wire type ${wireType} at offset ${this.pos}`,
          );
      }
    }

    /**
     * Fast-forwards cursor by length with boundary check
     * @param length Byte length
     */
    skip(length: u32): void {
      if (this.pos + length > this.byteLength) {
        this.throwOutOfRange();
      }
      this.pos += length;
    }

    /**
     * OutOfRange check. Throws an exception if current position exceeds current buffer range
     */
    @inline
    private throwOutOfRange(): void {
      throw new Error(`Decoder position ${this.pos} is out of range!`);
    }
  }

  /**
   * Encoder implements protobuf message encode interface. This is the simplest not very effective version, which uses
   * Array<u8>.
   *
   * Useful references:
   *
   * Protocol Buffer encoding: https://developers.google.com/protocol-buffers/docs/encoding
   * LEB128 encoding AKA varint 128 encoding: https://en.wikipedia.org/wiki/LEB128
   * ZigZag encoding/decoding (s32/s64): https://gist.github.com/mfuerstenau/ba870a29e16536fdbaba
   */
  export class Encoder {
    public buf: Array<u8>;

    constructor(buf: Array<u8>) {
      this.buf = buf;
    }

    /**
     * Encodes varint at a current position
     * @returns Returns varint
     */
    varint64(value: u64): void {
      let v: u64 = value;

      while (v > 127) {
        this.buf.push(u8((v & 127) | 128));
        v = v >> 7;
      }

      this.buf.push(u8(v));
    }

    @inline
    int32(value: i32): void {
      this.varint64(value);
    }

    @inline
    int64(value: i64): void {
      this.varint64(value);
    }

    @inline
    uint32(value: u32): void {
      this.varint64(value);
    }

    @inline
    uint64(value: u64): void {
      this.varint64(value);
    }

    @inline
    sint32(value: i32): void {
      this.varint64((value << 1) ^ (value >> 31));
    }

    @inline
    sint64(value: i64): void {
      this.varint64((value << 1) ^ (value >> 63));
    }

    @inline
    fixed32(value: u32): void {
      this.buf.push(u8(value & 255));
      this.buf.push(u8((value >> 8) & 255));
      this.buf.push(u8((value >> 16) & 255));
      this.buf.push(u8(value >> 24));
    }

    @inline
    sfixed32(value: i32): void {
      this.fixed32(u32(value));
    }

    @inline
    fixed64(value: u64): void {
      this.buf.push(u8(value & 255));
      this.buf.push(u8((value >> 8) & 255));
      this.buf.push(u8((value >> 16) & 255));
      this.buf.push(u8((value >> 24) & 255));
      this.buf.push(u8((value >> 32) & 255));
      this.buf.push(u8((value >> 40) & 255));
      this.buf.push(u8((value >> 48) & 255));
      this.buf.push(u8(value >> 56));
    }

    @inline
    sfixed64(value: i64): void {
      this.fixed64(u64(value));
    }

    @inline
    float(value: f32): void {
      this.fixed32(u32(i32.reinterpret_f32(value)));
    }

    @inline
    double(value: f64): void {
      this.fixed64(u64(i64.reinterpret_f64(value)));
    }

    @inline
    bool(value: boolean): void {
      this.buf.push(value ? 1 : 0);
    }

    string(value: string): void {
      const utf8string = new DataView(String.UTF8.encode(value));

      for (let i = 0; i < utf8string.byteLength; i++) {
        this.buf.push(utf8string.getUint8(i));
      }
    }

    @inline
    bytes(value: Array<u8>): void {
      for (let i = 0; i < value.length; i++) {
        this.buf.push(value[i]);
      }
    }
  }

  /**
   * Returns byte size required to encode a value of a certain type
   */
  export class Sizer {
    static varint64(value: u64): u32 {
      return value < 128
        ? 1 // 2^7
        : value < 16384
          ? 2 // 2^14
          : value < 2097152
            ? 3 // 2^21
            : value < 268435456
              ? 4 // 2^28
              : value < 34359738368
                ? 5 // 2^35
                : value < 4398046511104
                  ? 6 // 2^42
                  : value < 562949953421312
                    ? 7 // 2^49
                    : value < 72057594037927936
                      ? 8 // 2^56
                      : value < 9223372036854775808
                        ? 9 // 2^63
                        : 10;
    }

    @inline
    static int32(value: i32): u32 {
      return Sizer.varint64(u64(value));
    }

    @inline
    static int64(value: i64): u32 {
      return Sizer.varint64(u64(value));
    }

    @inline
    static uint32(value: u32): u32 {
      return Sizer.varint64(value);
    }

    @inline
    static uint64(value: u64): u32 {
      return Sizer.varint64(value);
    }

    @inline
    static sint32(value: i32): u32 {
      return Sizer.varint64((value << 1) ^ (value >> 31));
    }

    @inline
    static sint64(value: i64): u32 {
      return Sizer.varint64((value << 1) ^ (value >> 63));
    }

    @inline
    static string(value: string): u32 {
      return value.length;
    }

    @inline
    static bytes(value: Array<u8>): u32 {
      return value.length;
    }
  }
}
export namespace input_mode {
  export enum InputMode {
    /**
     * / In `Normal` mode, input is always written to the terminal, except for the shortcuts leading
     * / to other modes
     */
    Normal = 0,
    /**
     * / In `Locked` mode, input is always written to the terminal and all shortcuts are disabled
     * / except the one leading back to normal mode
     */
    Locked = 1,
    // / `Resize` mode allows resizing the different existing panes.
    Resize = 2,
    // / `Pane` mode allows creating and closing panes, as well as moving between them.
    Pane = 3,
    // / `Tab` mode allows creating and closing tabs, as well as moving between them.
    Tab = 4,
    // / `Scroll` mode allows scrolling up and down within a pane.
    Scroll = 5,
    // / `EnterSearch` mode allows for typing in the needle for a search in the scroll buffer of a pane.
    EnterSearch = 6,
    // / `Search` mode allows for searching a term in a pane (superset of `Scroll`).
    Search = 7,
    // / `RenameTab` mode allows assigning a new name to a tab.
    RenameTab = 8,
    // / `RenamePane` mode allows assigning a new name to a pane.
    RenamePane = 9,
    // / `Session` mode allows detaching sessions
    Session = 10,
    // / `Move` mode allows moving the different existing panes within a tab
    Move = 11,
    // / `Prompt` mode allows interacting with active prompts.
    Prompt = 12,
    // / `Tmux` mode allows for basic tmux keybindings functionality
    Tmux = 13,
  } // InputMode
} // input_mode
export namespace resize {
  export enum ResizeAction {
    Increase = 0,
    Decrease = 1,
  } // ResizeAction
  export enum ResizeDirection {
    Left = 0,
    Right = 1,
    Up = 2,
    Down = 3,
  } // ResizeDirection
  export class Resize {
    public resize_action: u32;
    public direction: u32;

    public ___direction: string = "";
    public ___direction_index: u8 = 0;

    static readonly DIRECTION_DIRECTION_INDEX: u8 = 2;

    // Decodes Resize from an ArrayBuffer
    static decode(buf: ArrayBuffer): Resize {
      return Resize.decodeDataView(new DataView(buf));
    }

    // Decodes Resize from a DataView
    static decodeDataView(view: DataView): Resize {
      const decoder = new __proto.Decoder(view);
      const obj = new Resize();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.resize_action = decoder.uint32();
            break;
          }
          case 2: {
            obj.direction = decoder.uint32();
            obj.___direction = "direction";
            obj.___direction_index = 2;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode Resize

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.resize_action == 0
          ? 0
          : 1 + __proto.Sizer.uint32(this.resize_action);
      size +=
        this.direction == 0 ? 0 : 1 + __proto.Sizer.uint32(this.direction);

      return size;
    }

    // Encodes Resize to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Resize to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.resize_action != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.resize_action);
      }
      if (this.direction != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.direction);
      }

      return buf;
    } // encode Resize
  } // Resize

  export class MoveDirection {
    public direction: u32;

    // Decodes MoveDirection from an ArrayBuffer
    static decode(buf: ArrayBuffer): MoveDirection {
      return MoveDirection.decodeDataView(new DataView(buf));
    }

    // Decodes MoveDirection from a DataView
    static decodeDataView(view: DataView): MoveDirection {
      const decoder = new __proto.Decoder(view);
      const obj = new MoveDirection();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.direction = decoder.uint32();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode MoveDirection

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.direction == 0 ? 0 : 1 + __proto.Sizer.uint32(this.direction);

      return size;
    }

    // Encodes MoveDirection to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes MoveDirection to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.direction != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.direction);
      }

      return buf;
    } // encode MoveDirection
  } // MoveDirection
} // resize
export namespace action {
  export class PaneIdAndShouldFloat {
    public pane_id: u32;
    public should_float: bool;

    // Decodes PaneIdAndShouldFloat from an ArrayBuffer
    static decode(buf: ArrayBuffer): PaneIdAndShouldFloat {
      return PaneIdAndShouldFloat.decodeDataView(new DataView(buf));
    }

    // Decodes PaneIdAndShouldFloat from a DataView
    static decodeDataView(view: DataView): PaneIdAndShouldFloat {
      const decoder = new __proto.Decoder(view);
      const obj = new PaneIdAndShouldFloat();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.pane_id = decoder.uint32();
            break;
          }
          case 2: {
            obj.should_float = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode PaneIdAndShouldFloat

    public size(): u32 {
      let size: u32 = 0;

      size += this.pane_id == 0 ? 0 : 1 + __proto.Sizer.uint32(this.pane_id);
      size += this.should_float == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes PaneIdAndShouldFloat to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes PaneIdAndShouldFloat to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.pane_id != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.pane_id);
      }
      if (this.should_float != 0) {
        encoder.uint32(0x10);
        encoder.bool(this.should_float);
      }

      return buf;
    } // encode PaneIdAndShouldFloat
  } // PaneIdAndShouldFloat

  export class SwitchToModePayload {
    public input_mode: u32;

    // Decodes SwitchToModePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): SwitchToModePayload {
      return SwitchToModePayload.decodeDataView(new DataView(buf));
    }

    // Decodes SwitchToModePayload from a DataView
    static decodeDataView(view: DataView): SwitchToModePayload {
      const decoder = new __proto.Decoder(view);
      const obj = new SwitchToModePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.input_mode = decoder.uint32();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode SwitchToModePayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.input_mode == 0 ? 0 : 1 + __proto.Sizer.uint32(this.input_mode);

      return size;
    }

    // Encodes SwitchToModePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes SwitchToModePayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.input_mode != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.input_mode);
      }

      return buf;
    } // encode SwitchToModePayload
  } // SwitchToModePayload
} // action
export namespace event {
  export enum EventType {
    // / The input mode or relevant metadata changed
    ModeUpdate = 0,
    // / The tab state in the app was changed
    TabUpdate = 1,
    // / The pane state in the app was changed
    PaneUpdate = 2,
    // / A key was pressed while the user is focused on this plugin's pane
    Key = 3,
    // / A mouse event happened while the user is focused on this plugin's pane
    Mouse = 4,
    // / A timer expired set by the `set_timeout` method exported by `zellij-tile`.
    Timer = 5,
    // / Text was copied to the clipboard anywhere in the app
    CopyToClipboard = 6,
    // / Failed to copy text to clipboard anywhere in the app
    SystemClipboardFailure = 7,
    // / Input was received anywhere in the app
    InputReceived = 8,
    // / This plugin became visible or invisible
    Visible = 9,
    // / A message from one of the plugin's workers
    CustomMessage = 10,
    // / A file was created somewhere in the Zellij CWD folder
    FileSystemCreate = 11,
    // / A file was accessed somewhere in the Zellij CWD folder
    FileSystemRead = 12,
    // / A file was modified somewhere in the Zellij CWD folder
    FileSystemUpdate = 13,
    // / A file was deleted somewhere in the Zellij CWD folder
    FileSystemDelete = 14,
    PermissionRequestResult = 15,
    SessionUpdate = 16,
    RunCommandResult = 17,
    WebRequestResult = 18,
  } // EventType
  export class EventNameList {
    public event_types: Array<u32> = new Array<u32>();

    // Decodes EventNameList from an ArrayBuffer
    static decode(buf: ArrayBuffer): EventNameList {
      return EventNameList.decodeDataView(new DataView(buf));
    }

    // Decodes EventNameList from a DataView
    static decodeDataView(view: DataView): EventNameList {
      const decoder = new __proto.Decoder(view);
      const obj = new EventNameList();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const endPos = decoder.pos + decoder.uint32();
            while (decoder.pos <= endPos) {
              obj.event_types.push(decoder.uint32());
            }

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode EventNameList

    public size(): u32 {
      let size: u32 = 0;

      if (this.event_types.length > 0) {
        const packedSize = __size_uint32_repeated_packed(this.event_types);
        if (packedSize > 0) {
          size += 1 + __proto.Sizer.varint64(packedSize) + packedSize;
        }
      }

      return size;
    }

    // Encodes EventNameList to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes EventNameList to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.event_types.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(__size_uint32_repeated_packed(this.event_types));

        for (let n: i32 = 0; n < this.event_types.length; n++) {
          encoder.uint32(this.event_types[n]);
        }
      }

      return buf;
    } // encode EventNameList
  } // EventNameList

  export class Header {
    public name: string = "";
    public value: string = "";

    // Decodes Header from an ArrayBuffer
    static decode(buf: ArrayBuffer): Header {
      return Header.decodeDataView(new DataView(buf));
    }

    // Decodes Header from a DataView
    static decodeDataView(view: DataView): Header {
      const decoder = new __proto.Decoder(view);
      const obj = new Header();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.name = decoder.string();
            break;
          }
          case 2: {
            obj.value = decoder.string();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode Header

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.name.length > 0
          ? 1 + __proto.Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size +=
        this.value.length > 0
          ? 1 + __proto.Sizer.varint64(this.value.length) + this.value.length
          : 0;

      return size;
    }

    // Encodes Header to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Header to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.name.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.name.length);
        encoder.string(this.name);
      }
      if (this.value.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.value.length);
        encoder.string(this.value);
      }

      return buf;
    } // encode Header
  } // Header
} // event
export namespace file {
  export class File {
    public path: string = "";
    public line_number: i32;
    public cwd: string = "";

    public ___line_number: string = "";
    public ___line_number_index: u8 = 0;

    public ___cwd: string = "";
    public ___cwd_index: u8 = 0;

    static readonly LINE_NUMBER_LINE_NUMBER_INDEX: u8 = 2;
    static readonly CWD_CWD_INDEX: u8 = 3;

    // Decodes File from an ArrayBuffer
    static decode(buf: ArrayBuffer): File {
      return File.decodeDataView(new DataView(buf));
    }

    // Decodes File from a DataView
    static decodeDataView(view: DataView): File {
      const decoder = new __proto.Decoder(view);
      const obj = new File();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.path = decoder.string();
            break;
          }
          case 2: {
            obj.line_number = decoder.int32();
            obj.___line_number = "line_number";
            obj.___line_number_index = 2;
            break;
          }
          case 3: {
            obj.cwd = decoder.string();
            obj.___cwd = "cwd";
            obj.___cwd_index = 3;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode File

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.path.length > 0
          ? 1 + __proto.Sizer.varint64(this.path.length) + this.path.length
          : 0;
      size +=
        this.line_number == 0 ? 0 : 1 + __proto.Sizer.int32(this.line_number);
      size +=
        this.cwd.length > 0
          ? 1 + __proto.Sizer.varint64(this.cwd.length) + this.cwd.length
          : 0;

      return size;
    }

    // Encodes File to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes File to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.path.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.path.length);
        encoder.string(this.path);
      }
      if (this.line_number != 0) {
        encoder.uint32(0x10);
        encoder.int32(this.line_number);
      }
      if (this.cwd.length > 0) {
        encoder.uint32(0x1a);
        encoder.uint32(this.cwd.length);
        encoder.string(this.cwd);
      }

      return buf;
    } // encode File
  } // File
} // file
export namespace command {
  export class Command {
    public path: string = "";
    public args: Array<string> = new Array<string>();
    public cwd: string = "";

    public ___cwd: string = "";
    public ___cwd_index: u8 = 0;

    static readonly CWD_CWD_INDEX: u8 = 3;

    // Decodes Command from an ArrayBuffer
    static decode(buf: ArrayBuffer): Command {
      return Command.decodeDataView(new DataView(buf));
    }

    // Decodes Command from a DataView
    static decodeDataView(view: DataView): Command {
      const decoder = new __proto.Decoder(view);
      const obj = new Command();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.path = decoder.string();
            break;
          }
          case 2: {
            obj.args.push(decoder.string());
            break;
          }
          case 3: {
            obj.cwd = decoder.string();
            obj.___cwd = "cwd";
            obj.___cwd_index = 3;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode Command

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.path.length > 0
          ? 1 + __proto.Sizer.varint64(this.path.length) + this.path.length
          : 0;

      size += __size_string_repeated(this.args);

      size +=
        this.cwd.length > 0
          ? 1 + __proto.Sizer.varint64(this.cwd.length) + this.cwd.length
          : 0;

      return size;
    }

    // Encodes Command to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Command to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.path.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.path.length);
        encoder.string(this.path);
      }

      if (this.args.length > 0) {
        for (let n: i32 = 0; n < this.args.length; n++) {
          encoder.uint32(0x12);
          encoder.uint32(this.args[n].length);
          encoder.string(this.args[n]);
        }
      }

      if (this.cwd.length > 0) {
        encoder.uint32(0x1a);
        encoder.uint32(this.cwd.length);
        encoder.string(this.cwd);
      }

      return buf;
    } // encode Command
  } // Command
} // command
export namespace message {
  export class Message {
    public name: string = "";
    public payload: string = "";
    public worker_name: string = "";

    public ___worker_name: string = "";
    public ___worker_name_index: u8 = 0;

    static readonly WORKER_NAME_WORKER_NAME_INDEX: u8 = 3;

    // Decodes Message from an ArrayBuffer
    static decode(buf: ArrayBuffer): Message {
      return Message.decodeDataView(new DataView(buf));
    }

    // Decodes Message from a DataView
    static decodeDataView(view: DataView): Message {
      const decoder = new __proto.Decoder(view);
      const obj = new Message();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.name = decoder.string();
            break;
          }
          case 2: {
            obj.payload = decoder.string();
            break;
          }
          case 3: {
            obj.worker_name = decoder.string();
            obj.___worker_name = "worker_name";
            obj.___worker_name_index = 3;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode Message

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.name.length > 0
          ? 1 + __proto.Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size +=
        this.payload.length > 0
          ? 1 +
            __proto.Sizer.varint64(this.payload.length) +
            this.payload.length
          : 0;
      size +=
        this.worker_name.length > 0
          ? 1 +
            __proto.Sizer.varint64(this.worker_name.length) +
            this.worker_name.length
          : 0;

      return size;
    }

    // Encodes Message to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Message to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.name.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.name.length);
        encoder.string(this.name);
      }
      if (this.payload.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.payload.length);
        encoder.string(this.payload);
      }
      if (this.worker_name.length > 0) {
        encoder.uint32(0x1a);
        encoder.uint32(this.worker_name.length);
        encoder.string(this.worker_name);
      }

      return buf;
    } // encode Message
  } // Message
} // message
export namespace plugin_permission {
  export enum PermissionType {
    ReadApplicationState = 0,
    ChangeApplicationState = 1,
    OpenFiles = 2,
    RunCommands = 3,
    OpenTerminalsOrPlugins = 4,
    WriteToStdin = 5,
    WebAccess = 6,
    ReadCliPipes = 7,
    MessageAndLaunchOtherPlugins = 8,
  } // PermissionType
} // plugin_permission
export namespace plugin_command {
  export enum CommandName {
    Subscribe = 0,
    Unsubscribe = 1,
    SetSelectable = 2,
    GetPluginIds = 3,
    GetZellijVersion = 4,
    OpenFile = 5,
    OpenFileFloating = 6,
    OpenTerminal = 7,
    OpenTerminalFloating = 8,
    OpenCommandPane = 9,
    OpenCommandPaneFloating = 10,
    SwitchTabTo = 11,
    SetTimeout = 12,
    ExecCmd = 13,
    PostMessageTo = 14,
    PostMessageToPlugin = 15,
    HideSelf = 16,
    ShowSelf = 17,
    SwitchToMode = 18,
    NewTabsWithLayout = 19,
    NewTab = 20,
    GoToNextTab = 21,
    GoToPreviousTab = 22,
    Resize = 23,
    ResizeWithDirection = 24,
    FocusNextPane = 25,
    FocusPreviousPane = 26,
    MoveFocus = 27,
    MoveFocusOrTab = 28,
    Detach = 29,
    EditScrollback = 30,
    Write = 31,
    WriteChars = 32,
    ToggleTab = 33,
    MovePane = 34,
    MovePaneWithDirection = 35,
    ClearScreen = 36,
    ScrollUp = 37,
    ScrollDown = 38,
    ScrollToTop = 39,
    ScrollToBottom = 40,
    PageScrollUp = 41,
    PageScrollDown = 42,
    ToggleFocusFullscreen = 43,
    TogglePaneFrames = 44,
    TogglePaneEmbedOrEject = 45,
    UndoRenamePane = 46,
    CloseFocus = 47,
    ToggleActiveTabSync = 48,
    CloseFocusedTab = 49,
    UndoRenameTab = 50,
    QuitZellij = 51,
    PreviousSwapLayout = 52,
    NextSwapLayout = 53,
    GoToTabName = 54,
    FocusOrCreateTab = 55,
    GoToTab = 56,
    StartOrReloadPlugin = 57,
    CloseTerminalPane = 58,
    ClosePluginPane = 59,
    FocusTerminalPane = 60,
    FocusPluginPane = 61,
    RenameTerminalPane = 62,
    RenamePluginPane = 63,
    RenameTab = 64,
    ReportCrash = 65,
    RequestPluginPermissions = 66,
    SwitchSession = 67,
    OpenTerminalInPlace = 68,
    OpenCommandInPlace = 69,
    OpenFileInPlace = 70,
    RunCommand = 71,
    WebRequest = 72,
    DeleteDeadSession = 73,
    DeleteAllDeadSessions = 74,
    RenameSession = 75,
    UnblockCliPipeInput = 76,
    BlockCliPipeInput = 77,
    CliPipeOutput = 78,
    MessageToPlugin = 79,
  } // CommandName
  export enum PaneType {
    Terminal = 0,
    Plugin = 1,
  } // PaneType
  export enum HttpVerb {
    Get = 0,
    Post = 1,
    Put = 2,
    Delete = 3,
  } // HttpVerb
  export class PluginCommand {
    public name: u32;
    public subscribe_payload: SubscribePayload | null;
    public unsubscribe_payload: UnsubscribePayload | null;
    public set_selectable_payload: bool;
    public open_file_payload: OpenFilePayload | null;
    public open_file_floating_payload: OpenFilePayload | null;
    public open_terminal_payload: OpenFilePayload | null;
    public open_terminal_floating_payload: OpenFilePayload | null;
    public open_command_pane_payload: OpenCommandPanePayload | null;
    public open_command_pane_floating_payload: OpenCommandPanePayload | null;
    public switch_tab_to_payload: SwitchTabToPayload | null;
    public set_timeout_payload: SetTimeoutPayload | null;
    public exec_cmd_payload: ExecCmdPayload | null;
    public post_message_to_payload: PluginMessagePayload | null;
    public post_message_to_plugin_payload: PluginMessagePayload | null;
    public show_self_payload: bool;
    public switch_to_mode_payload: action.SwitchToModePayload | null;
    public new_tabs_with_layout_payload: string = "";
    public resize_payload: ResizePayload | null;
    public resize_with_direction_payload: ResizePayload | null;
    public move_focus_payload: MovePayload | null;
    public move_focus_or_tab_payload: MovePayload | null;
    public write_payload: Array<u8> = new Array<u8>();
    public write_chars_payload: string = "";
    public move_pane_with_direction_payload: MovePayload | null;
    public go_to_tab_name_payload: string = "";
    public focus_or_create_tab_payload: string = "";
    public go_to_tab_payload: u32;
    public start_or_reload_plugin_payload: string = "";
    public close_terminal_pane_payload: u32;
    public close_plugin_pane_payload: u32;
    public focus_terminal_pane_payload: action.PaneIdAndShouldFloat | null;
    public focus_plugin_pane_payload: action.PaneIdAndShouldFloat | null;
    public rename_terminal_pane_payload: IdAndNewName | null;
    public rename_plugin_pane_payload: IdAndNewName | null;
    public rename_tab_payload: IdAndNewName | null;
    public report_crash_payload: string = "";
    public request_plugin_permission_payload: RequestPluginPermissionPayload | null;
    public switch_session_payload: SwitchSessionPayload | null;
    public open_file_in_place_payload: OpenFilePayload | null;
    public open_terminal_in_place_payload: OpenFilePayload | null;
    public open_command_pane_in_place_payload: OpenCommandPanePayload | null;
    public run_command_payload: RunCommandPayload | null;
    public web_request_payload: WebRequestPayload | null;
    public delete_dead_session_payload: string = "";
    public rename_session_payload: string = "";
    public unblock_cli_pipe_input_payload: string = "";
    public block_cli_pipe_input_payload: string = "";
    public cli_pipe_output_payload: CliPipeOutputPayload | null;
    public message_to_plugin_payload: MessageToPluginPayload | null;

    public __payload: string = "";
    public __payload_index: u8 = 0;

    static readonly PAYLOAD_SUBSCRIBE_PAYLOAD_INDEX: u8 = 2;
    static readonly PAYLOAD_UNSUBSCRIBE_PAYLOAD_INDEX: u8 = 3;
    static readonly PAYLOAD_SET_SELECTABLE_PAYLOAD_INDEX: u8 = 4;
    static readonly PAYLOAD_OPEN_FILE_PAYLOAD_INDEX: u8 = 5;
    static readonly PAYLOAD_OPEN_FILE_FLOATING_PAYLOAD_INDEX: u8 = 6;
    static readonly PAYLOAD_OPEN_TERMINAL_PAYLOAD_INDEX: u8 = 7;
    static readonly PAYLOAD_OPEN_TERMINAL_FLOATING_PAYLOAD_INDEX: u8 = 8;
    static readonly PAYLOAD_OPEN_COMMAND_PANE_PAYLOAD_INDEX: u8 = 9;
    static readonly PAYLOAD_OPEN_COMMAND_PANE_FLOATING_PAYLOAD_INDEX: u8 = 10;
    static readonly PAYLOAD_SWITCH_TAB_TO_PAYLOAD_INDEX: u8 = 11;
    static readonly PAYLOAD_SET_TIMEOUT_PAYLOAD_INDEX: u8 = 12;
    static readonly PAYLOAD_EXEC_CMD_PAYLOAD_INDEX: u8 = 13;
    static readonly PAYLOAD_POST_MESSAGE_TO_PAYLOAD_INDEX: u8 = 14;
    static readonly PAYLOAD_POST_MESSAGE_TO_PLUGIN_PAYLOAD_INDEX: u8 = 15;
    static readonly PAYLOAD_SHOW_SELF_PAYLOAD_INDEX: u8 = 16;
    static readonly PAYLOAD_SWITCH_TO_MODE_PAYLOAD_INDEX: u8 = 17;
    static readonly PAYLOAD_NEW_TABS_WITH_LAYOUT_PAYLOAD_INDEX: u8 = 18;
    static readonly PAYLOAD_RESIZE_PAYLOAD_INDEX: u8 = 19;
    static readonly PAYLOAD_RESIZE_WITH_DIRECTION_PAYLOAD_INDEX: u8 = 20;
    static readonly PAYLOAD_MOVE_FOCUS_PAYLOAD_INDEX: u8 = 21;
    static readonly PAYLOAD_MOVE_FOCUS_OR_TAB_PAYLOAD_INDEX: u8 = 22;
    static readonly PAYLOAD_WRITE_PAYLOAD_INDEX: u8 = 23;
    static readonly PAYLOAD_WRITE_CHARS_PAYLOAD_INDEX: u8 = 24;
    static readonly PAYLOAD_MOVE_PANE_WITH_DIRECTION_PAYLOAD_INDEX: u8 = 25;
    static readonly PAYLOAD_GO_TO_TAB_NAME_PAYLOAD_INDEX: u8 = 26;
    static readonly PAYLOAD_FOCUS_OR_CREATE_TAB_PAYLOAD_INDEX: u8 = 27;
    static readonly PAYLOAD_GO_TO_TAB_PAYLOAD_INDEX: u8 = 28;
    static readonly PAYLOAD_START_OR_RELOAD_PLUGIN_PAYLOAD_INDEX: u8 = 29;
    static readonly PAYLOAD_CLOSE_TERMINAL_PANE_PAYLOAD_INDEX: u8 = 30;
    static readonly PAYLOAD_CLOSE_PLUGIN_PANE_PAYLOAD_INDEX: u8 = 31;
    static readonly PAYLOAD_FOCUS_TERMINAL_PANE_PAYLOAD_INDEX: u8 = 32;
    static readonly PAYLOAD_FOCUS_PLUGIN_PANE_PAYLOAD_INDEX: u8 = 33;
    static readonly PAYLOAD_RENAME_TERMINAL_PANE_PAYLOAD_INDEX: u8 = 34;
    static readonly PAYLOAD_RENAME_PLUGIN_PANE_PAYLOAD_INDEX: u8 = 35;
    static readonly PAYLOAD_RENAME_TAB_PAYLOAD_INDEX: u8 = 36;
    static readonly PAYLOAD_REPORT_CRASH_PAYLOAD_INDEX: u8 = 37;
    static readonly PAYLOAD_REQUEST_PLUGIN_PERMISSION_PAYLOAD_INDEX: u8 = 38;
    static readonly PAYLOAD_SWITCH_SESSION_PAYLOAD_INDEX: u8 = 39;
    static readonly PAYLOAD_OPEN_FILE_IN_PLACE_PAYLOAD_INDEX: u8 = 40;
    static readonly PAYLOAD_OPEN_TERMINAL_IN_PLACE_PAYLOAD_INDEX: u8 = 41;
    static readonly PAYLOAD_OPEN_COMMAND_PANE_IN_PLACE_PAYLOAD_INDEX: u8 = 42;
    static readonly PAYLOAD_RUN_COMMAND_PAYLOAD_INDEX: u8 = 43;
    static readonly PAYLOAD_WEB_REQUEST_PAYLOAD_INDEX: u8 = 44;
    static readonly PAYLOAD_DELETE_DEAD_SESSION_PAYLOAD_INDEX: u8 = 45;
    static readonly PAYLOAD_RENAME_SESSION_PAYLOAD_INDEX: u8 = 46;
    static readonly PAYLOAD_UNBLOCK_CLI_PIPE_INPUT_PAYLOAD_INDEX: u8 = 47;
    static readonly PAYLOAD_BLOCK_CLI_PIPE_INPUT_PAYLOAD_INDEX: u8 = 48;
    static readonly PAYLOAD_CLI_PIPE_OUTPUT_PAYLOAD_INDEX: u8 = 49;
    static readonly PAYLOAD_MESSAGE_TO_PLUGIN_PAYLOAD_INDEX: u8 = 50;

    // Decodes PluginCommand from an ArrayBuffer
    static decode(buf: ArrayBuffer): PluginCommand {
      return PluginCommand.decodeDataView(new DataView(buf));
    }

    // Decodes PluginCommand from a DataView
    static decodeDataView(view: DataView): PluginCommand {
      const decoder = new __proto.Decoder(view);
      const obj = new PluginCommand();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.name = decoder.uint32();
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.subscribe_payload = SubscribePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "subscribe_payload";
            obj.__payload_index = 2;
            break;
          }
          case 3: {
            const length = decoder.uint32();
            obj.unsubscribe_payload = UnsubscribePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "unsubscribe_payload";
            obj.__payload_index = 3;
            break;
          }
          case 4: {
            obj.set_selectable_payload = decoder.bool();
            obj.__payload = "set_selectable_payload";
            obj.__payload_index = 4;
            break;
          }
          case 5: {
            const length = decoder.uint32();
            obj.open_file_payload = OpenFilePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "open_file_payload";
            obj.__payload_index = 5;
            break;
          }
          case 6: {
            const length = decoder.uint32();
            obj.open_file_floating_payload = OpenFilePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "open_file_floating_payload";
            obj.__payload_index = 6;
            break;
          }
          case 7: {
            const length = decoder.uint32();
            obj.open_terminal_payload = OpenFilePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "open_terminal_payload";
            obj.__payload_index = 7;
            break;
          }
          case 8: {
            const length = decoder.uint32();
            obj.open_terminal_floating_payload = OpenFilePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "open_terminal_floating_payload";
            obj.__payload_index = 8;
            break;
          }
          case 9: {
            const length = decoder.uint32();
            obj.open_command_pane_payload =
              OpenCommandPanePayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "open_command_pane_payload";
            obj.__payload_index = 9;
            break;
          }
          case 10: {
            const length = decoder.uint32();
            obj.open_command_pane_floating_payload =
              OpenCommandPanePayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "open_command_pane_floating_payload";
            obj.__payload_index = 10;
            break;
          }
          case 11: {
            const length = decoder.uint32();
            obj.switch_tab_to_payload = SwitchTabToPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "switch_tab_to_payload";
            obj.__payload_index = 11;
            break;
          }
          case 12: {
            const length = decoder.uint32();
            obj.set_timeout_payload = SetTimeoutPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "set_timeout_payload";
            obj.__payload_index = 12;
            break;
          }
          case 13: {
            const length = decoder.uint32();
            obj.exec_cmd_payload = ExecCmdPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "exec_cmd_payload";
            obj.__payload_index = 13;
            break;
          }
          case 14: {
            const length = decoder.uint32();
            obj.post_message_to_payload = PluginMessagePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "post_message_to_payload";
            obj.__payload_index = 14;
            break;
          }
          case 15: {
            const length = decoder.uint32();
            obj.post_message_to_plugin_payload =
              PluginMessagePayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "post_message_to_plugin_payload";
            obj.__payload_index = 15;
            break;
          }
          case 16: {
            obj.show_self_payload = decoder.bool();
            obj.__payload = "show_self_payload";
            obj.__payload_index = 16;
            break;
          }
          case 17: {
            const length = decoder.uint32();
            obj.switch_to_mode_payload =
              action.SwitchToModePayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "switch_to_mode_payload";
            obj.__payload_index = 17;
            break;
          }
          case 18: {
            obj.new_tabs_with_layout_payload = decoder.string();
            obj.__payload = "new_tabs_with_layout_payload";
            obj.__payload_index = 18;
            break;
          }
          case 19: {
            const length = decoder.uint32();
            obj.resize_payload = ResizePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "resize_payload";
            obj.__payload_index = 19;
            break;
          }
          case 20: {
            const length = decoder.uint32();
            obj.resize_with_direction_payload = ResizePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "resize_with_direction_payload";
            obj.__payload_index = 20;
            break;
          }
          case 21: {
            const length = decoder.uint32();
            obj.move_focus_payload = MovePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "move_focus_payload";
            obj.__payload_index = 21;
            break;
          }
          case 22: {
            const length = decoder.uint32();
            obj.move_focus_or_tab_payload = MovePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "move_focus_or_tab_payload";
            obj.__payload_index = 22;
            break;
          }
          case 23: {
            obj.write_payload = decoder.bytes();
            obj.__payload = "write_payload";
            obj.__payload_index = 23;
            break;
          }
          case 24: {
            obj.write_chars_payload = decoder.string();
            obj.__payload = "write_chars_payload";
            obj.__payload_index = 24;
            break;
          }
          case 25: {
            const length = decoder.uint32();
            obj.move_pane_with_direction_payload = MovePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "move_pane_with_direction_payload";
            obj.__payload_index = 25;
            break;
          }
          case 26: {
            obj.go_to_tab_name_payload = decoder.string();
            obj.__payload = "go_to_tab_name_payload";
            obj.__payload_index = 26;
            break;
          }
          case 27: {
            obj.focus_or_create_tab_payload = decoder.string();
            obj.__payload = "focus_or_create_tab_payload";
            obj.__payload_index = 27;
            break;
          }
          case 28: {
            obj.go_to_tab_payload = decoder.uint32();
            obj.__payload = "go_to_tab_payload";
            obj.__payload_index = 28;
            break;
          }
          case 29: {
            obj.start_or_reload_plugin_payload = decoder.string();
            obj.__payload = "start_or_reload_plugin_payload";
            obj.__payload_index = 29;
            break;
          }
          case 30: {
            obj.close_terminal_pane_payload = decoder.uint32();
            obj.__payload = "close_terminal_pane_payload";
            obj.__payload_index = 30;
            break;
          }
          case 31: {
            obj.close_plugin_pane_payload = decoder.uint32();
            obj.__payload = "close_plugin_pane_payload";
            obj.__payload_index = 31;
            break;
          }
          case 32: {
            const length = decoder.uint32();
            obj.focus_terminal_pane_payload =
              action.PaneIdAndShouldFloat.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "focus_terminal_pane_payload";
            obj.__payload_index = 32;
            break;
          }
          case 33: {
            const length = decoder.uint32();
            obj.focus_plugin_pane_payload =
              action.PaneIdAndShouldFloat.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "focus_plugin_pane_payload";
            obj.__payload_index = 33;
            break;
          }
          case 34: {
            const length = decoder.uint32();
            obj.rename_terminal_pane_payload = IdAndNewName.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "rename_terminal_pane_payload";
            obj.__payload_index = 34;
            break;
          }
          case 35: {
            const length = decoder.uint32();
            obj.rename_plugin_pane_payload = IdAndNewName.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "rename_plugin_pane_payload";
            obj.__payload_index = 35;
            break;
          }
          case 36: {
            const length = decoder.uint32();
            obj.rename_tab_payload = IdAndNewName.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "rename_tab_payload";
            obj.__payload_index = 36;
            break;
          }
          case 37: {
            obj.report_crash_payload = decoder.string();
            obj.__payload = "report_crash_payload";
            obj.__payload_index = 37;
            break;
          }
          case 38: {
            const length = decoder.uint32();
            obj.request_plugin_permission_payload =
              RequestPluginPermissionPayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "request_plugin_permission_payload";
            obj.__payload_index = 38;
            break;
          }
          case 39: {
            const length = decoder.uint32();
            obj.switch_session_payload = SwitchSessionPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "switch_session_payload";
            obj.__payload_index = 39;
            break;
          }
          case 40: {
            const length = decoder.uint32();
            obj.open_file_in_place_payload = OpenFilePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "open_file_in_place_payload";
            obj.__payload_index = 40;
            break;
          }
          case 41: {
            const length = decoder.uint32();
            obj.open_terminal_in_place_payload = OpenFilePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "open_terminal_in_place_payload";
            obj.__payload_index = 41;
            break;
          }
          case 42: {
            const length = decoder.uint32();
            obj.open_command_pane_in_place_payload =
              OpenCommandPanePayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "open_command_pane_in_place_payload";
            obj.__payload_index = 42;
            break;
          }
          case 43: {
            const length = decoder.uint32();
            obj.run_command_payload = RunCommandPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "run_command_payload";
            obj.__payload_index = 43;
            break;
          }
          case 44: {
            const length = decoder.uint32();
            obj.web_request_payload = WebRequestPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "web_request_payload";
            obj.__payload_index = 44;
            break;
          }
          case 45: {
            obj.delete_dead_session_payload = decoder.string();
            obj.__payload = "delete_dead_session_payload";
            obj.__payload_index = 45;
            break;
          }
          case 46: {
            obj.rename_session_payload = decoder.string();
            obj.__payload = "rename_session_payload";
            obj.__payload_index = 46;
            break;
          }
          case 47: {
            obj.unblock_cli_pipe_input_payload = decoder.string();
            obj.__payload = "unblock_cli_pipe_input_payload";
            obj.__payload_index = 47;
            break;
          }
          case 48: {
            obj.block_cli_pipe_input_payload = decoder.string();
            obj.__payload = "block_cli_pipe_input_payload";
            obj.__payload_index = 48;
            break;
          }
          case 49: {
            const length = decoder.uint32();
            obj.cli_pipe_output_payload = CliPipeOutputPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "cli_pipe_output_payload";
            obj.__payload_index = 49;
            break;
          }
          case 50: {
            const length = decoder.uint32();
            obj.message_to_plugin_payload =
              MessageToPluginPayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "message_to_plugin_payload";
            obj.__payload_index = 50;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode PluginCommand

    public size(): u32 {
      let size: u32 = 0;

      size += this.name == 0 ? 0 : 1 + __proto.Sizer.uint32(this.name);

      if (this.subscribe_payload != null) {
        const f: SubscribePayload = this.subscribe_payload as SubscribePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.unsubscribe_payload != null) {
        const f: UnsubscribePayload = this
          .unsubscribe_payload as UnsubscribePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size += this.set_selectable_payload == 0 ? 0 : 1 + 1;

      if (this.open_file_payload != null) {
        const f: OpenFilePayload = this.open_file_payload as OpenFilePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.open_file_floating_payload != null) {
        const f: OpenFilePayload = this
          .open_file_floating_payload as OpenFilePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.open_terminal_payload != null) {
        const f: OpenFilePayload = this
          .open_terminal_payload as OpenFilePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.open_terminal_floating_payload != null) {
        const f: OpenFilePayload = this
          .open_terminal_floating_payload as OpenFilePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.open_command_pane_payload != null) {
        const f: OpenCommandPanePayload = this
          .open_command_pane_payload as OpenCommandPanePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.open_command_pane_floating_payload != null) {
        const f: OpenCommandPanePayload = this
          .open_command_pane_floating_payload as OpenCommandPanePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.switch_tab_to_payload != null) {
        const f: SwitchTabToPayload = this
          .switch_tab_to_payload as SwitchTabToPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.set_timeout_payload != null) {
        const f: SetTimeoutPayload = this
          .set_timeout_payload as SetTimeoutPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.exec_cmd_payload != null) {
        const f: ExecCmdPayload = this.exec_cmd_payload as ExecCmdPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.post_message_to_payload != null) {
        const f: PluginMessagePayload = this
          .post_message_to_payload as PluginMessagePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.post_message_to_plugin_payload != null) {
        const f: PluginMessagePayload = this
          .post_message_to_plugin_payload as PluginMessagePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size += this.show_self_payload == 0 ? 0 : 2 + 1;

      if (this.switch_to_mode_payload != null) {
        const f: action.SwitchToModePayload = this
          .switch_to_mode_payload as action.SwitchToModePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.new_tabs_with_layout_payload.length > 0
          ? 2 +
            __proto.Sizer.varint64(this.new_tabs_with_layout_payload.length) +
            this.new_tabs_with_layout_payload.length
          : 0;

      if (this.resize_payload != null) {
        const f: ResizePayload = this.resize_payload as ResizePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.resize_with_direction_payload != null) {
        const f: ResizePayload = this
          .resize_with_direction_payload as ResizePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.move_focus_payload != null) {
        const f: MovePayload = this.move_focus_payload as MovePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.move_focus_or_tab_payload != null) {
        const f: MovePayload = this.move_focus_or_tab_payload as MovePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.write_payload.length > 0
          ? 2 +
            __proto.Sizer.varint64(this.write_payload.length) +
            this.write_payload.length
          : 0;
      size +=
        this.write_chars_payload.length > 0
          ? 2 +
            __proto.Sizer.varint64(this.write_chars_payload.length) +
            this.write_chars_payload.length
          : 0;

      if (this.move_pane_with_direction_payload != null) {
        const f: MovePayload = this
          .move_pane_with_direction_payload as MovePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.go_to_tab_name_payload.length > 0
          ? 2 +
            __proto.Sizer.varint64(this.go_to_tab_name_payload.length) +
            this.go_to_tab_name_payload.length
          : 0;
      size +=
        this.focus_or_create_tab_payload.length > 0
          ? 2 +
            __proto.Sizer.varint64(this.focus_or_create_tab_payload.length) +
            this.focus_or_create_tab_payload.length
          : 0;
      size +=
        this.go_to_tab_payload == 0
          ? 0
          : 2 + __proto.Sizer.uint32(this.go_to_tab_payload);
      size +=
        this.start_or_reload_plugin_payload.length > 0
          ? 2 +
            __proto.Sizer.varint64(this.start_or_reload_plugin_payload.length) +
            this.start_or_reload_plugin_payload.length
          : 0;
      size +=
        this.close_terminal_pane_payload == 0
          ? 0
          : 2 + __proto.Sizer.uint32(this.close_terminal_pane_payload);
      size +=
        this.close_plugin_pane_payload == 0
          ? 0
          : 2 + __proto.Sizer.uint32(this.close_plugin_pane_payload);

      if (this.focus_terminal_pane_payload != null) {
        const f: action.PaneIdAndShouldFloat = this
          .focus_terminal_pane_payload as action.PaneIdAndShouldFloat;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.focus_plugin_pane_payload != null) {
        const f: action.PaneIdAndShouldFloat = this
          .focus_plugin_pane_payload as action.PaneIdAndShouldFloat;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.rename_terminal_pane_payload != null) {
        const f: IdAndNewName = this
          .rename_terminal_pane_payload as IdAndNewName;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.rename_plugin_pane_payload != null) {
        const f: IdAndNewName = this.rename_plugin_pane_payload as IdAndNewName;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.rename_tab_payload != null) {
        const f: IdAndNewName = this.rename_tab_payload as IdAndNewName;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.report_crash_payload.length > 0
          ? 2 +
            __proto.Sizer.varint64(this.report_crash_payload.length) +
            this.report_crash_payload.length
          : 0;

      if (this.request_plugin_permission_payload != null) {
        const f: RequestPluginPermissionPayload = this
          .request_plugin_permission_payload as RequestPluginPermissionPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.switch_session_payload != null) {
        const f: SwitchSessionPayload = this
          .switch_session_payload as SwitchSessionPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.open_file_in_place_payload != null) {
        const f: OpenFilePayload = this
          .open_file_in_place_payload as OpenFilePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.open_terminal_in_place_payload != null) {
        const f: OpenFilePayload = this
          .open_terminal_in_place_payload as OpenFilePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.open_command_pane_in_place_payload != null) {
        const f: OpenCommandPanePayload = this
          .open_command_pane_in_place_payload as OpenCommandPanePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.run_command_payload != null) {
        const f: RunCommandPayload = this
          .run_command_payload as RunCommandPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.web_request_payload != null) {
        const f: WebRequestPayload = this
          .web_request_payload as WebRequestPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.delete_dead_session_payload.length > 0
          ? 2 +
            __proto.Sizer.varint64(this.delete_dead_session_payload.length) +
            this.delete_dead_session_payload.length
          : 0;
      size +=
        this.rename_session_payload.length > 0
          ? 2 +
            __proto.Sizer.varint64(this.rename_session_payload.length) +
            this.rename_session_payload.length
          : 0;
      size +=
        this.unblock_cli_pipe_input_payload.length > 0
          ? 2 +
            __proto.Sizer.varint64(this.unblock_cli_pipe_input_payload.length) +
            this.unblock_cli_pipe_input_payload.length
          : 0;
      size +=
        this.block_cli_pipe_input_payload.length > 0
          ? 2 +
            __proto.Sizer.varint64(this.block_cli_pipe_input_payload.length) +
            this.block_cli_pipe_input_payload.length
          : 0;

      if (this.cli_pipe_output_payload != null) {
        const f: CliPipeOutputPayload = this
          .cli_pipe_output_payload as CliPipeOutputPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.message_to_plugin_payload != null) {
        const f: MessageToPluginPayload = this
          .message_to_plugin_payload as MessageToPluginPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes PluginCommand to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes PluginCommand to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.name != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.name);
      }

      if (this.subscribe_payload != null) {
        const f = this.subscribe_payload as SubscribePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.unsubscribe_payload != null) {
        const f = this.unsubscribe_payload as UnsubscribePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x1a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.set_selectable_payload != 0) {
        encoder.uint32(0x20);
        encoder.bool(this.set_selectable_payload);
      }

      if (this.open_file_payload != null) {
        const f = this.open_file_payload as OpenFilePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x2a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.open_file_floating_payload != null) {
        const f = this.open_file_floating_payload as OpenFilePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x32);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.open_terminal_payload != null) {
        const f = this.open_terminal_payload as OpenFilePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x3a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.open_terminal_floating_payload != null) {
        const f = this.open_terminal_floating_payload as OpenFilePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x42);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.open_command_pane_payload != null) {
        const f = this.open_command_pane_payload as OpenCommandPanePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x4a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.open_command_pane_floating_payload != null) {
        const f = this
          .open_command_pane_floating_payload as OpenCommandPanePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x52);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.switch_tab_to_payload != null) {
        const f = this.switch_tab_to_payload as SwitchTabToPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x5a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.set_timeout_payload != null) {
        const f = this.set_timeout_payload as SetTimeoutPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x62);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.exec_cmd_payload != null) {
        const f = this.exec_cmd_payload as ExecCmdPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x6a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.post_message_to_payload != null) {
        const f = this.post_message_to_payload as PluginMessagePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x72);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.post_message_to_plugin_payload != null) {
        const f = this.post_message_to_plugin_payload as PluginMessagePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x7a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.show_self_payload != 0) {
        encoder.uint32(0x80);
        encoder.bool(this.show_self_payload);
      }

      if (this.switch_to_mode_payload != null) {
        const f = this.switch_to_mode_payload as action.SwitchToModePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x8a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.new_tabs_with_layout_payload.length > 0) {
        encoder.uint32(0x92);
        encoder.uint32(this.new_tabs_with_layout_payload.length);
        encoder.string(this.new_tabs_with_layout_payload);
      }

      if (this.resize_payload != null) {
        const f = this.resize_payload as ResizePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x9a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.resize_with_direction_payload != null) {
        const f = this.resize_with_direction_payload as ResizePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa2);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.move_focus_payload != null) {
        const f = this.move_focus_payload as MovePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xaa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.move_focus_or_tab_payload != null) {
        const f = this.move_focus_or_tab_payload as MovePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xb2);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.write_payload.length > 0) {
        encoder.uint32(0xba);
        encoder.uint32(this.write_payload.length);
        encoder.bytes(this.write_payload);
      }
      if (this.write_chars_payload.length > 0) {
        encoder.uint32(0xc2);
        encoder.uint32(this.write_chars_payload.length);
        encoder.string(this.write_chars_payload);
      }

      if (this.move_pane_with_direction_payload != null) {
        const f = this.move_pane_with_direction_payload as MovePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xca);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.go_to_tab_name_payload.length > 0) {
        encoder.uint32(0xd2);
        encoder.uint32(this.go_to_tab_name_payload.length);
        encoder.string(this.go_to_tab_name_payload);
      }
      if (this.focus_or_create_tab_payload.length > 0) {
        encoder.uint32(0xda);
        encoder.uint32(this.focus_or_create_tab_payload.length);
        encoder.string(this.focus_or_create_tab_payload);
      }
      if (this.go_to_tab_payload != 0) {
        encoder.uint32(0xe0);
        encoder.uint32(this.go_to_tab_payload);
      }
      if (this.start_or_reload_plugin_payload.length > 0) {
        encoder.uint32(0xea);
        encoder.uint32(this.start_or_reload_plugin_payload.length);
        encoder.string(this.start_or_reload_plugin_payload);
      }
      if (this.close_terminal_pane_payload != 0) {
        encoder.uint32(0xf0);
        encoder.uint32(this.close_terminal_pane_payload);
      }
      if (this.close_plugin_pane_payload != 0) {
        encoder.uint32(0xf8);
        encoder.uint32(this.close_plugin_pane_payload);
      }

      if (this.focus_terminal_pane_payload != null) {
        const f = this
          .focus_terminal_pane_payload as action.PaneIdAndShouldFloat;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x102);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.focus_plugin_pane_payload != null) {
        const f = this.focus_plugin_pane_payload as action.PaneIdAndShouldFloat;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x10a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.rename_terminal_pane_payload != null) {
        const f = this.rename_terminal_pane_payload as IdAndNewName;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x112);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.rename_plugin_pane_payload != null) {
        const f = this.rename_plugin_pane_payload as IdAndNewName;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x11a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.rename_tab_payload != null) {
        const f = this.rename_tab_payload as IdAndNewName;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x122);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.report_crash_payload.length > 0) {
        encoder.uint32(0x12a);
        encoder.uint32(this.report_crash_payload.length);
        encoder.string(this.report_crash_payload);
      }

      if (this.request_plugin_permission_payload != null) {
        const f = this
          .request_plugin_permission_payload as RequestPluginPermissionPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x132);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.switch_session_payload != null) {
        const f = this.switch_session_payload as SwitchSessionPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x13a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.open_file_in_place_payload != null) {
        const f = this.open_file_in_place_payload as OpenFilePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x142);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.open_terminal_in_place_payload != null) {
        const f = this.open_terminal_in_place_payload as OpenFilePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x14a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.open_command_pane_in_place_payload != null) {
        const f = this
          .open_command_pane_in_place_payload as OpenCommandPanePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x152);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.run_command_payload != null) {
        const f = this.run_command_payload as RunCommandPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x15a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.web_request_payload != null) {
        const f = this.web_request_payload as WebRequestPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x162);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.delete_dead_session_payload.length > 0) {
        encoder.uint32(0x16a);
        encoder.uint32(this.delete_dead_session_payload.length);
        encoder.string(this.delete_dead_session_payload);
      }
      if (this.rename_session_payload.length > 0) {
        encoder.uint32(0x172);
        encoder.uint32(this.rename_session_payload.length);
        encoder.string(this.rename_session_payload);
      }
      if (this.unblock_cli_pipe_input_payload.length > 0) {
        encoder.uint32(0x17a);
        encoder.uint32(this.unblock_cli_pipe_input_payload.length);
        encoder.string(this.unblock_cli_pipe_input_payload);
      }
      if (this.block_cli_pipe_input_payload.length > 0) {
        encoder.uint32(0x182);
        encoder.uint32(this.block_cli_pipe_input_payload.length);
        encoder.string(this.block_cli_pipe_input_payload);
      }

      if (this.cli_pipe_output_payload != null) {
        const f = this.cli_pipe_output_payload as CliPipeOutputPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x18a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.message_to_plugin_payload != null) {
        const f = this.message_to_plugin_payload as MessageToPluginPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x192);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode PluginCommand
  } // PluginCommand

  export class CliPipeOutputPayload {
    public pipe_name: string = "";
    public output: string = "";

    // Decodes CliPipeOutputPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): CliPipeOutputPayload {
      return CliPipeOutputPayload.decodeDataView(new DataView(buf));
    }

    // Decodes CliPipeOutputPayload from a DataView
    static decodeDataView(view: DataView): CliPipeOutputPayload {
      const decoder = new __proto.Decoder(view);
      const obj = new CliPipeOutputPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.pipe_name = decoder.string();
            break;
          }
          case 2: {
            obj.output = decoder.string();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode CliPipeOutputPayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.pipe_name.length > 0
          ? 1 +
            __proto.Sizer.varint64(this.pipe_name.length) +
            this.pipe_name.length
          : 0;
      size +=
        this.output.length > 0
          ? 1 + __proto.Sizer.varint64(this.output.length) + this.output.length
          : 0;

      return size;
    }

    // Encodes CliPipeOutputPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes CliPipeOutputPayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.pipe_name.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.pipe_name.length);
        encoder.string(this.pipe_name);
      }
      if (this.output.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.output.length);
        encoder.string(this.output);
      }

      return buf;
    } // encode CliPipeOutputPayload
  } // CliPipeOutputPayload

  export class MessageToPluginPayload {
    public plugin_url: string = "";
    public plugin_config: Array<ContextItem> = new Array<ContextItem>();
    public message_name: string = "";
    public message_payload: string = "";
    public message_args: Array<ContextItem> = new Array<ContextItem>();
    public new_plugin_args: NewPluginArgs | null;

    public ___plugin_url: string = "";
    public ___plugin_url_index: u8 = 0;

    public ___message_payload: string = "";
    public ___message_payload_index: u8 = 0;

    public ___new_plugin_args: string = "";
    public ___new_plugin_args_index: u8 = 0;

    static readonly PLUGIN_URL_PLUGIN_URL_INDEX: u8 = 1;
    static readonly MESSAGE_PAYLOAD_MESSAGE_PAYLOAD_INDEX: u8 = 4;
    static readonly NEW_PLUGIN_ARGS_NEW_PLUGIN_ARGS_INDEX: u8 = 6;

    // Decodes MessageToPluginPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): MessageToPluginPayload {
      return MessageToPluginPayload.decodeDataView(new DataView(buf));
    }

    // Decodes MessageToPluginPayload from a DataView
    static decodeDataView(view: DataView): MessageToPluginPayload {
      const decoder = new __proto.Decoder(view);
      const obj = new MessageToPluginPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.plugin_url = decoder.string();
            obj.___plugin_url = "plugin_url";
            obj.___plugin_url_index = 1;
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.plugin_config.push(
              ContextItem.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              ),
            );
            decoder.skip(length);

            break;
          }
          case 3: {
            obj.message_name = decoder.string();
            break;
          }
          case 4: {
            obj.message_payload = decoder.string();
            obj.___message_payload = "message_payload";
            obj.___message_payload_index = 4;
            break;
          }
          case 5: {
            const length = decoder.uint32();
            obj.message_args.push(
              ContextItem.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              ),
            );
            decoder.skip(length);

            break;
          }
          case 6: {
            const length = decoder.uint32();
            obj.new_plugin_args = NewPluginArgs.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.___new_plugin_args = "new_plugin_args";
            obj.___new_plugin_args_index = 6;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode MessageToPluginPayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.plugin_url.length > 0
          ? 1 +
            __proto.Sizer.varint64(this.plugin_url.length) +
            this.plugin_url.length
          : 0;

      for (let n: i32 = 0; n < this.plugin_config.length; n++) {
        const messageSize = this.plugin_config[n].size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.message_name.length > 0
          ? 1 +
            __proto.Sizer.varint64(this.message_name.length) +
            this.message_name.length
          : 0;
      size +=
        this.message_payload.length > 0
          ? 1 +
            __proto.Sizer.varint64(this.message_payload.length) +
            this.message_payload.length
          : 0;

      for (let n: i32 = 0; n < this.message_args.length; n++) {
        const messageSize = this.message_args[n].size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.new_plugin_args != null) {
        const f: NewPluginArgs = this.new_plugin_args as NewPluginArgs;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes MessageToPluginPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes MessageToPluginPayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.plugin_url.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.plugin_url.length);
        encoder.string(this.plugin_url);
      }

      for (let n: i32 = 0; n < this.plugin_config.length; n++) {
        const messageSize = this.plugin_config[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          this.plugin_config[n].encodeU8Array(encoder);
        }
      }

      if (this.message_name.length > 0) {
        encoder.uint32(0x1a);
        encoder.uint32(this.message_name.length);
        encoder.string(this.message_name);
      }
      if (this.message_payload.length > 0) {
        encoder.uint32(0x22);
        encoder.uint32(this.message_payload.length);
        encoder.string(this.message_payload);
      }

      for (let n: i32 = 0; n < this.message_args.length; n++) {
        const messageSize = this.message_args[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x2a);
          encoder.uint32(messageSize);
          this.message_args[n].encodeU8Array(encoder);
        }
      }

      if (this.new_plugin_args != null) {
        const f = this.new_plugin_args as NewPluginArgs;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x32);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode MessageToPluginPayload
  } // MessageToPluginPayload

  export class NewPluginArgs {
    public should_float: bool;
    public pane_id_to_replace: PaneId | null;
    public pane_title: string = "";
    public cwd: string = "";
    public skip_cache: bool;

    public ___should_float: string = "";
    public ___should_float_index: u8 = 0;

    public ___pane_id_to_replace: string = "";
    public ___pane_id_to_replace_index: u8 = 0;

    public ___pane_title: string = "";
    public ___pane_title_index: u8 = 0;

    public ___cwd: string = "";
    public ___cwd_index: u8 = 0;

    static readonly SHOULD_FLOAT_SHOULD_FLOAT_INDEX: u8 = 1;
    static readonly PANE_ID_TO_REPLACE_PANE_ID_TO_REPLACE_INDEX: u8 = 2;
    static readonly PANE_TITLE_PANE_TITLE_INDEX: u8 = 3;
    static readonly CWD_CWD_INDEX: u8 = 4;

    // Decodes NewPluginArgs from an ArrayBuffer
    static decode(buf: ArrayBuffer): NewPluginArgs {
      return NewPluginArgs.decodeDataView(new DataView(buf));
    }

    // Decodes NewPluginArgs from a DataView
    static decodeDataView(view: DataView): NewPluginArgs {
      const decoder = new __proto.Decoder(view);
      const obj = new NewPluginArgs();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.should_float = decoder.bool();
            obj.___should_float = "should_float";
            obj.___should_float_index = 1;
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.pane_id_to_replace = PaneId.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.___pane_id_to_replace = "pane_id_to_replace";
            obj.___pane_id_to_replace_index = 2;
            break;
          }
          case 3: {
            obj.pane_title = decoder.string();
            obj.___pane_title = "pane_title";
            obj.___pane_title_index = 3;
            break;
          }
          case 4: {
            obj.cwd = decoder.string();
            obj.___cwd = "cwd";
            obj.___cwd_index = 4;
            break;
          }
          case 5: {
            obj.skip_cache = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode NewPluginArgs

    public size(): u32 {
      let size: u32 = 0;

      size += this.should_float == 0 ? 0 : 1 + 1;

      if (this.pane_id_to_replace != null) {
        const f: PaneId = this.pane_id_to_replace as PaneId;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.pane_title.length > 0
          ? 1 +
            __proto.Sizer.varint64(this.pane_title.length) +
            this.pane_title.length
          : 0;
      size +=
        this.cwd.length > 0
          ? 1 + __proto.Sizer.varint64(this.cwd.length) + this.cwd.length
          : 0;
      size += this.skip_cache == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes NewPluginArgs to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes NewPluginArgs to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.should_float != 0) {
        encoder.uint32(0x8);
        encoder.bool(this.should_float);
      }

      if (this.pane_id_to_replace != null) {
        const f = this.pane_id_to_replace as PaneId;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.pane_title.length > 0) {
        encoder.uint32(0x1a);
        encoder.uint32(this.pane_title.length);
        encoder.string(this.pane_title);
      }
      if (this.cwd.length > 0) {
        encoder.uint32(0x22);
        encoder.uint32(this.cwd.length);
        encoder.string(this.cwd);
      }
      if (this.skip_cache != 0) {
        encoder.uint32(0x28);
        encoder.bool(this.skip_cache);
      }

      return buf;
    } // encode NewPluginArgs
  } // NewPluginArgs

  export class PaneId {
    public pane_type: u32;
    public id: u32;

    // Decodes PaneId from an ArrayBuffer
    static decode(buf: ArrayBuffer): PaneId {
      return PaneId.decodeDataView(new DataView(buf));
    }

    // Decodes PaneId from a DataView
    static decodeDataView(view: DataView): PaneId {
      const decoder = new __proto.Decoder(view);
      const obj = new PaneId();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.pane_type = decoder.uint32();
            break;
          }
          case 2: {
            obj.id = decoder.uint32();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode PaneId

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.pane_type == 0 ? 0 : 1 + __proto.Sizer.uint32(this.pane_type);
      size += this.id == 0 ? 0 : 1 + __proto.Sizer.uint32(this.id);

      return size;
    }

    // Encodes PaneId to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes PaneId to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.pane_type != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.pane_type);
      }
      if (this.id != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.id);
      }

      return buf;
    } // encode PaneId
  } // PaneId

  export class SwitchSessionPayload {
    public name: string = "";
    public tab_position: u32;
    public pane_id: u32;
    public pane_id_is_plugin: bool;

    public ___name: string = "";
    public ___name_index: u8 = 0;

    public ___tab_position: string = "";
    public ___tab_position_index: u8 = 0;

    public ___pane_id: string = "";
    public ___pane_id_index: u8 = 0;

    public ___pane_id_is_plugin: string = "";
    public ___pane_id_is_plugin_index: u8 = 0;

    static readonly NAME_NAME_INDEX: u8 = 1;
    static readonly TAB_POSITION_TAB_POSITION_INDEX: u8 = 2;
    static readonly PANE_ID_PANE_ID_INDEX: u8 = 3;
    static readonly PANE_ID_IS_PLUGIN_PANE_ID_IS_PLUGIN_INDEX: u8 = 4;

    // Decodes SwitchSessionPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): SwitchSessionPayload {
      return SwitchSessionPayload.decodeDataView(new DataView(buf));
    }

    // Decodes SwitchSessionPayload from a DataView
    static decodeDataView(view: DataView): SwitchSessionPayload {
      const decoder = new __proto.Decoder(view);
      const obj = new SwitchSessionPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.name = decoder.string();
            obj.___name = "name";
            obj.___name_index = 1;
            break;
          }
          case 2: {
            obj.tab_position = decoder.uint32();
            obj.___tab_position = "tab_position";
            obj.___tab_position_index = 2;
            break;
          }
          case 3: {
            obj.pane_id = decoder.uint32();
            obj.___pane_id = "pane_id";
            obj.___pane_id_index = 3;
            break;
          }
          case 4: {
            obj.pane_id_is_plugin = decoder.bool();
            obj.___pane_id_is_plugin = "pane_id_is_plugin";
            obj.___pane_id_is_plugin_index = 4;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode SwitchSessionPayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.name.length > 0
          ? 1 + __proto.Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size +=
        this.tab_position == 0
          ? 0
          : 1 + __proto.Sizer.uint32(this.tab_position);
      size += this.pane_id == 0 ? 0 : 1 + __proto.Sizer.uint32(this.pane_id);
      size += this.pane_id_is_plugin == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes SwitchSessionPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes SwitchSessionPayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.name.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.name.length);
        encoder.string(this.name);
      }
      if (this.tab_position != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.tab_position);
      }
      if (this.pane_id != 0) {
        encoder.uint32(0x18);
        encoder.uint32(this.pane_id);
      }
      if (this.pane_id_is_plugin != 0) {
        encoder.uint32(0x20);
        encoder.bool(this.pane_id_is_plugin);
      }

      return buf;
    } // encode SwitchSessionPayload
  } // SwitchSessionPayload

  export class RequestPluginPermissionPayload {
    public permissions: Array<u32> = new Array<u32>();

    // Decodes RequestPluginPermissionPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): RequestPluginPermissionPayload {
      return RequestPluginPermissionPayload.decodeDataView(new DataView(buf));
    }

    // Decodes RequestPluginPermissionPayload from a DataView
    static decodeDataView(view: DataView): RequestPluginPermissionPayload {
      const decoder = new __proto.Decoder(view);
      const obj = new RequestPluginPermissionPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const endPos = decoder.pos + decoder.uint32();
            while (decoder.pos <= endPos) {
              obj.permissions.push(decoder.uint32());
            }

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode RequestPluginPermissionPayload

    public size(): u32 {
      let size: u32 = 0;

      if (this.permissions.length > 0) {
        const packedSize = __size_uint32_repeated_packed(this.permissions);
        if (packedSize > 0) {
          size += 1 + __proto.Sizer.varint64(packedSize) + packedSize;
        }
      }

      return size;
    }

    // Encodes RequestPluginPermissionPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes RequestPluginPermissionPayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.permissions.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(__size_uint32_repeated_packed(this.permissions));

        for (let n: i32 = 0; n < this.permissions.length; n++) {
          encoder.uint32(this.permissions[n]);
        }
      }

      return buf;
    } // encode RequestPluginPermissionPayload
  } // RequestPluginPermissionPayload

  export class SubscribePayload {
    public subscriptions: event.EventNameList = new event.EventNameList();

    // Decodes SubscribePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): SubscribePayload {
      return SubscribePayload.decodeDataView(new DataView(buf));
    }

    // Decodes SubscribePayload from a DataView
    static decodeDataView(view: DataView): SubscribePayload {
      const decoder = new __proto.Decoder(view);
      const obj = new SubscribePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.subscriptions = event.EventNameList.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode SubscribePayload

    public size(): u32 {
      let size: u32 = 0;

      if (this.subscriptions != null) {
        const f: event.EventNameList = this
          .subscriptions as event.EventNameList;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes SubscribePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes SubscribePayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.subscriptions != null) {
        const f = this.subscriptions as event.EventNameList;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode SubscribePayload
  } // SubscribePayload

  export class UnsubscribePayload {
    public subscriptions: event.EventNameList = new event.EventNameList();

    // Decodes UnsubscribePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): UnsubscribePayload {
      return UnsubscribePayload.decodeDataView(new DataView(buf));
    }

    // Decodes UnsubscribePayload from a DataView
    static decodeDataView(view: DataView): UnsubscribePayload {
      const decoder = new __proto.Decoder(view);
      const obj = new UnsubscribePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.subscriptions = event.EventNameList.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode UnsubscribePayload

    public size(): u32 {
      let size: u32 = 0;

      if (this.subscriptions != null) {
        const f: event.EventNameList = this
          .subscriptions as event.EventNameList;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes UnsubscribePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes UnsubscribePayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.subscriptions != null) {
        const f = this.subscriptions as event.EventNameList;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode UnsubscribePayload
  } // UnsubscribePayload

  export class OpenFilePayload {
    public file_to_open: file.File = new file.File();

    // Decodes OpenFilePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): OpenFilePayload {
      return OpenFilePayload.decodeDataView(new DataView(buf));
    }

    // Decodes OpenFilePayload from a DataView
    static decodeDataView(view: DataView): OpenFilePayload {
      const decoder = new __proto.Decoder(view);
      const obj = new OpenFilePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.file_to_open = file.File.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode OpenFilePayload

    public size(): u32 {
      let size: u32 = 0;

      if (this.file_to_open != null) {
        const f: file.File = this.file_to_open as file.File;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes OpenFilePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes OpenFilePayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.file_to_open != null) {
        const f = this.file_to_open as file.File;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode OpenFilePayload
  } // OpenFilePayload

  export class OpenCommandPanePayload {
    public command_to_run: command.Command = new command.Command();

    // Decodes OpenCommandPanePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): OpenCommandPanePayload {
      return OpenCommandPanePayload.decodeDataView(new DataView(buf));
    }

    // Decodes OpenCommandPanePayload from a DataView
    static decodeDataView(view: DataView): OpenCommandPanePayload {
      const decoder = new __proto.Decoder(view);
      const obj = new OpenCommandPanePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.command_to_run = command.Command.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode OpenCommandPanePayload

    public size(): u32 {
      let size: u32 = 0;

      if (this.command_to_run != null) {
        const f: command.Command = this.command_to_run as command.Command;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes OpenCommandPanePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes OpenCommandPanePayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.command_to_run != null) {
        const f = this.command_to_run as command.Command;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode OpenCommandPanePayload
  } // OpenCommandPanePayload

  export class SwitchTabToPayload {
    public tab_index: u32;

    // Decodes SwitchTabToPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): SwitchTabToPayload {
      return SwitchTabToPayload.decodeDataView(new DataView(buf));
    }

    // Decodes SwitchTabToPayload from a DataView
    static decodeDataView(view: DataView): SwitchTabToPayload {
      const decoder = new __proto.Decoder(view);
      const obj = new SwitchTabToPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.tab_index = decoder.uint32();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode SwitchTabToPayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.tab_index == 0 ? 0 : 1 + __proto.Sizer.uint32(this.tab_index);

      return size;
    }

    // Encodes SwitchTabToPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes SwitchTabToPayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.tab_index != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.tab_index);
      }

      return buf;
    } // encode SwitchTabToPayload
  } // SwitchTabToPayload

  export class SetTimeoutPayload {
    public seconds: f64;

    // Decodes SetTimeoutPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): SetTimeoutPayload {
      return SetTimeoutPayload.decodeDataView(new DataView(buf));
    }

    // Decodes SetTimeoutPayload from a DataView
    static decodeDataView(view: DataView): SetTimeoutPayload {
      const decoder = new __proto.Decoder(view);
      const obj = new SetTimeoutPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.seconds = decoder.double();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode SetTimeoutPayload

    public size(): u32 {
      let size: u32 = 0;

      size += this.seconds == 0 ? 0 : 1 + 8;

      return size;
    }

    // Encodes SetTimeoutPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes SetTimeoutPayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.seconds != 0) {
        encoder.uint32(0x9);
        encoder.double(this.seconds);
      }

      return buf;
    } // encode SetTimeoutPayload
  } // SetTimeoutPayload

  export class ExecCmdPayload {
    public command_line: Array<string> = new Array<string>();

    // Decodes ExecCmdPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): ExecCmdPayload {
      return ExecCmdPayload.decodeDataView(new DataView(buf));
    }

    // Decodes ExecCmdPayload from a DataView
    static decodeDataView(view: DataView): ExecCmdPayload {
      const decoder = new __proto.Decoder(view);
      const obj = new ExecCmdPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.command_line.push(decoder.string());
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode ExecCmdPayload

    public size(): u32 {
      let size: u32 = 0;

      size += __size_string_repeated(this.command_line);

      return size;
    }

    // Encodes ExecCmdPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes ExecCmdPayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.command_line.length > 0) {
        for (let n: i32 = 0; n < this.command_line.length; n++) {
          encoder.uint32(0xa);
          encoder.uint32(this.command_line[n].length);
          encoder.string(this.command_line[n]);
        }
      }

      return buf;
    } // encode ExecCmdPayload
  } // ExecCmdPayload

  export class RunCommandPayload {
    public command_line: Array<string> = new Array<string>();
    public env_variables: Array<EnvVariable> = new Array<EnvVariable>();
    public cwd: string = "";
    public context: Array<ContextItem> = new Array<ContextItem>();

    // Decodes RunCommandPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): RunCommandPayload {
      return RunCommandPayload.decodeDataView(new DataView(buf));
    }

    // Decodes RunCommandPayload from a DataView
    static decodeDataView(view: DataView): RunCommandPayload {
      const decoder = new __proto.Decoder(view);
      const obj = new RunCommandPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.command_line.push(decoder.string());
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.env_variables.push(
              EnvVariable.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              ),
            );
            decoder.skip(length);

            break;
          }
          case 3: {
            obj.cwd = decoder.string();
            break;
          }
          case 4: {
            const length = decoder.uint32();
            obj.context.push(
              ContextItem.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              ),
            );
            decoder.skip(length);

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode RunCommandPayload

    public size(): u32 {
      let size: u32 = 0;

      size += __size_string_repeated(this.command_line);

      for (let n: i32 = 0; n < this.env_variables.length; n++) {
        const messageSize = this.env_variables[n].size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.cwd.length > 0
          ? 1 + __proto.Sizer.varint64(this.cwd.length) + this.cwd.length
          : 0;

      for (let n: i32 = 0; n < this.context.length; n++) {
        const messageSize = this.context[n].size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes RunCommandPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes RunCommandPayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.command_line.length > 0) {
        for (let n: i32 = 0; n < this.command_line.length; n++) {
          encoder.uint32(0xa);
          encoder.uint32(this.command_line[n].length);
          encoder.string(this.command_line[n]);
        }
      }

      for (let n: i32 = 0; n < this.env_variables.length; n++) {
        const messageSize = this.env_variables[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          this.env_variables[n].encodeU8Array(encoder);
        }
      }

      if (this.cwd.length > 0) {
        encoder.uint32(0x1a);
        encoder.uint32(this.cwd.length);
        encoder.string(this.cwd);
      }

      for (let n: i32 = 0; n < this.context.length; n++) {
        const messageSize = this.context[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x22);
          encoder.uint32(messageSize);
          this.context[n].encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode RunCommandPayload
  } // RunCommandPayload

  export class WebRequestPayload {
    public url: string = "";
    public verb: u32;
    public headers: Array<event.Header> = new Array<event.Header>();
    public body: Array<u8> = new Array<u8>();
    public context: Array<ContextItem> = new Array<ContextItem>();

    // Decodes WebRequestPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): WebRequestPayload {
      return WebRequestPayload.decodeDataView(new DataView(buf));
    }

    // Decodes WebRequestPayload from a DataView
    static decodeDataView(view: DataView): WebRequestPayload {
      const decoder = new __proto.Decoder(view);
      const obj = new WebRequestPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.url = decoder.string();
            break;
          }
          case 2: {
            obj.verb = decoder.uint32();
            break;
          }
          case 3: {
            const length = decoder.uint32();
            obj.headers.push(
              event.Header.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              ),
            );
            decoder.skip(length);

            break;
          }
          case 4: {
            obj.body = decoder.bytes();
            break;
          }
          case 5: {
            const length = decoder.uint32();
            obj.context.push(
              ContextItem.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              ),
            );
            decoder.skip(length);

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode WebRequestPayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.url.length > 0
          ? 1 + __proto.Sizer.varint64(this.url.length) + this.url.length
          : 0;
      size += this.verb == 0 ? 0 : 1 + __proto.Sizer.uint32(this.verb);

      for (let n: i32 = 0; n < this.headers.length; n++) {
        const messageSize = this.headers[n].size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.body.length > 0
          ? 1 + __proto.Sizer.varint64(this.body.length) + this.body.length
          : 0;

      for (let n: i32 = 0; n < this.context.length; n++) {
        const messageSize = this.context[n].size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes WebRequestPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes WebRequestPayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.url.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.url.length);
        encoder.string(this.url);
      }
      if (this.verb != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.verb);
      }

      for (let n: i32 = 0; n < this.headers.length; n++) {
        const messageSize = this.headers[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x1a);
          encoder.uint32(messageSize);
          this.headers[n].encodeU8Array(encoder);
        }
      }

      if (this.body.length > 0) {
        encoder.uint32(0x22);
        encoder.uint32(this.body.length);
        encoder.bytes(this.body);
      }

      for (let n: i32 = 0; n < this.context.length; n++) {
        const messageSize = this.context[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x2a);
          encoder.uint32(messageSize);
          this.context[n].encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode WebRequestPayload
  } // WebRequestPayload

  export class EnvVariable {
    public name: string = "";
    public value: string = "";

    // Decodes EnvVariable from an ArrayBuffer
    static decode(buf: ArrayBuffer): EnvVariable {
      return EnvVariable.decodeDataView(new DataView(buf));
    }

    // Decodes EnvVariable from a DataView
    static decodeDataView(view: DataView): EnvVariable {
      const decoder = new __proto.Decoder(view);
      const obj = new EnvVariable();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.name = decoder.string();
            break;
          }
          case 2: {
            obj.value = decoder.string();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode EnvVariable

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.name.length > 0
          ? 1 + __proto.Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size +=
        this.value.length > 0
          ? 1 + __proto.Sizer.varint64(this.value.length) + this.value.length
          : 0;

      return size;
    }

    // Encodes EnvVariable to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes EnvVariable to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.name.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.name.length);
        encoder.string(this.name);
      }
      if (this.value.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.value.length);
        encoder.string(this.value);
      }

      return buf;
    } // encode EnvVariable
  } // EnvVariable

  export class ContextItem {
    public name: string = "";
    public value: string = "";

    // Decodes ContextItem from an ArrayBuffer
    static decode(buf: ArrayBuffer): ContextItem {
      return ContextItem.decodeDataView(new DataView(buf));
    }

    // Decodes ContextItem from a DataView
    static decodeDataView(view: DataView): ContextItem {
      const decoder = new __proto.Decoder(view);
      const obj = new ContextItem();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.name = decoder.string();
            break;
          }
          case 2: {
            obj.value = decoder.string();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode ContextItem

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.name.length > 0
          ? 1 + __proto.Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size +=
        this.value.length > 0
          ? 1 + __proto.Sizer.varint64(this.value.length) + this.value.length
          : 0;

      return size;
    }

    // Encodes ContextItem to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes ContextItem to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.name.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.name.length);
        encoder.string(this.name);
      }
      if (this.value.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.value.length);
        encoder.string(this.value);
      }

      return buf;
    } // encode ContextItem
  } // ContextItem

  export class PluginMessagePayload {
    public message: message.Message = new message.Message();

    // Decodes PluginMessagePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): PluginMessagePayload {
      return PluginMessagePayload.decodeDataView(new DataView(buf));
    }

    // Decodes PluginMessagePayload from a DataView
    static decodeDataView(view: DataView): PluginMessagePayload {
      const decoder = new __proto.Decoder(view);
      const obj = new PluginMessagePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.message = message.Message.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode PluginMessagePayload

    public size(): u32 {
      let size: u32 = 0;

      if (this.message != null) {
        const f: message.Message = this.message as message.Message;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes PluginMessagePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes PluginMessagePayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.message != null) {
        const f = this.message as message.Message;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode PluginMessagePayload
  } // PluginMessagePayload

  export class ResizePayload {
    public resize: resize.Resize = new resize.Resize();

    // Decodes ResizePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): ResizePayload {
      return ResizePayload.decodeDataView(new DataView(buf));
    }

    // Decodes ResizePayload from a DataView
    static decodeDataView(view: DataView): ResizePayload {
      const decoder = new __proto.Decoder(view);
      const obj = new ResizePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.resize = resize.Resize.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode ResizePayload

    public size(): u32 {
      let size: u32 = 0;

      if (this.resize != null) {
        const f: resize.Resize = this.resize as resize.Resize;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes ResizePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes ResizePayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.resize != null) {
        const f = this.resize as resize.Resize;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode ResizePayload
  } // ResizePayload

  export class MovePayload {
    public direction: resize.MoveDirection = new resize.MoveDirection();

    // Decodes MovePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): MovePayload {
      return MovePayload.decodeDataView(new DataView(buf));
    }

    // Decodes MovePayload from a DataView
    static decodeDataView(view: DataView): MovePayload {
      const decoder = new __proto.Decoder(view);
      const obj = new MovePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.direction = resize.MoveDirection.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode MovePayload

    public size(): u32 {
      let size: u32 = 0;

      if (this.direction != null) {
        const f: resize.MoveDirection = this.direction as resize.MoveDirection;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes MovePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes MovePayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.direction != null) {
        const f = this.direction as resize.MoveDirection;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode MovePayload
  } // MovePayload

  export class IdAndNewName {
    // pane id or tab index
    public id: u32;
    public new_name: string = "";

    // Decodes IdAndNewName from an ArrayBuffer
    static decode(buf: ArrayBuffer): IdAndNewName {
      return IdAndNewName.decodeDataView(new DataView(buf));
    }

    // Decodes IdAndNewName from a DataView
    static decodeDataView(view: DataView): IdAndNewName {
      const decoder = new __proto.Decoder(view);
      const obj = new IdAndNewName();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.id = decoder.uint32();
            break;
          }
          case 2: {
            obj.new_name = decoder.string();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode IdAndNewName

    public size(): u32 {
      let size: u32 = 0;

      size += this.id == 0 ? 0 : 1 + __proto.Sizer.uint32(this.id);
      size +=
        this.new_name.length > 0
          ? 1 +
            __proto.Sizer.varint64(this.new_name.length) +
            this.new_name.length
          : 0;

      return size;
    }

    // Encodes IdAndNewName to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes IdAndNewName to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.id != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.id);
      }
      if (this.new_name.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.new_name.length);
        encoder.string(this.new_name);
      }

      return buf;
    } // encode IdAndNewName
  } // IdAndNewName
} // plugin_command

// __size_uint32_repeated_packed

function __size_uint32_repeated_packed(value: Array<u32>): u32 {
  let size: u32 = 0;

  for (let n: i32 = 0; n < value.length; n++) {
    size += __proto.Sizer.uint32(value[n]);
  }

  return size;
}

// __size_string_repeated

function __size_string_repeated(value: Array<string>): u32 {
  let size: u32 = 0;

  for (let n: i32 = 0; n < value.length; n++) {
    size += 1 + __proto.Sizer.varint64(value[n].length) + value[n].length;
  }

  return size;
}
