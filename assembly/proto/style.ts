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
export namespace style {
  export enum ColorType {
    Rgb = 0,
    EightBit = 1,
  } // ColorType
  export enum ThemeHue {
    Dark = 0,
    Light = 1,
  } // ThemeHue
  export class Style {
    public palette: Palette = new Palette();
    public rounded_corners: bool;
    public hide_session_name: bool;

    // Decodes Style from an ArrayBuffer
    static decode(buf: ArrayBuffer): Style {
      return Style.decodeDataView(new DataView(buf));
    }

    // Decodes Style from a DataView
    static decodeDataView(view: DataView): Style {
      const decoder = new __proto.Decoder(view);
      const obj = new Style();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.palette = Palette.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 2: {
            obj.rounded_corners = decoder.bool();
            break;
          }
          case 3: {
            obj.hide_session_name = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode Style

    public size(): u32 {
      let size: u32 = 0;

      if (this.palette != null) {
        const f: Palette = this.palette as Palette;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size += this.rounded_corners == 0 ? 0 : 1 + 1;
      size += this.hide_session_name == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes Style to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Style to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.palette != null) {
        const f = this.palette as Palette;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.rounded_corners != 0) {
        encoder.uint32(0x10);
        encoder.bool(this.rounded_corners);
      }
      if (this.hide_session_name != 0) {
        encoder.uint32(0x18);
        encoder.bool(this.hide_session_name);
      }

      return buf;
    } // encode Style
  } // Style

  export class Palette {
    public theme_hue: u32;
    public fg: Color = new Color();
    public bg: Color = new Color();
    public black: Color = new Color();
    public red: Color = new Color();
    public green: Color = new Color();
    public yellow: Color = new Color();
    public blue: Color = new Color();
    public magenta: Color = new Color();
    public cyan: Color = new Color();
    public white: Color = new Color();
    public orange: Color = new Color();
    public gray: Color = new Color();
    public purple: Color = new Color();
    public gold: Color = new Color();
    public silver: Color = new Color();
    public pink: Color = new Color();
    public brown: Color = new Color();

    // Decodes Palette from an ArrayBuffer
    static decode(buf: ArrayBuffer): Palette {
      return Palette.decodeDataView(new DataView(buf));
    }

    // Decodes Palette from a DataView
    static decodeDataView(view: DataView): Palette {
      const decoder = new __proto.Decoder(view);
      const obj = new Palette();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.theme_hue = decoder.uint32();
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.fg = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 3: {
            const length = decoder.uint32();
            obj.bg = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 4: {
            const length = decoder.uint32();
            obj.black = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 5: {
            const length = decoder.uint32();
            obj.red = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 6: {
            const length = decoder.uint32();
            obj.green = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 7: {
            const length = decoder.uint32();
            obj.yellow = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 8: {
            const length = decoder.uint32();
            obj.blue = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 9: {
            const length = decoder.uint32();
            obj.magenta = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 10: {
            const length = decoder.uint32();
            obj.cyan = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 11: {
            const length = decoder.uint32();
            obj.white = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 12: {
            const length = decoder.uint32();
            obj.orange = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 13: {
            const length = decoder.uint32();
            obj.gray = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 14: {
            const length = decoder.uint32();
            obj.purple = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 15: {
            const length = decoder.uint32();
            obj.gold = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 16: {
            const length = decoder.uint32();
            obj.silver = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 17: {
            const length = decoder.uint32();
            obj.pink = Color.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            break;
          }
          case 18: {
            const length = decoder.uint32();
            obj.brown = Color.decodeDataView(
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
    } // decode Palette

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.theme_hue == 0 ? 0 : 1 + __proto.Sizer.uint32(this.theme_hue);

      if (this.fg != null) {
        const f: Color = this.fg as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.bg != null) {
        const f: Color = this.bg as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.black != null) {
        const f: Color = this.black as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.red != null) {
        const f: Color = this.red as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.green != null) {
        const f: Color = this.green as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.yellow != null) {
        const f: Color = this.yellow as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.blue != null) {
        const f: Color = this.blue as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.magenta != null) {
        const f: Color = this.magenta as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.cyan != null) {
        const f: Color = this.cyan as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.white != null) {
        const f: Color = this.white as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.orange != null) {
        const f: Color = this.orange as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.gray != null) {
        const f: Color = this.gray as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.purple != null) {
        const f: Color = this.purple as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.gold != null) {
        const f: Color = this.gold as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.silver != null) {
        const f: Color = this.silver as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.pink != null) {
        const f: Color = this.pink as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.brown != null) {
        const f: Color = this.brown as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes Palette to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Palette to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.theme_hue != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.theme_hue);
      }

      if (this.fg != null) {
        const f = this.fg as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.bg != null) {
        const f = this.bg as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x1a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.black != null) {
        const f = this.black as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x22);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.red != null) {
        const f = this.red as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x2a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.green != null) {
        const f = this.green as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x32);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.yellow != null) {
        const f = this.yellow as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x3a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.blue != null) {
        const f = this.blue as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x42);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.magenta != null) {
        const f = this.magenta as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x4a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.cyan != null) {
        const f = this.cyan as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x52);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.white != null) {
        const f = this.white as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x5a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.orange != null) {
        const f = this.orange as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x62);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.gray != null) {
        const f = this.gray as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x6a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.purple != null) {
        const f = this.purple as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x72);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.gold != null) {
        const f = this.gold as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x7a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.silver != null) {
        const f = this.silver as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x82);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.pink != null) {
        const f = this.pink as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x8a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.brown != null) {
        const f = this.brown as Color;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x92);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode Palette
  } // Palette

  export class Color {
    public color_type: u32;
    public rgb_color_payload: RgbColorPayload | null;
    public eight_bit_color_payload: u32;

    public __payload: string = "";
    public __payload_index: u8 = 0;

    static readonly PAYLOAD_RGB_COLOR_PAYLOAD_INDEX: u8 = 2;
    static readonly PAYLOAD_EIGHT_BIT_COLOR_PAYLOAD_INDEX: u8 = 3;

    // Decodes Color from an ArrayBuffer
    static decode(buf: ArrayBuffer): Color {
      return Color.decodeDataView(new DataView(buf));
    }

    // Decodes Color from a DataView
    static decodeDataView(view: DataView): Color {
      const decoder = new __proto.Decoder(view);
      const obj = new Color();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.color_type = decoder.uint32();
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.rgb_color_payload = RgbColorPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "rgb_color_payload";
            obj.__payload_index = 2;
            break;
          }
          case 3: {
            obj.eight_bit_color_payload = decoder.uint32();
            obj.__payload = "eight_bit_color_payload";
            obj.__payload_index = 3;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode Color

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.color_type == 0 ? 0 : 1 + __proto.Sizer.uint32(this.color_type);

      if (this.rgb_color_payload != null) {
        const f: RgbColorPayload = this.rgb_color_payload as RgbColorPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + __proto.Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.eight_bit_color_payload == 0
          ? 0
          : 1 + __proto.Sizer.uint32(this.eight_bit_color_payload);

      return size;
    }

    // Encodes Color to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Color to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.color_type != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.color_type);
      }

      if (this.rgb_color_payload != null) {
        const f = this.rgb_color_payload as RgbColorPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.eight_bit_color_payload != 0) {
        encoder.uint32(0x18);
        encoder.uint32(this.eight_bit_color_payload);
      }

      return buf;
    } // encode Color
  } // Color

  export class RgbColorPayload {
    public red: u32;
    public green: u32;
    public blue: u32;

    // Decodes RgbColorPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): RgbColorPayload {
      return RgbColorPayload.decodeDataView(new DataView(buf));
    }

    // Decodes RgbColorPayload from a DataView
    static decodeDataView(view: DataView): RgbColorPayload {
      const decoder = new __proto.Decoder(view);
      const obj = new RgbColorPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.red = decoder.uint32();
            break;
          }
          case 2: {
            obj.green = decoder.uint32();
            break;
          }
          case 3: {
            obj.blue = decoder.uint32();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode RgbColorPayload

    public size(): u32 {
      let size: u32 = 0;

      size += this.red == 0 ? 0 : 1 + __proto.Sizer.uint32(this.red);
      size += this.green == 0 ? 0 : 1 + __proto.Sizer.uint32(this.green);
      size += this.blue == 0 ? 0 : 1 + __proto.Sizer.uint32(this.blue);

      return size;
    }

    // Encodes RgbColorPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes RgbColorPayload to the Array<u8>
    encodeU8Array(
      encoder: __proto.Encoder = new __proto.Encoder(new Array<u8>()),
    ): Array<u8> {
      const buf = encoder.buf;

      if (this.red != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.red);
      }
      if (this.green != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.green);
      }
      if (this.blue != 0) {
        encoder.uint32(0x18);
        encoder.uint32(this.blue);
      }

      return buf;
    } // encode RgbColorPayload
  } // RgbColorPayload
} // style
