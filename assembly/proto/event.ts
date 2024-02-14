import { Encoder, Decoder, Sizer } from "./Encoding";

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
export namespace key {
  export class Key {
    public modifier: u32;
    public key: u32;
    public char: u32;

    public __main_key: string = "";
    public __main_key_index: u8 = 0;

    public ___modifier: string = "";
    public ___modifier_index: u8 = 0;

    static readonly MODIFIER_MODIFIER_INDEX: u8 = 1;
    static readonly MAIN_KEY_KEY_INDEX: u8 = 2;
    static readonly MAIN_KEY_CHAR_INDEX: u8 = 3;

    // Decodes Key from an ArrayBuffer
    static decode(buf: ArrayBuffer): Key {
      return Key.decodeDataView(new DataView(buf));
    }

    // Decodes Key from a DataView
    static decodeDataView(view: DataView): Key {
      const decoder = new Decoder(view);
      const obj = new Key();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.modifier = decoder.uint32();
            obj.___modifier = "modifier";
            obj.___modifier_index = 1;
            break;
          }
          case 2: {
            obj.key = decoder.uint32();
            obj.__main_key = "key";
            obj.__main_key_index = 2;
            break;
          }
          case 3: {
            obj.char = decoder.uint32();
            obj.__main_key = "char";
            obj.__main_key_index = 3;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode Key

    public size(): u32 {
      let size: u32 = 0;

      size += this.modifier == 0 ? 0 : 1 + Sizer.uint32(this.modifier);
      size += this.key == 0 ? 0 : 1 + Sizer.uint32(this.key);
      size += this.char == 0 ? 0 : 1 + Sizer.uint32(this.char);

      return size;
    }

    // Encodes Key to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Key to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.modifier != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.modifier);
      }
      if (this.key != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.key);
      }
      if (this.char != 0) {
        encoder.uint32(0x18);
        encoder.uint32(this.char);
      }

      return buf;
    } // encode Key
  } // Key

  export enum Key_KeyModifier {
    CTRL = 0,
    ALT = 1,
  } // Key_KeyModifier
  export enum Key_NamedKey {
    PageDown = 0,
    PageUp = 1,
    LeftArrow = 2,
    DownArrow = 3,
    UpArrow = 4,
    RightArrow = 5,
    Home = 6,
    End = 7,
    Backspace = 8,
    Delete = 9,
    Insert = 10,
    F1 = 11,
    F2 = 12,
    F3 = 13,
    F4 = 14,
    F5 = 15,
    F6 = 16,
    F7 = 17,
    F8 = 18,
    F9 = 19,
    F10 = 20,
    F11 = 21,
    F12 = 22,
    Tab = 23,
    Esc = 24,
  } // Key_NamedKey
  export enum Key_Char {
    a = 0,
    b = 1,
    c = 2,
    d = 3,
    e = 4,
    f = 5,
    g = 6,
    h = 7,
    i = 8,
    j = 9,
    k = 10,
    l = 11,
    m = 12,
    n = 13,
    o = 14,
    p = 15,
    q = 16,
    r = 17,
    s = 18,
    t = 19,
    u = 20,
    v = 21,
    w = 22,
    x = 23,
    y = 24,
    z = 25,
    zero = 26,
    one = 27,
    two = 28,
    three = 29,
    four = 30,
    five = 31,
    six = 32,
    seven = 33,
    eight = 34,
    nine = 35,
  } // Key_Char
} // key
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
      const decoder = new Decoder(view);
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
          size += 1 + Sizer.varint64(messageSize) + messageSize;
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
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
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
      const decoder = new Decoder(view);
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

      size += this.theme_hue == 0 ? 0 : 1 + Sizer.uint32(this.theme_hue);

      if (this.fg != null) {
        const f: Color = this.fg as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.bg != null) {
        const f: Color = this.bg as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.black != null) {
        const f: Color = this.black as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.red != null) {
        const f: Color = this.red as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.green != null) {
        const f: Color = this.green as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.yellow != null) {
        const f: Color = this.yellow as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.blue != null) {
        const f: Color = this.blue as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.magenta != null) {
        const f: Color = this.magenta as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.cyan != null) {
        const f: Color = this.cyan as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.white != null) {
        const f: Color = this.white as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.orange != null) {
        const f: Color = this.orange as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.gray != null) {
        const f: Color = this.gray as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.purple != null) {
        const f: Color = this.purple as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.gold != null) {
        const f: Color = this.gold as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.silver != null) {
        const f: Color = this.silver as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.pink != null) {
        const f: Color = this.pink as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.brown != null) {
        const f: Color = this.brown as Color;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
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
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
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
      const decoder = new Decoder(view);
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

      size += this.color_type == 0 ? 0 : 1 + Sizer.uint32(this.color_type);

      if (this.rgb_color_payload != null) {
        const f: RgbColorPayload = this.rgb_color_payload as RgbColorPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.eight_bit_color_payload == 0
          ? 0
          : 1 + Sizer.uint32(this.eight_bit_color_payload);

      return size;
    }

    // Encodes Color to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Color to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
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
      const decoder = new Decoder(view);
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

      size += this.red == 0 ? 0 : 1 + Sizer.uint32(this.red);
      size += this.green == 0 ? 0 : 1 + Sizer.uint32(this.green);
      size += this.blue == 0 ? 0 : 1 + Sizer.uint32(this.blue);

      return size;
    }

    // Encodes RgbColorPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes RgbColorPayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
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
      const decoder = new Decoder(view);
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
        this.resize_action == 0 ? 0 : 1 + Sizer.uint32(this.resize_action);
      size += this.direction == 0 ? 0 : 1 + Sizer.uint32(this.direction);

      return size;
    }

    // Encodes Resize to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Resize to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
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
} // resize
export namespace action {
  export enum SearchDirection {
    Up = 0,
    Down = 1,
  } // SearchDirection
  export enum SearchOption {
    CaseSensitivity = 0,
    WholeWord = 1,
    Wrap = 2,
  } // SearchOption
  export enum ActionName {
    Quit = 0,
    Write = 1,
    WriteChars = 2,
    SwitchToMode = 3,
    SwitchModeForAllClients = 4,
    Resize = 5,
    FocusNextPane = 6,
    FocusPreviousPane = 7,
    SwitchFocus = 8,
    MoveFocus = 9,
    MoveFocusOrTab = 10,
    MovePane = 11,
    MovePaneBackwards = 12,
    ClearScreen = 13,
    DumpScreen = 14,
    EditScrollback = 15,
    ScrollUp = 16,
    ScrollUpAt = 17,
    ScrollDown = 18,
    ScrollDownAt = 19,
    ScrollToBottom = 20,
    ScrollToTop = 21,
    PageScrollUp = 22,
    PageScrollDown = 23,
    HalfPageScrollUp = 24,
    HalfPageScrollDown = 25,
    ToggleFocusFullscreen = 26,
    TogglePaneFrames = 27,
    ToggleActiveSyncTab = 28,
    NewPane = 29,
    EditFile = 30,
    NewFloatingPane = 31,
    NewTiledPane = 32,
    TogglePaneEmbedOrFloating = 33,
    ToggleFloatingPanes = 34,
    CloseFocus = 35,
    PaneNameInput = 36,
    UndoRenamePane = 37,
    NewTab = 38,
    NoOp = 39,
    GoToNextTab = 40,
    GoToPreviousTab = 41,
    CloseTab = 42,
    GoToTab = 43,
    GoToTabName = 44,
    ToggleTab = 45,
    TabNameInput = 46,
    UndoRenameTab = 47,
    Run = 48,
    Detach = 49,
    LeftClick = 50,
    RightClick = 51,
    MiddleClick = 52,
    LaunchOrFocusPlugin = 53,
    LeftMouseRelease = 54,
    RightMouseRelease = 55,
    MiddleMouseRelease = 56,
    MouseHoldLeft = 57,
    MouseHoldRight = 58,
    MouseHoldMiddle = 59,
    SearchInput = 60,
    Search = 61,
    SearchToggleOption = 62,
    ToggleMouseMode = 63,
    PreviousSwapLayout = 64,
    NextSwapLayout = 65,
    QueryTabNames = 66,
    NewTiledPluginPane = 67,
    NewFloatingPluginPane = 68,
    StartOrReloadPlugin = 69,
    CloseTerminalPane = 70,
    ClosePluginPane = 71,
    FocusTerminalPaneWithId = 72,
    FocusPluginPaneWithId = 73,
    RenameTerminalPane = 74,
    RenamePluginPane = 75,
    RenameTab = 76,
    BreakPane = 77,
    BreakPaneRight = 78,
    BreakPaneLeft = 79,
    RenameSession = 80,
    LaunchPlugin = 81,
    CliPipe = 82,
  } // ActionName
  export class Action {
    public name: u32;
    public switch_to_mode_payload: SwitchToModePayload | null;
    public write_payload: WritePayload | null;
    public write_chars_payload: WriteCharsPayload | null;
    public switch_mode_for_all_clients_payload: SwitchToModePayload | null;
    public resize_payload: resize.Resize | null;
    public move_focus_payload: u32;
    public move_focus_or_tab_payload: u32;
    public move_pane_payload: MovePanePayload | null;
    public dump_screen_payload: DumpScreenPayload | null;
    public scroll_up_at_payload: ScrollAtPayload | null;
    public scroll_down_at_payload: ScrollAtPayload | null;
    public new_pane_payload: NewPanePayload | null;
    public edit_file_payload: EditFilePayload | null;
    public new_floating_pane_payload: NewFloatingPanePayload | null;
    public new_tiled_pane_payload: NewTiledPanePayload | null;
    public pane_name_input_payload: Array<u8> = new Array<u8>();
    public go_to_tab_payload: u32;
    public go_to_tab_name_payload: GoToTabNamePayload | null;
    public tab_name_input_payload: Array<u8> = new Array<u8>();
    public run_payload: RunCommandAction | null;
    public left_click_payload: Position | null;
    public right_click_payload: Position | null;
    public middle_click_payload: Position | null;
    public launch_or_focus_plugin_payload: LaunchOrFocusPluginPayload | null;
    public left_mouse_release_payload: Position | null;
    public right_mouse_release_payload: Position | null;
    public middle_mouse_release_payload: Position | null;
    public mouse_hold_left_payload: Position | null;
    public mouse_hold_right_payload: Position | null;
    public mouse_hold_middle_payload: Position | null;
    public search_input_payload: Array<u8> = new Array<u8>();
    public search_payload: u32;
    public search_toggle_option_payload: u32;
    public new_tiled_plugin_pane_payload: NewPluginPanePayload | null;
    public new_floating_plugin_pane_payload: NewPluginPanePayload | null;
    public start_or_reload_plugin_payload: string = "";
    public close_terminal_pane_payload: u32;
    public close_plugin_pane_payload: u32;
    public focus_terminal_pane_with_id_payload: PaneIdAndShouldFloat | null;
    public focus_plugin_pane_with_id_payload: PaneIdAndShouldFloat | null;
    public rename_terminal_pane_payload: IdAndName | null;
    public rename_plugin_pane_payload: IdAndName | null;
    public rename_tab_payload: IdAndName | null;
    public rename_session_payload: string = "";
    public launch_plugin_payload: LaunchOrFocusPluginPayload | null;
    public message_payload: CliPipePayload | null;

    public __optional_payload: string = "";
    public __optional_payload_index: u8 = 0;

    static readonly OPTIONAL_PAYLOAD_SWITCH_TO_MODE_PAYLOAD_INDEX: u8 = 2;
    static readonly OPTIONAL_PAYLOAD_WRITE_PAYLOAD_INDEX: u8 = 3;
    static readonly OPTIONAL_PAYLOAD_WRITE_CHARS_PAYLOAD_INDEX: u8 = 4;
    static readonly OPTIONAL_PAYLOAD_SWITCH_MODE_FOR_ALL_CLIENTS_PAYLOAD_INDEX: u8 = 5;
    static readonly OPTIONAL_PAYLOAD_RESIZE_PAYLOAD_INDEX: u8 = 6;
    static readonly OPTIONAL_PAYLOAD_MOVE_FOCUS_PAYLOAD_INDEX: u8 = 7;
    static readonly OPTIONAL_PAYLOAD_MOVE_FOCUS_OR_TAB_PAYLOAD_INDEX: u8 = 8;
    static readonly OPTIONAL_PAYLOAD_MOVE_PANE_PAYLOAD_INDEX: u8 = 9;
    static readonly OPTIONAL_PAYLOAD_DUMP_SCREEN_PAYLOAD_INDEX: u8 = 10;
    static readonly OPTIONAL_PAYLOAD_SCROLL_UP_AT_PAYLOAD_INDEX: u8 = 11;
    static readonly OPTIONAL_PAYLOAD_SCROLL_DOWN_AT_PAYLOAD_INDEX: u8 = 12;
    static readonly OPTIONAL_PAYLOAD_NEW_PANE_PAYLOAD_INDEX: u8 = 13;
    static readonly OPTIONAL_PAYLOAD_EDIT_FILE_PAYLOAD_INDEX: u8 = 14;
    static readonly OPTIONAL_PAYLOAD_NEW_FLOATING_PANE_PAYLOAD_INDEX: u8 = 15;
    static readonly OPTIONAL_PAYLOAD_NEW_TILED_PANE_PAYLOAD_INDEX: u8 = 16;
    static readonly OPTIONAL_PAYLOAD_PANE_NAME_INPUT_PAYLOAD_INDEX: u8 = 17;
    static readonly OPTIONAL_PAYLOAD_GO_TO_TAB_PAYLOAD_INDEX: u8 = 18;
    static readonly OPTIONAL_PAYLOAD_GO_TO_TAB_NAME_PAYLOAD_INDEX: u8 = 19;
    static readonly OPTIONAL_PAYLOAD_TAB_NAME_INPUT_PAYLOAD_INDEX: u8 = 20;
    static readonly OPTIONAL_PAYLOAD_RUN_PAYLOAD_INDEX: u8 = 21;
    static readonly OPTIONAL_PAYLOAD_LEFT_CLICK_PAYLOAD_INDEX: u8 = 22;
    static readonly OPTIONAL_PAYLOAD_RIGHT_CLICK_PAYLOAD_INDEX: u8 = 23;
    static readonly OPTIONAL_PAYLOAD_MIDDLE_CLICK_PAYLOAD_INDEX: u8 = 24;
    static readonly OPTIONAL_PAYLOAD_LAUNCH_OR_FOCUS_PLUGIN_PAYLOAD_INDEX: u8 = 25;
    static readonly OPTIONAL_PAYLOAD_LEFT_MOUSE_RELEASE_PAYLOAD_INDEX: u8 = 26;
    static readonly OPTIONAL_PAYLOAD_RIGHT_MOUSE_RELEASE_PAYLOAD_INDEX: u8 = 27;
    static readonly OPTIONAL_PAYLOAD_MIDDLE_MOUSE_RELEASE_PAYLOAD_INDEX: u8 = 28;
    static readonly OPTIONAL_PAYLOAD_MOUSE_HOLD_LEFT_PAYLOAD_INDEX: u8 = 29;
    static readonly OPTIONAL_PAYLOAD_MOUSE_HOLD_RIGHT_PAYLOAD_INDEX: u8 = 30;
    static readonly OPTIONAL_PAYLOAD_MOUSE_HOLD_MIDDLE_PAYLOAD_INDEX: u8 = 31;
    static readonly OPTIONAL_PAYLOAD_SEARCH_INPUT_PAYLOAD_INDEX: u8 = 32;
    static readonly OPTIONAL_PAYLOAD_SEARCH_PAYLOAD_INDEX: u8 = 33;
    static readonly OPTIONAL_PAYLOAD_SEARCH_TOGGLE_OPTION_PAYLOAD_INDEX: u8 = 34;
    static readonly OPTIONAL_PAYLOAD_NEW_TILED_PLUGIN_PANE_PAYLOAD_INDEX: u8 = 35;
    static readonly OPTIONAL_PAYLOAD_NEW_FLOATING_PLUGIN_PANE_PAYLOAD_INDEX: u8 = 36;
    static readonly OPTIONAL_PAYLOAD_START_OR_RELOAD_PLUGIN_PAYLOAD_INDEX: u8 = 37;
    static readonly OPTIONAL_PAYLOAD_CLOSE_TERMINAL_PANE_PAYLOAD_INDEX: u8 = 38;
    static readonly OPTIONAL_PAYLOAD_CLOSE_PLUGIN_PANE_PAYLOAD_INDEX: u8 = 39;
    static readonly OPTIONAL_PAYLOAD_FOCUS_TERMINAL_PANE_WITH_ID_PAYLOAD_INDEX: u8 = 40;
    static readonly OPTIONAL_PAYLOAD_FOCUS_PLUGIN_PANE_WITH_ID_PAYLOAD_INDEX: u8 = 41;
    static readonly OPTIONAL_PAYLOAD_RENAME_TERMINAL_PANE_PAYLOAD_INDEX: u8 = 42;
    static readonly OPTIONAL_PAYLOAD_RENAME_PLUGIN_PANE_PAYLOAD_INDEX: u8 = 43;
    static readonly OPTIONAL_PAYLOAD_RENAME_TAB_PAYLOAD_INDEX: u8 = 44;
    static readonly OPTIONAL_PAYLOAD_RENAME_SESSION_PAYLOAD_INDEX: u8 = 45;
    static readonly OPTIONAL_PAYLOAD_LAUNCH_PLUGIN_PAYLOAD_INDEX: u8 = 46;
    static readonly OPTIONAL_PAYLOAD_MESSAGE_PAYLOAD_INDEX: u8 = 47;

    // Decodes Action from an ArrayBuffer
    static decode(buf: ArrayBuffer): Action {
      return Action.decodeDataView(new DataView(buf));
    }

    // Decodes Action from a DataView
    static decodeDataView(view: DataView): Action {
      const decoder = new Decoder(view);
      const obj = new Action();

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
            obj.switch_to_mode_payload = SwitchToModePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "switch_to_mode_payload";
            obj.__optional_payload_index = 2;
            break;
          }
          case 3: {
            const length = decoder.uint32();
            obj.write_payload = WritePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "write_payload";
            obj.__optional_payload_index = 3;
            break;
          }
          case 4: {
            const length = decoder.uint32();
            obj.write_chars_payload = WriteCharsPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "write_chars_payload";
            obj.__optional_payload_index = 4;
            break;
          }
          case 5: {
            const length = decoder.uint32();
            obj.switch_mode_for_all_clients_payload =
              SwitchToModePayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__optional_payload = "switch_mode_for_all_clients_payload";
            obj.__optional_payload_index = 5;
            break;
          }
          case 6: {
            const length = decoder.uint32();
            obj.resize_payload = resize.Resize.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "resize_payload";
            obj.__optional_payload_index = 6;
            break;
          }
          case 7: {
            obj.move_focus_payload = decoder.uint32();
            obj.__optional_payload = "move_focus_payload";
            obj.__optional_payload_index = 7;
            break;
          }
          case 8: {
            obj.move_focus_or_tab_payload = decoder.uint32();
            obj.__optional_payload = "move_focus_or_tab_payload";
            obj.__optional_payload_index = 8;
            break;
          }
          case 9: {
            const length = decoder.uint32();
            obj.move_pane_payload = MovePanePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "move_pane_payload";
            obj.__optional_payload_index = 9;
            break;
          }
          case 10: {
            const length = decoder.uint32();
            obj.dump_screen_payload = DumpScreenPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "dump_screen_payload";
            obj.__optional_payload_index = 10;
            break;
          }
          case 11: {
            const length = decoder.uint32();
            obj.scroll_up_at_payload = ScrollAtPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "scroll_up_at_payload";
            obj.__optional_payload_index = 11;
            break;
          }
          case 12: {
            const length = decoder.uint32();
            obj.scroll_down_at_payload = ScrollAtPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "scroll_down_at_payload";
            obj.__optional_payload_index = 12;
            break;
          }
          case 13: {
            const length = decoder.uint32();
            obj.new_pane_payload = NewPanePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "new_pane_payload";
            obj.__optional_payload_index = 13;
            break;
          }
          case 14: {
            const length = decoder.uint32();
            obj.edit_file_payload = EditFilePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "edit_file_payload";
            obj.__optional_payload_index = 14;
            break;
          }
          case 15: {
            const length = decoder.uint32();
            obj.new_floating_pane_payload =
              NewFloatingPanePayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__optional_payload = "new_floating_pane_payload";
            obj.__optional_payload_index = 15;
            break;
          }
          case 16: {
            const length = decoder.uint32();
            obj.new_tiled_pane_payload = NewTiledPanePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "new_tiled_pane_payload";
            obj.__optional_payload_index = 16;
            break;
          }
          case 17: {
            obj.pane_name_input_payload = decoder.bytes();
            obj.__optional_payload = "pane_name_input_payload";
            obj.__optional_payload_index = 17;
            break;
          }
          case 18: {
            obj.go_to_tab_payload = decoder.uint32();
            obj.__optional_payload = "go_to_tab_payload";
            obj.__optional_payload_index = 18;
            break;
          }
          case 19: {
            const length = decoder.uint32();
            obj.go_to_tab_name_payload = GoToTabNamePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "go_to_tab_name_payload";
            obj.__optional_payload_index = 19;
            break;
          }
          case 20: {
            obj.tab_name_input_payload = decoder.bytes();
            obj.__optional_payload = "tab_name_input_payload";
            obj.__optional_payload_index = 20;
            break;
          }
          case 21: {
            const length = decoder.uint32();
            obj.run_payload = RunCommandAction.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "run_payload";
            obj.__optional_payload_index = 21;
            break;
          }
          case 22: {
            const length = decoder.uint32();
            obj.left_click_payload = Position.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "left_click_payload";
            obj.__optional_payload_index = 22;
            break;
          }
          case 23: {
            const length = decoder.uint32();
            obj.right_click_payload = Position.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "right_click_payload";
            obj.__optional_payload_index = 23;
            break;
          }
          case 24: {
            const length = decoder.uint32();
            obj.middle_click_payload = Position.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "middle_click_payload";
            obj.__optional_payload_index = 24;
            break;
          }
          case 25: {
            const length = decoder.uint32();
            obj.launch_or_focus_plugin_payload =
              LaunchOrFocusPluginPayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__optional_payload = "launch_or_focus_plugin_payload";
            obj.__optional_payload_index = 25;
            break;
          }
          case 26: {
            const length = decoder.uint32();
            obj.left_mouse_release_payload = Position.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "left_mouse_release_payload";
            obj.__optional_payload_index = 26;
            break;
          }
          case 27: {
            const length = decoder.uint32();
            obj.right_mouse_release_payload = Position.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "right_mouse_release_payload";
            obj.__optional_payload_index = 27;
            break;
          }
          case 28: {
            const length = decoder.uint32();
            obj.middle_mouse_release_payload = Position.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "middle_mouse_release_payload";
            obj.__optional_payload_index = 28;
            break;
          }
          case 29: {
            const length = decoder.uint32();
            obj.mouse_hold_left_payload = Position.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "mouse_hold_left_payload";
            obj.__optional_payload_index = 29;
            break;
          }
          case 30: {
            const length = decoder.uint32();
            obj.mouse_hold_right_payload = Position.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "mouse_hold_right_payload";
            obj.__optional_payload_index = 30;
            break;
          }
          case 31: {
            const length = decoder.uint32();
            obj.mouse_hold_middle_payload = Position.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "mouse_hold_middle_payload";
            obj.__optional_payload_index = 31;
            break;
          }
          case 32: {
            obj.search_input_payload = decoder.bytes();
            obj.__optional_payload = "search_input_payload";
            obj.__optional_payload_index = 32;
            break;
          }
          case 33: {
            obj.search_payload = decoder.uint32();
            obj.__optional_payload = "search_payload";
            obj.__optional_payload_index = 33;
            break;
          }
          case 34: {
            obj.search_toggle_option_payload = decoder.uint32();
            obj.__optional_payload = "search_toggle_option_payload";
            obj.__optional_payload_index = 34;
            break;
          }
          case 35: {
            const length = decoder.uint32();
            obj.new_tiled_plugin_pane_payload =
              NewPluginPanePayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__optional_payload = "new_tiled_plugin_pane_payload";
            obj.__optional_payload_index = 35;
            break;
          }
          case 36: {
            const length = decoder.uint32();
            obj.new_floating_plugin_pane_payload =
              NewPluginPanePayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__optional_payload = "new_floating_plugin_pane_payload";
            obj.__optional_payload_index = 36;
            break;
          }
          case 37: {
            obj.start_or_reload_plugin_payload = decoder.string();
            obj.__optional_payload = "start_or_reload_plugin_payload";
            obj.__optional_payload_index = 37;
            break;
          }
          case 38: {
            obj.close_terminal_pane_payload = decoder.uint32();
            obj.__optional_payload = "close_terminal_pane_payload";
            obj.__optional_payload_index = 38;
            break;
          }
          case 39: {
            obj.close_plugin_pane_payload = decoder.uint32();
            obj.__optional_payload = "close_plugin_pane_payload";
            obj.__optional_payload_index = 39;
            break;
          }
          case 40: {
            const length = decoder.uint32();
            obj.focus_terminal_pane_with_id_payload =
              PaneIdAndShouldFloat.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__optional_payload = "focus_terminal_pane_with_id_payload";
            obj.__optional_payload_index = 40;
            break;
          }
          case 41: {
            const length = decoder.uint32();
            obj.focus_plugin_pane_with_id_payload =
              PaneIdAndShouldFloat.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__optional_payload = "focus_plugin_pane_with_id_payload";
            obj.__optional_payload_index = 41;
            break;
          }
          case 42: {
            const length = decoder.uint32();
            obj.rename_terminal_pane_payload = IdAndName.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "rename_terminal_pane_payload";
            obj.__optional_payload_index = 42;
            break;
          }
          case 43: {
            const length = decoder.uint32();
            obj.rename_plugin_pane_payload = IdAndName.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "rename_plugin_pane_payload";
            obj.__optional_payload_index = 43;
            break;
          }
          case 44: {
            const length = decoder.uint32();
            obj.rename_tab_payload = IdAndName.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "rename_tab_payload";
            obj.__optional_payload_index = 44;
            break;
          }
          case 45: {
            obj.rename_session_payload = decoder.string();
            obj.__optional_payload = "rename_session_payload";
            obj.__optional_payload_index = 45;
            break;
          }
          case 46: {
            const length = decoder.uint32();
            obj.launch_plugin_payload =
              LaunchOrFocusPluginPayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__optional_payload = "launch_plugin_payload";
            obj.__optional_payload_index = 46;
            break;
          }
          case 47: {
            const length = decoder.uint32();
            obj.message_payload = CliPipePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__optional_payload = "message_payload";
            obj.__optional_payload_index = 47;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode Action

    public size(): u32 {
      let size: u32 = 0;

      size += this.name == 0 ? 0 : 1 + Sizer.uint32(this.name);

      if (this.switch_to_mode_payload != null) {
        const f: SwitchToModePayload = this
          .switch_to_mode_payload as SwitchToModePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.write_payload != null) {
        const f: WritePayload = this.write_payload as WritePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.write_chars_payload != null) {
        const f: WriteCharsPayload = this
          .write_chars_payload as WriteCharsPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.switch_mode_for_all_clients_payload != null) {
        const f: SwitchToModePayload = this
          .switch_mode_for_all_clients_payload as SwitchToModePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.resize_payload != null) {
        const f: resize.Resize = this.resize_payload as resize.Resize;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.move_focus_payload == 0
          ? 0
          : 1 + Sizer.uint32(this.move_focus_payload);
      size +=
        this.move_focus_or_tab_payload == 0
          ? 0
          : 1 + Sizer.uint32(this.move_focus_or_tab_payload);

      if (this.move_pane_payload != null) {
        const f: MovePanePayload = this.move_pane_payload as MovePanePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.dump_screen_payload != null) {
        const f: DumpScreenPayload = this
          .dump_screen_payload as DumpScreenPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.scroll_up_at_payload != null) {
        const f: ScrollAtPayload = this.scroll_up_at_payload as ScrollAtPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.scroll_down_at_payload != null) {
        const f: ScrollAtPayload = this
          .scroll_down_at_payload as ScrollAtPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.new_pane_payload != null) {
        const f: NewPanePayload = this.new_pane_payload as NewPanePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.edit_file_payload != null) {
        const f: EditFilePayload = this.edit_file_payload as EditFilePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.new_floating_pane_payload != null) {
        const f: NewFloatingPanePayload = this
          .new_floating_pane_payload as NewFloatingPanePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.new_tiled_pane_payload != null) {
        const f: NewTiledPanePayload = this
          .new_tiled_pane_payload as NewTiledPanePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.pane_name_input_payload.length > 0
          ? 2 +
            Sizer.varint64(this.pane_name_input_payload.length) +
            this.pane_name_input_payload.length
          : 0;
      size +=
        this.go_to_tab_payload == 0
          ? 0
          : 2 + Sizer.uint32(this.go_to_tab_payload);

      if (this.go_to_tab_name_payload != null) {
        const f: GoToTabNamePayload = this
          .go_to_tab_name_payload as GoToTabNamePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.tab_name_input_payload.length > 0
          ? 2 +
            Sizer.varint64(this.tab_name_input_payload.length) +
            this.tab_name_input_payload.length
          : 0;

      if (this.run_payload != null) {
        const f: RunCommandAction = this.run_payload as RunCommandAction;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.left_click_payload != null) {
        const f: Position = this.left_click_payload as Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.right_click_payload != null) {
        const f: Position = this.right_click_payload as Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.middle_click_payload != null) {
        const f: Position = this.middle_click_payload as Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.launch_or_focus_plugin_payload != null) {
        const f: LaunchOrFocusPluginPayload = this
          .launch_or_focus_plugin_payload as LaunchOrFocusPluginPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.left_mouse_release_payload != null) {
        const f: Position = this.left_mouse_release_payload as Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.right_mouse_release_payload != null) {
        const f: Position = this.right_mouse_release_payload as Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.middle_mouse_release_payload != null) {
        const f: Position = this.middle_mouse_release_payload as Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.mouse_hold_left_payload != null) {
        const f: Position = this.mouse_hold_left_payload as Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.mouse_hold_right_payload != null) {
        const f: Position = this.mouse_hold_right_payload as Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.mouse_hold_middle_payload != null) {
        const f: Position = this.mouse_hold_middle_payload as Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.search_input_payload.length > 0
          ? 2 +
            Sizer.varint64(this.search_input_payload.length) +
            this.search_input_payload.length
          : 0;
      size +=
        this.search_payload == 0 ? 0 : 2 + Sizer.uint32(this.search_payload);
      size +=
        this.search_toggle_option_payload == 0
          ? 0
          : 2 + Sizer.uint32(this.search_toggle_option_payload);

      if (this.new_tiled_plugin_pane_payload != null) {
        const f: NewPluginPanePayload = this
          .new_tiled_plugin_pane_payload as NewPluginPanePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.new_floating_plugin_pane_payload != null) {
        const f: NewPluginPanePayload = this
          .new_floating_plugin_pane_payload as NewPluginPanePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.start_or_reload_plugin_payload.length > 0
          ? 2 +
            Sizer.varint64(this.start_or_reload_plugin_payload.length) +
            this.start_or_reload_plugin_payload.length
          : 0;
      size +=
        this.close_terminal_pane_payload == 0
          ? 0
          : 2 + Sizer.uint32(this.close_terminal_pane_payload);
      size +=
        this.close_plugin_pane_payload == 0
          ? 0
          : 2 + Sizer.uint32(this.close_plugin_pane_payload);

      if (this.focus_terminal_pane_with_id_payload != null) {
        const f: PaneIdAndShouldFloat = this
          .focus_terminal_pane_with_id_payload as PaneIdAndShouldFloat;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.focus_plugin_pane_with_id_payload != null) {
        const f: PaneIdAndShouldFloat = this
          .focus_plugin_pane_with_id_payload as PaneIdAndShouldFloat;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.rename_terminal_pane_payload != null) {
        const f: IdAndName = this.rename_terminal_pane_payload as IdAndName;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.rename_plugin_pane_payload != null) {
        const f: IdAndName = this.rename_plugin_pane_payload as IdAndName;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.rename_tab_payload != null) {
        const f: IdAndName = this.rename_tab_payload as IdAndName;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.rename_session_payload.length > 0
          ? 2 +
            Sizer.varint64(this.rename_session_payload.length) +
            this.rename_session_payload.length
          : 0;

      if (this.launch_plugin_payload != null) {
        const f: LaunchOrFocusPluginPayload = this
          .launch_plugin_payload as LaunchOrFocusPluginPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.message_payload != null) {
        const f: CliPipePayload = this.message_payload as CliPipePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes Action to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Action to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.name != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.name);
      }

      if (this.switch_to_mode_payload != null) {
        const f = this.switch_to_mode_payload as SwitchToModePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.write_payload != null) {
        const f = this.write_payload as WritePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x1a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.write_chars_payload != null) {
        const f = this.write_chars_payload as WriteCharsPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x22);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.switch_mode_for_all_clients_payload != null) {
        const f = this
          .switch_mode_for_all_clients_payload as SwitchToModePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x2a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.resize_payload != null) {
        const f = this.resize_payload as resize.Resize;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x32);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.move_focus_payload != 0) {
        encoder.uint32(0x38);
        encoder.uint32(this.move_focus_payload);
      }
      if (this.move_focus_or_tab_payload != 0) {
        encoder.uint32(0x40);
        encoder.uint32(this.move_focus_or_tab_payload);
      }

      if (this.move_pane_payload != null) {
        const f = this.move_pane_payload as MovePanePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x4a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.dump_screen_payload != null) {
        const f = this.dump_screen_payload as DumpScreenPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x52);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.scroll_up_at_payload != null) {
        const f = this.scroll_up_at_payload as ScrollAtPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x5a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.scroll_down_at_payload != null) {
        const f = this.scroll_down_at_payload as ScrollAtPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x62);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.new_pane_payload != null) {
        const f = this.new_pane_payload as NewPanePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x6a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.edit_file_payload != null) {
        const f = this.edit_file_payload as EditFilePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x72);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.new_floating_pane_payload != null) {
        const f = this.new_floating_pane_payload as NewFloatingPanePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x7a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.new_tiled_pane_payload != null) {
        const f = this.new_tiled_pane_payload as NewTiledPanePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x82);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.pane_name_input_payload.length > 0) {
        encoder.uint32(0x8a);
        encoder.uint32(this.pane_name_input_payload.length);
        encoder.bytes(this.pane_name_input_payload);
      }
      if (this.go_to_tab_payload != 0) {
        encoder.uint32(0x90);
        encoder.uint32(this.go_to_tab_payload);
      }

      if (this.go_to_tab_name_payload != null) {
        const f = this.go_to_tab_name_payload as GoToTabNamePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x9a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.tab_name_input_payload.length > 0) {
        encoder.uint32(0xa2);
        encoder.uint32(this.tab_name_input_payload.length);
        encoder.bytes(this.tab_name_input_payload);
      }

      if (this.run_payload != null) {
        const f = this.run_payload as RunCommandAction;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xaa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.left_click_payload != null) {
        const f = this.left_click_payload as Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xb2);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.right_click_payload != null) {
        const f = this.right_click_payload as Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xba);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.middle_click_payload != null) {
        const f = this.middle_click_payload as Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xc2);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.launch_or_focus_plugin_payload != null) {
        const f = this
          .launch_or_focus_plugin_payload as LaunchOrFocusPluginPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xca);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.left_mouse_release_payload != null) {
        const f = this.left_mouse_release_payload as Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xd2);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.right_mouse_release_payload != null) {
        const f = this.right_mouse_release_payload as Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xda);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.middle_mouse_release_payload != null) {
        const f = this.middle_mouse_release_payload as Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xe2);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.mouse_hold_left_payload != null) {
        const f = this.mouse_hold_left_payload as Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xea);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.mouse_hold_right_payload != null) {
        const f = this.mouse_hold_right_payload as Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xf2);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.mouse_hold_middle_payload != null) {
        const f = this.mouse_hold_middle_payload as Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xfa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.search_input_payload.length > 0) {
        encoder.uint32(0x102);
        encoder.uint32(this.search_input_payload.length);
        encoder.bytes(this.search_input_payload);
      }
      if (this.search_payload != 0) {
        encoder.uint32(0x108);
        encoder.uint32(this.search_payload);
      }
      if (this.search_toggle_option_payload != 0) {
        encoder.uint32(0x110);
        encoder.uint32(this.search_toggle_option_payload);
      }

      if (this.new_tiled_plugin_pane_payload != null) {
        const f = this.new_tiled_plugin_pane_payload as NewPluginPanePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x11a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.new_floating_plugin_pane_payload != null) {
        const f = this.new_floating_plugin_pane_payload as NewPluginPanePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x122);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.start_or_reload_plugin_payload.length > 0) {
        encoder.uint32(0x12a);
        encoder.uint32(this.start_or_reload_plugin_payload.length);
        encoder.string(this.start_or_reload_plugin_payload);
      }
      if (this.close_terminal_pane_payload != 0) {
        encoder.uint32(0x130);
        encoder.uint32(this.close_terminal_pane_payload);
      }
      if (this.close_plugin_pane_payload != 0) {
        encoder.uint32(0x138);
        encoder.uint32(this.close_plugin_pane_payload);
      }

      if (this.focus_terminal_pane_with_id_payload != null) {
        const f = this
          .focus_terminal_pane_with_id_payload as PaneIdAndShouldFloat;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x142);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.focus_plugin_pane_with_id_payload != null) {
        const f = this
          .focus_plugin_pane_with_id_payload as PaneIdAndShouldFloat;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x14a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.rename_terminal_pane_payload != null) {
        const f = this.rename_terminal_pane_payload as IdAndName;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x152);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.rename_plugin_pane_payload != null) {
        const f = this.rename_plugin_pane_payload as IdAndName;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x15a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.rename_tab_payload != null) {
        const f = this.rename_tab_payload as IdAndName;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x162);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.rename_session_payload.length > 0) {
        encoder.uint32(0x16a);
        encoder.uint32(this.rename_session_payload.length);
        encoder.string(this.rename_session_payload);
      }

      if (this.launch_plugin_payload != null) {
        const f = this.launch_plugin_payload as LaunchOrFocusPluginPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x172);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.message_payload != null) {
        const f = this.message_payload as CliPipePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x17a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode Action
  } // Action

  export class CliPipePayload {
    public name: string = "";
    public payload: string = "";
    public args: Array<NameAndValue> = new Array<NameAndValue>();
    public plugin: string = "";

    public ___name: string = "";
    public ___name_index: u8 = 0;

    public ___plugin: string = "";
    public ___plugin_index: u8 = 0;

    static readonly NAME_NAME_INDEX: u8 = 1;
    static readonly PLUGIN_PLUGIN_INDEX: u8 = 4;

    // Decodes CliPipePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): CliPipePayload {
      return CliPipePayload.decodeDataView(new DataView(buf));
    }

    // Decodes CliPipePayload from a DataView
    static decodeDataView(view: DataView): CliPipePayload {
      const decoder = new Decoder(view);
      const obj = new CliPipePayload();

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
            obj.payload = decoder.string();
            break;
          }
          case 3: {
            const length = decoder.uint32();
            obj.args.push(
              NameAndValue.decodeDataView(
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
            obj.plugin = decoder.string();
            obj.___plugin = "plugin";
            obj.___plugin_index = 4;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode CliPipePayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.name.length > 0
          ? 1 + Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size +=
        this.payload.length > 0
          ? 1 + Sizer.varint64(this.payload.length) + this.payload.length
          : 0;

      for (let n: i32 = 0; n < this.args.length; n++) {
        const messageSize = this.args[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.plugin.length > 0
          ? 1 + Sizer.varint64(this.plugin.length) + this.plugin.length
          : 0;

      return size;
    }

    // Encodes CliPipePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes CliPipePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
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

      for (let n: i32 = 0; n < this.args.length; n++) {
        const messageSize = this.args[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x1a);
          encoder.uint32(messageSize);
          this.args[n].encodeU8Array(encoder);
        }
      }

      if (this.plugin.length > 0) {
        encoder.uint32(0x22);
        encoder.uint32(this.plugin.length);
        encoder.string(this.plugin);
      }

      return buf;
    } // encode CliPipePayload
  } // CliPipePayload

  export class IdAndName {
    public name: Array<u8> = new Array<u8>();
    public id: u32;

    // Decodes IdAndName from an ArrayBuffer
    static decode(buf: ArrayBuffer): IdAndName {
      return IdAndName.decodeDataView(new DataView(buf));
    }

    // Decodes IdAndName from a DataView
    static decodeDataView(view: DataView): IdAndName {
      const decoder = new Decoder(view);
      const obj = new IdAndName();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.name = decoder.bytes();
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
    } // decode IdAndName

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.name.length > 0
          ? 1 + Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size += this.id == 0 ? 0 : 1 + Sizer.uint32(this.id);

      return size;
    }

    // Encodes IdAndName to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes IdAndName to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.name.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.name.length);
        encoder.bytes(this.name);
      }
      if (this.id != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.id);
      }

      return buf;
    } // encode IdAndName
  } // IdAndName

  export class PaneIdAndShouldFloat {
    public pane_id: u32;
    public should_float: bool;

    // Decodes PaneIdAndShouldFloat from an ArrayBuffer
    static decode(buf: ArrayBuffer): PaneIdAndShouldFloat {
      return PaneIdAndShouldFloat.decodeDataView(new DataView(buf));
    }

    // Decodes PaneIdAndShouldFloat from a DataView
    static decodeDataView(view: DataView): PaneIdAndShouldFloat {
      const decoder = new Decoder(view);
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

      size += this.pane_id == 0 ? 0 : 1 + Sizer.uint32(this.pane_id);
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
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
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

  export class NewPluginPanePayload {
    public plugin_url: string = "";
    public pane_name: string = "";
    public skip_plugin_cache: bool;

    public ___pane_name: string = "";
    public ___pane_name_index: u8 = 0;

    static readonly PANE_NAME_PANE_NAME_INDEX: u8 = 2;

    // Decodes NewPluginPanePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): NewPluginPanePayload {
      return NewPluginPanePayload.decodeDataView(new DataView(buf));
    }

    // Decodes NewPluginPanePayload from a DataView
    static decodeDataView(view: DataView): NewPluginPanePayload {
      const decoder = new Decoder(view);
      const obj = new NewPluginPanePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.plugin_url = decoder.string();
            break;
          }
          case 2: {
            obj.pane_name = decoder.string();
            obj.___pane_name = "pane_name";
            obj.___pane_name_index = 2;
            break;
          }
          case 3: {
            obj.skip_plugin_cache = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode NewPluginPanePayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.plugin_url.length > 0
          ? 1 + Sizer.varint64(this.plugin_url.length) + this.plugin_url.length
          : 0;
      size +=
        this.pane_name.length > 0
          ? 1 + Sizer.varint64(this.pane_name.length) + this.pane_name.length
          : 0;
      size += this.skip_plugin_cache == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes NewPluginPanePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes NewPluginPanePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.plugin_url.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.plugin_url.length);
        encoder.string(this.plugin_url);
      }
      if (this.pane_name.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.pane_name.length);
        encoder.string(this.pane_name);
      }
      if (this.skip_plugin_cache != 0) {
        encoder.uint32(0x18);
        encoder.bool(this.skip_plugin_cache);
      }

      return buf;
    } // encode NewPluginPanePayload
  } // NewPluginPanePayload

  export class LaunchOrFocusPluginPayload {
    public plugin_url: string = "";
    public should_float: bool;
    public plugin_configuration: PluginConfiguration | null;
    public move_to_focused_tab: bool;
    public should_open_in_place: bool;
    public skip_plugin_cache: bool;

    public ___plugin_configuration: string = "";
    public ___plugin_configuration_index: u8 = 0;

    static readonly PLUGIN_CONFIGURATION_PLUGIN_CONFIGURATION_INDEX: u8 = 3;

    // Decodes LaunchOrFocusPluginPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): LaunchOrFocusPluginPayload {
      return LaunchOrFocusPluginPayload.decodeDataView(new DataView(buf));
    }

    // Decodes LaunchOrFocusPluginPayload from a DataView
    static decodeDataView(view: DataView): LaunchOrFocusPluginPayload {
      const decoder = new Decoder(view);
      const obj = new LaunchOrFocusPluginPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.plugin_url = decoder.string();
            break;
          }
          case 2: {
            obj.should_float = decoder.bool();
            break;
          }
          case 3: {
            const length = decoder.uint32();
            obj.plugin_configuration = PluginConfiguration.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.___plugin_configuration = "plugin_configuration";
            obj.___plugin_configuration_index = 3;
            break;
          }
          case 4: {
            obj.move_to_focused_tab = decoder.bool();
            break;
          }
          case 5: {
            obj.should_open_in_place = decoder.bool();
            break;
          }
          case 6: {
            obj.skip_plugin_cache = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode LaunchOrFocusPluginPayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.plugin_url.length > 0
          ? 1 + Sizer.varint64(this.plugin_url.length) + this.plugin_url.length
          : 0;
      size += this.should_float == 0 ? 0 : 1 + 1;

      if (this.plugin_configuration != null) {
        const f: PluginConfiguration = this
          .plugin_configuration as PluginConfiguration;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size += this.move_to_focused_tab == 0 ? 0 : 1 + 1;
      size += this.should_open_in_place == 0 ? 0 : 1 + 1;
      size += this.skip_plugin_cache == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes LaunchOrFocusPluginPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes LaunchOrFocusPluginPayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.plugin_url.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.plugin_url.length);
        encoder.string(this.plugin_url);
      }
      if (this.should_float != 0) {
        encoder.uint32(0x10);
        encoder.bool(this.should_float);
      }

      if (this.plugin_configuration != null) {
        const f = this.plugin_configuration as PluginConfiguration;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x1a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.move_to_focused_tab != 0) {
        encoder.uint32(0x20);
        encoder.bool(this.move_to_focused_tab);
      }
      if (this.should_open_in_place != 0) {
        encoder.uint32(0x28);
        encoder.bool(this.should_open_in_place);
      }
      if (this.skip_plugin_cache != 0) {
        encoder.uint32(0x30);
        encoder.bool(this.skip_plugin_cache);
      }

      return buf;
    } // encode LaunchOrFocusPluginPayload
  } // LaunchOrFocusPluginPayload

  export class GoToTabNamePayload {
    public tab_name: string = "";
    public create: bool;

    // Decodes GoToTabNamePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): GoToTabNamePayload {
      return GoToTabNamePayload.decodeDataView(new DataView(buf));
    }

    // Decodes GoToTabNamePayload from a DataView
    static decodeDataView(view: DataView): GoToTabNamePayload {
      const decoder = new Decoder(view);
      const obj = new GoToTabNamePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.tab_name = decoder.string();
            break;
          }
          case 2: {
            obj.create = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode GoToTabNamePayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.tab_name.length > 0
          ? 1 + Sizer.varint64(this.tab_name.length) + this.tab_name.length
          : 0;
      size += this.create == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes GoToTabNamePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes GoToTabNamePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.tab_name.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.tab_name.length);
        encoder.string(this.tab_name);
      }
      if (this.create != 0) {
        encoder.uint32(0x10);
        encoder.bool(this.create);
      }

      return buf;
    } // encode GoToTabNamePayload
  } // GoToTabNamePayload

  export class NewFloatingPanePayload {
    public command: RunCommandAction | null;

    public ___command: string = "";
    public ___command_index: u8 = 0;

    static readonly COMMAND_COMMAND_INDEX: u8 = 1;

    // Decodes NewFloatingPanePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): NewFloatingPanePayload {
      return NewFloatingPanePayload.decodeDataView(new DataView(buf));
    }

    // Decodes NewFloatingPanePayload from a DataView
    static decodeDataView(view: DataView): NewFloatingPanePayload {
      const decoder = new Decoder(view);
      const obj = new NewFloatingPanePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.command = RunCommandAction.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.___command = "command";
            obj.___command_index = 1;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode NewFloatingPanePayload

    public size(): u32 {
      let size: u32 = 0;

      if (this.command != null) {
        const f: RunCommandAction = this.command as RunCommandAction;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes NewFloatingPanePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes NewFloatingPanePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.command != null) {
        const f = this.command as RunCommandAction;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode NewFloatingPanePayload
  } // NewFloatingPanePayload

  export class NewTiledPanePayload {
    public command: RunCommandAction | null;
    public direction: u32;

    public ___command: string = "";
    public ___command_index: u8 = 0;

    public ___direction: string = "";
    public ___direction_index: u8 = 0;

    static readonly COMMAND_COMMAND_INDEX: u8 = 1;
    static readonly DIRECTION_DIRECTION_INDEX: u8 = 2;

    // Decodes NewTiledPanePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): NewTiledPanePayload {
      return NewTiledPanePayload.decodeDataView(new DataView(buf));
    }

    // Decodes NewTiledPanePayload from a DataView
    static decodeDataView(view: DataView): NewTiledPanePayload {
      const decoder = new Decoder(view);
      const obj = new NewTiledPanePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.command = RunCommandAction.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.___command = "command";
            obj.___command_index = 1;
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
    } // decode NewTiledPanePayload

    public size(): u32 {
      let size: u32 = 0;

      if (this.command != null) {
        const f: RunCommandAction = this.command as RunCommandAction;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size += this.direction == 0 ? 0 : 1 + Sizer.uint32(this.direction);

      return size;
    }

    // Encodes NewTiledPanePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes NewTiledPanePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.command != null) {
        const f = this.command as RunCommandAction;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.direction != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.direction);
      }

      return buf;
    } // encode NewTiledPanePayload
  } // NewTiledPanePayload

  export class MovePanePayload {
    public direction: u32;

    public ___direction: string = "";
    public ___direction_index: u8 = 0;

    static readonly DIRECTION_DIRECTION_INDEX: u8 = 1;

    // Decodes MovePanePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): MovePanePayload {
      return MovePanePayload.decodeDataView(new DataView(buf));
    }

    // Decodes MovePanePayload from a DataView
    static decodeDataView(view: DataView): MovePanePayload {
      const decoder = new Decoder(view);
      const obj = new MovePanePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.direction = decoder.uint32();
            obj.___direction = "direction";
            obj.___direction_index = 1;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode MovePanePayload

    public size(): u32 {
      let size: u32 = 0;

      size += this.direction == 0 ? 0 : 1 + Sizer.uint32(this.direction);

      return size;
    }

    // Encodes MovePanePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes MovePanePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.direction != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.direction);
      }

      return buf;
    } // encode MovePanePayload
  } // MovePanePayload

  export class EditFilePayload {
    public file_to_edit: string = "";
    public line_number: u32;
    public cwd: string = "";
    public direction: u32;
    public should_float: bool;

    public ___line_number: string = "";
    public ___line_number_index: u8 = 0;

    public ___cwd: string = "";
    public ___cwd_index: u8 = 0;

    public ___direction: string = "";
    public ___direction_index: u8 = 0;

    static readonly LINE_NUMBER_LINE_NUMBER_INDEX: u8 = 2;
    static readonly CWD_CWD_INDEX: u8 = 3;
    static readonly DIRECTION_DIRECTION_INDEX: u8 = 4;

    // Decodes EditFilePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): EditFilePayload {
      return EditFilePayload.decodeDataView(new DataView(buf));
    }

    // Decodes EditFilePayload from a DataView
    static decodeDataView(view: DataView): EditFilePayload {
      const decoder = new Decoder(view);
      const obj = new EditFilePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.file_to_edit = decoder.string();
            break;
          }
          case 2: {
            obj.line_number = decoder.uint32();
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
          case 4: {
            obj.direction = decoder.uint32();
            obj.___direction = "direction";
            obj.___direction_index = 4;
            break;
          }
          case 5: {
            obj.should_float = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode EditFilePayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.file_to_edit.length > 0
          ? 1 +
            Sizer.varint64(this.file_to_edit.length) +
            this.file_to_edit.length
          : 0;
      size += this.line_number == 0 ? 0 : 1 + Sizer.uint32(this.line_number);
      size +=
        this.cwd.length > 0
          ? 1 + Sizer.varint64(this.cwd.length) + this.cwd.length
          : 0;
      size += this.direction == 0 ? 0 : 1 + Sizer.uint32(this.direction);
      size += this.should_float == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes EditFilePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes EditFilePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.file_to_edit.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.file_to_edit.length);
        encoder.string(this.file_to_edit);
      }
      if (this.line_number != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.line_number);
      }
      if (this.cwd.length > 0) {
        encoder.uint32(0x1a);
        encoder.uint32(this.cwd.length);
        encoder.string(this.cwd);
      }
      if (this.direction != 0) {
        encoder.uint32(0x20);
        encoder.uint32(this.direction);
      }
      if (this.should_float != 0) {
        encoder.uint32(0x28);
        encoder.bool(this.should_float);
      }

      return buf;
    } // encode EditFilePayload
  } // EditFilePayload

  export class ScrollAtPayload {
    public position: Position = new Position();

    // Decodes ScrollAtPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): ScrollAtPayload {
      return ScrollAtPayload.decodeDataView(new DataView(buf));
    }

    // Decodes ScrollAtPayload from a DataView
    static decodeDataView(view: DataView): ScrollAtPayload {
      const decoder = new Decoder(view);
      const obj = new ScrollAtPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.position = Position.decodeDataView(
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
    } // decode ScrollAtPayload

    public size(): u32 {
      let size: u32 = 0;

      if (this.position != null) {
        const f: Position = this.position as Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes ScrollAtPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes ScrollAtPayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.position != null) {
        const f = this.position as Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode ScrollAtPayload
  } // ScrollAtPayload

  export class NewPanePayload {
    public direction: u32;
    public pane_name: string = "";

    public ___direction: string = "";
    public ___direction_index: u8 = 0;

    public ___pane_name: string = "";
    public ___pane_name_index: u8 = 0;

    static readonly DIRECTION_DIRECTION_INDEX: u8 = 1;
    static readonly PANE_NAME_PANE_NAME_INDEX: u8 = 2;

    // Decodes NewPanePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): NewPanePayload {
      return NewPanePayload.decodeDataView(new DataView(buf));
    }

    // Decodes NewPanePayload from a DataView
    static decodeDataView(view: DataView): NewPanePayload {
      const decoder = new Decoder(view);
      const obj = new NewPanePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.direction = decoder.uint32();
            obj.___direction = "direction";
            obj.___direction_index = 1;
            break;
          }
          case 2: {
            obj.pane_name = decoder.string();
            obj.___pane_name = "pane_name";
            obj.___pane_name_index = 2;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode NewPanePayload

    public size(): u32 {
      let size: u32 = 0;

      size += this.direction == 0 ? 0 : 1 + Sizer.uint32(this.direction);
      size +=
        this.pane_name.length > 0
          ? 1 + Sizer.varint64(this.pane_name.length) + this.pane_name.length
          : 0;

      return size;
    }

    // Encodes NewPanePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes NewPanePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.direction != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.direction);
      }
      if (this.pane_name.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.pane_name.length);
        encoder.string(this.pane_name);
      }

      return buf;
    } // encode NewPanePayload
  } // NewPanePayload

  export class SwitchToModePayload {
    public input_mode: u32;

    // Decodes SwitchToModePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): SwitchToModePayload {
      return SwitchToModePayload.decodeDataView(new DataView(buf));
    }

    // Decodes SwitchToModePayload from a DataView
    static decodeDataView(view: DataView): SwitchToModePayload {
      const decoder = new Decoder(view);
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

      size += this.input_mode == 0 ? 0 : 1 + Sizer.uint32(this.input_mode);

      return size;
    }

    // Encodes SwitchToModePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes SwitchToModePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.input_mode != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.input_mode);
      }

      return buf;
    } // encode SwitchToModePayload
  } // SwitchToModePayload

  export class WritePayload {
    public bytes_to_write: Array<u8> = new Array<u8>();

    // Decodes WritePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): WritePayload {
      return WritePayload.decodeDataView(new DataView(buf));
    }

    // Decodes WritePayload from a DataView
    static decodeDataView(view: DataView): WritePayload {
      const decoder = new Decoder(view);
      const obj = new WritePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.bytes_to_write = decoder.bytes();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode WritePayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.bytes_to_write.length > 0
          ? 1 +
            Sizer.varint64(this.bytes_to_write.length) +
            this.bytes_to_write.length
          : 0;

      return size;
    }

    // Encodes WritePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes WritePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.bytes_to_write.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.bytes_to_write.length);
        encoder.bytes(this.bytes_to_write);
      }

      return buf;
    } // encode WritePayload
  } // WritePayload

  export class WriteCharsPayload {
    public chars: string = "";

    // Decodes WriteCharsPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): WriteCharsPayload {
      return WriteCharsPayload.decodeDataView(new DataView(buf));
    }

    // Decodes WriteCharsPayload from a DataView
    static decodeDataView(view: DataView): WriteCharsPayload {
      const decoder = new Decoder(view);
      const obj = new WriteCharsPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.chars = decoder.string();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode WriteCharsPayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.chars.length > 0
          ? 1 + Sizer.varint64(this.chars.length) + this.chars.length
          : 0;

      return size;
    }

    // Encodes WriteCharsPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes WriteCharsPayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.chars.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.chars.length);
        encoder.string(this.chars);
      }

      return buf;
    } // encode WriteCharsPayload
  } // WriteCharsPayload

  export class DumpScreenPayload {
    public file_path: string = "";
    public include_scrollback: bool;

    // Decodes DumpScreenPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): DumpScreenPayload {
      return DumpScreenPayload.decodeDataView(new DataView(buf));
    }

    // Decodes DumpScreenPayload from a DataView
    static decodeDataView(view: DataView): DumpScreenPayload {
      const decoder = new Decoder(view);
      const obj = new DumpScreenPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.file_path = decoder.string();
            break;
          }
          case 2: {
            obj.include_scrollback = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode DumpScreenPayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.file_path.length > 0
          ? 1 + Sizer.varint64(this.file_path.length) + this.file_path.length
          : 0;
      size += this.include_scrollback == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes DumpScreenPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes DumpScreenPayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.file_path.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.file_path.length);
        encoder.string(this.file_path);
      }
      if (this.include_scrollback != 0) {
        encoder.uint32(0x10);
        encoder.bool(this.include_scrollback);
      }

      return buf;
    } // encode DumpScreenPayload
  } // DumpScreenPayload

  export class Position {
    public line: i64;
    public column: i64;

    // Decodes Position from an ArrayBuffer
    static decode(buf: ArrayBuffer): Position {
      return Position.decodeDataView(new DataView(buf));
    }

    // Decodes Position from a DataView
    static decodeDataView(view: DataView): Position {
      const decoder = new Decoder(view);
      const obj = new Position();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.line = decoder.int64();
            break;
          }
          case 2: {
            obj.column = decoder.int64();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode Position

    public size(): u32 {
      let size: u32 = 0;

      size += this.line == 0 ? 0 : 1 + Sizer.int64(this.line);
      size += this.column == 0 ? 0 : 1 + Sizer.int64(this.column);

      return size;
    }

    // Encodes Position to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Position to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.line != 0) {
        encoder.uint32(0x8);
        encoder.int64(this.line);
      }
      if (this.column != 0) {
        encoder.uint32(0x10);
        encoder.int64(this.column);
      }

      return buf;
    } // encode Position
  } // Position

  export class RunCommandAction {
    public command: string = "";
    public args: Array<string> = new Array<string>();
    public cwd: string = "";
    public direction: u32;
    public pane_name: string = "";
    public hold_on_close: bool;
    public hold_on_start: bool;

    public ___cwd: string = "";
    public ___cwd_index: u8 = 0;

    public ___direction: string = "";
    public ___direction_index: u8 = 0;

    public ___pane_name: string = "";
    public ___pane_name_index: u8 = 0;

    static readonly CWD_CWD_INDEX: u8 = 3;
    static readonly DIRECTION_DIRECTION_INDEX: u8 = 4;
    static readonly PANE_NAME_PANE_NAME_INDEX: u8 = 5;

    // Decodes RunCommandAction from an ArrayBuffer
    static decode(buf: ArrayBuffer): RunCommandAction {
      return RunCommandAction.decodeDataView(new DataView(buf));
    }

    // Decodes RunCommandAction from a DataView
    static decodeDataView(view: DataView): RunCommandAction {
      const decoder = new Decoder(view);
      const obj = new RunCommandAction();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.command = decoder.string();
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
          case 4: {
            obj.direction = decoder.uint32();
            obj.___direction = "direction";
            obj.___direction_index = 4;
            break;
          }
          case 5: {
            obj.pane_name = decoder.string();
            obj.___pane_name = "pane_name";
            obj.___pane_name_index = 5;
            break;
          }
          case 6: {
            obj.hold_on_close = decoder.bool();
            break;
          }
          case 7: {
            obj.hold_on_start = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode RunCommandAction

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.command.length > 0
          ? 1 + Sizer.varint64(this.command.length) + this.command.length
          : 0;

      size += __size_string_repeated(this.args);

      size +=
        this.cwd.length > 0
          ? 1 + Sizer.varint64(this.cwd.length) + this.cwd.length
          : 0;
      size += this.direction == 0 ? 0 : 1 + Sizer.uint32(this.direction);
      size +=
        this.pane_name.length > 0
          ? 1 + Sizer.varint64(this.pane_name.length) + this.pane_name.length
          : 0;
      size += this.hold_on_close == 0 ? 0 : 1 + 1;
      size += this.hold_on_start == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes RunCommandAction to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes RunCommandAction to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.command.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.command.length);
        encoder.string(this.command);
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
      if (this.direction != 0) {
        encoder.uint32(0x20);
        encoder.uint32(this.direction);
      }
      if (this.pane_name.length > 0) {
        encoder.uint32(0x2a);
        encoder.uint32(this.pane_name.length);
        encoder.string(this.pane_name);
      }
      if (this.hold_on_close != 0) {
        encoder.uint32(0x30);
        encoder.bool(this.hold_on_close);
      }
      if (this.hold_on_start != 0) {
        encoder.uint32(0x38);
        encoder.bool(this.hold_on_start);
      }

      return buf;
    } // encode RunCommandAction
  } // RunCommandAction

  export class PluginConfiguration {
    public name_and_value: Array<NameAndValue> = new Array<NameAndValue>();

    // Decodes PluginConfiguration from an ArrayBuffer
    static decode(buf: ArrayBuffer): PluginConfiguration {
      return PluginConfiguration.decodeDataView(new DataView(buf));
    }

    // Decodes PluginConfiguration from a DataView
    static decodeDataView(view: DataView): PluginConfiguration {
      const decoder = new Decoder(view);
      const obj = new PluginConfiguration();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.name_and_value.push(
              NameAndValue.decodeDataView(
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
    } // decode PluginConfiguration

    public size(): u32 {
      let size: u32 = 0;

      for (let n: i32 = 0; n < this.name_and_value.length; n++) {
        const messageSize = this.name_and_value[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes PluginConfiguration to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes PluginConfiguration to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      for (let n: i32 = 0; n < this.name_and_value.length; n++) {
        const messageSize = this.name_and_value[n].size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          this.name_and_value[n].encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode PluginConfiguration
  } // PluginConfiguration

  export class NameAndValue {
    public name: string = "";
    public value: string = "";

    // Decodes NameAndValue from an ArrayBuffer
    static decode(buf: ArrayBuffer): NameAndValue {
      return NameAndValue.decodeDataView(new DataView(buf));
    }

    // Decodes NameAndValue from a DataView
    static decodeDataView(view: DataView): NameAndValue {
      const decoder = new Decoder(view);
      const obj = new NameAndValue();

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
    } // decode NameAndValue

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.name.length > 0
          ? 1 + Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size +=
        this.value.length > 0
          ? 1 + Sizer.varint64(this.value.length) + this.value.length
          : 0;

      return size;
    }

    // Encodes NameAndValue to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes NameAndValue to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
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
    } // encode NameAndValue
  } // NameAndValue
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
  export enum CopyDestination {
    Command = 0,
    Primary = 1,
    System = 2,
  } // CopyDestination
  export enum MouseEventName {
    MouseScrollUp = 0,
    MouseScrollDown = 1,
    MouseLeftClick = 2,
    MouseRightClick = 3,
    MouseHold = 4,
    MouseRelease = 5,
  } // MouseEventName
  export class EventNameList {
    public event_types: Array<u32> = new Array<u32>();

    // Decodes EventNameList from an ArrayBuffer
    static decode(buf: ArrayBuffer): EventNameList {
      return EventNameList.decodeDataView(new DataView(buf));
    }

    // Decodes EventNameList from a DataView
    static decodeDataView(view: DataView): EventNameList {
      const decoder = new Decoder(view);
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
          size += 1 + Sizer.varint64(packedSize) + packedSize;
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
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
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

  export class Event {
    public name: u32;
    public mode_update_payload: ModeUpdatePayload | null;
    public tab_update_payload: TabUpdatePayload | null;
    public pane_update_payload: PaneUpdatePayload | null;
    public key_payload: key.Key | null;
    public mouse_event_payload: MouseEventPayload | null;
    public timer_payload: f32;
    public copy_to_clipboard_payload: u32;
    public visible_payload: bool;
    public custom_message_payload: CustomMessagePayload | null;
    public file_list_payload: FileListPayload | null;
    public permission_request_result_payload: PermissionRequestResultPayload | null;
    public session_update_payload: SessionUpdatePayload | null;
    public run_command_result_payload: RunCommandResultPayload | null;
    public web_request_result_payload: WebRequestResultPayload | null;

    public __payload: string = "";
    public __payload_index: u8 = 0;

    static readonly PAYLOAD_MODE_UPDATE_PAYLOAD_INDEX: u8 = 2;
    static readonly PAYLOAD_TAB_UPDATE_PAYLOAD_INDEX: u8 = 3;
    static readonly PAYLOAD_PANE_UPDATE_PAYLOAD_INDEX: u8 = 4;
    static readonly PAYLOAD_KEY_PAYLOAD_INDEX: u8 = 5;
    static readonly PAYLOAD_MOUSE_EVENT_PAYLOAD_INDEX: u8 = 6;
    static readonly PAYLOAD_TIMER_PAYLOAD_INDEX: u8 = 7;
    static readonly PAYLOAD_COPY_TO_CLIPBOARD_PAYLOAD_INDEX: u8 = 8;
    static readonly PAYLOAD_VISIBLE_PAYLOAD_INDEX: u8 = 9;
    static readonly PAYLOAD_CUSTOM_MESSAGE_PAYLOAD_INDEX: u8 = 10;
    static readonly PAYLOAD_FILE_LIST_PAYLOAD_INDEX: u8 = 11;
    static readonly PAYLOAD_PERMISSION_REQUEST_RESULT_PAYLOAD_INDEX: u8 = 12;
    static readonly PAYLOAD_SESSION_UPDATE_PAYLOAD_INDEX: u8 = 13;
    static readonly PAYLOAD_RUN_COMMAND_RESULT_PAYLOAD_INDEX: u8 = 14;
    static readonly PAYLOAD_WEB_REQUEST_RESULT_PAYLOAD_INDEX: u8 = 15;

    // Decodes Event from an ArrayBuffer
    static decode(buf: ArrayBuffer): Event {
      return Event.decodeDataView(new DataView(buf));
    }

    // Decodes Event from a DataView
    static decodeDataView(view: DataView): Event {
      const decoder = new Decoder(view);
      const obj = new Event();

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
            obj.mode_update_payload = ModeUpdatePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "mode_update_payload";
            obj.__payload_index = 2;
            break;
          }
          case 3: {
            const length = decoder.uint32();
            obj.tab_update_payload = TabUpdatePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "tab_update_payload";
            obj.__payload_index = 3;
            break;
          }
          case 4: {
            const length = decoder.uint32();
            obj.pane_update_payload = PaneUpdatePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "pane_update_payload";
            obj.__payload_index = 4;
            break;
          }
          case 5: {
            const length = decoder.uint32();
            obj.key_payload = key.Key.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "key_payload";
            obj.__payload_index = 5;
            break;
          }
          case 6: {
            const length = decoder.uint32();
            obj.mouse_event_payload = MouseEventPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "mouse_event_payload";
            obj.__payload_index = 6;
            break;
          }
          case 7: {
            obj.timer_payload = decoder.float();
            obj.__payload = "timer_payload";
            obj.__payload_index = 7;
            break;
          }
          case 8: {
            obj.copy_to_clipboard_payload = decoder.uint32();
            obj.__payload = "copy_to_clipboard_payload";
            obj.__payload_index = 8;
            break;
          }
          case 9: {
            obj.visible_payload = decoder.bool();
            obj.__payload = "visible_payload";
            obj.__payload_index = 9;
            break;
          }
          case 10: {
            const length = decoder.uint32();
            obj.custom_message_payload = CustomMessagePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "custom_message_payload";
            obj.__payload_index = 10;
            break;
          }
          case 11: {
            const length = decoder.uint32();
            obj.file_list_payload = FileListPayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "file_list_payload";
            obj.__payload_index = 11;
            break;
          }
          case 12: {
            const length = decoder.uint32();
            obj.permission_request_result_payload =
              PermissionRequestResultPayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "permission_request_result_payload";
            obj.__payload_index = 12;
            break;
          }
          case 13: {
            const length = decoder.uint32();
            obj.session_update_payload = SessionUpdatePayload.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__payload = "session_update_payload";
            obj.__payload_index = 13;
            break;
          }
          case 14: {
            const length = decoder.uint32();
            obj.run_command_result_payload =
              RunCommandResultPayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "run_command_result_payload";
            obj.__payload_index = 14;
            break;
          }
          case 15: {
            const length = decoder.uint32();
            obj.web_request_result_payload =
              WebRequestResultPayload.decodeDataView(
                new DataView(
                  decoder.view.buffer,
                  decoder.pos + decoder.view.byteOffset,
                  length,
                ),
              );
            decoder.skip(length);

            obj.__payload = "web_request_result_payload";
            obj.__payload_index = 15;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode Event

    public size(): u32 {
      let size: u32 = 0;

      size += this.name == 0 ? 0 : 1 + Sizer.uint32(this.name);

      if (this.mode_update_payload != null) {
        const f: ModeUpdatePayload = this
          .mode_update_payload as ModeUpdatePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.tab_update_payload != null) {
        const f: TabUpdatePayload = this.tab_update_payload as TabUpdatePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.pane_update_payload != null) {
        const f: PaneUpdatePayload = this
          .pane_update_payload as PaneUpdatePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.key_payload != null) {
        const f: key.Key = this.key_payload as key.Key;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.mouse_event_payload != null) {
        const f: MouseEventPayload = this
          .mouse_event_payload as MouseEventPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size += this.timer_payload == 0 ? 0 : 1 + 4;
      size +=
        this.copy_to_clipboard_payload == 0
          ? 0
          : 1 + Sizer.uint32(this.copy_to_clipboard_payload);
      size += this.visible_payload == 0 ? 0 : 1 + 1;

      if (this.custom_message_payload != null) {
        const f: CustomMessagePayload = this
          .custom_message_payload as CustomMessagePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.file_list_payload != null) {
        const f: FileListPayload = this.file_list_payload as FileListPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.permission_request_result_payload != null) {
        const f: PermissionRequestResultPayload = this
          .permission_request_result_payload as PermissionRequestResultPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.session_update_payload != null) {
        const f: SessionUpdatePayload = this
          .session_update_payload as SessionUpdatePayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.run_command_result_payload != null) {
        const f: RunCommandResultPayload = this
          .run_command_result_payload as RunCommandResultPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.web_request_result_payload != null) {
        const f: WebRequestResultPayload = this
          .web_request_result_payload as WebRequestResultPayload;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes Event to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes Event to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.name != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.name);
      }

      if (this.mode_update_payload != null) {
        const f = this.mode_update_payload as ModeUpdatePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.tab_update_payload != null) {
        const f = this.tab_update_payload as TabUpdatePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x1a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.pane_update_payload != null) {
        const f = this.pane_update_payload as PaneUpdatePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x22);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.key_payload != null) {
        const f = this.key_payload as key.Key;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x2a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.mouse_event_payload != null) {
        const f = this.mouse_event_payload as MouseEventPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x32);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.timer_payload != 0) {
        encoder.uint32(0x3d);
        encoder.float(this.timer_payload);
      }
      if (this.copy_to_clipboard_payload != 0) {
        encoder.uint32(0x40);
        encoder.uint32(this.copy_to_clipboard_payload);
      }
      if (this.visible_payload != 0) {
        encoder.uint32(0x48);
        encoder.bool(this.visible_payload);
      }

      if (this.custom_message_payload != null) {
        const f = this.custom_message_payload as CustomMessagePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x52);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.file_list_payload != null) {
        const f = this.file_list_payload as FileListPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x5a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.permission_request_result_payload != null) {
        const f = this
          .permission_request_result_payload as PermissionRequestResultPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x62);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.session_update_payload != null) {
        const f = this.session_update_payload as SessionUpdatePayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x6a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.run_command_result_payload != null) {
        const f = this.run_command_result_payload as RunCommandResultPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x72);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.web_request_result_payload != null) {
        const f = this.web_request_result_payload as WebRequestResultPayload;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x7a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode Event
  } // Event

  export class SessionUpdatePayload {
    public session_manifests: Array<SessionManifest> =
      new Array<SessionManifest>();
    public resurrectable_sessions: Array<ResurrectableSession> =
      new Array<ResurrectableSession>();

    // Decodes SessionUpdatePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): SessionUpdatePayload {
      return SessionUpdatePayload.decodeDataView(new DataView(buf));
    }

    // Decodes SessionUpdatePayload from a DataView
    static decodeDataView(view: DataView): SessionUpdatePayload {
      const decoder = new Decoder(view);
      const obj = new SessionUpdatePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.session_manifests.push(
              SessionManifest.decodeDataView(
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
          case 2: {
            const length = decoder.uint32();
            obj.resurrectable_sessions.push(
              ResurrectableSession.decodeDataView(
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
    } // decode SessionUpdatePayload

    public size(): u32 {
      let size: u32 = 0;

      for (let n: i32 = 0; n < this.session_manifests.length; n++) {
        const messageSize = this.session_manifests[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      for (let n: i32 = 0; n < this.resurrectable_sessions.length; n++) {
        const messageSize = this.resurrectable_sessions[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes SessionUpdatePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes SessionUpdatePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      for (let n: i32 = 0; n < this.session_manifests.length; n++) {
        const messageSize = this.session_manifests[n].size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          this.session_manifests[n].encodeU8Array(encoder);
        }
      }

      for (let n: i32 = 0; n < this.resurrectable_sessions.length; n++) {
        const messageSize = this.resurrectable_sessions[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          this.resurrectable_sessions[n].encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode SessionUpdatePayload
  } // SessionUpdatePayload

  export class RunCommandResultPayload {
    public exit_code: i32;
    public stdout: Array<u8> = new Array<u8>();
    public stderr: Array<u8> = new Array<u8>();
    public context: Array<ContextItem> = new Array<ContextItem>();

    public ___exit_code: string = "";
    public ___exit_code_index: u8 = 0;

    static readonly EXIT_CODE_EXIT_CODE_INDEX: u8 = 1;

    // Decodes RunCommandResultPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): RunCommandResultPayload {
      return RunCommandResultPayload.decodeDataView(new DataView(buf));
    }

    // Decodes RunCommandResultPayload from a DataView
    static decodeDataView(view: DataView): RunCommandResultPayload {
      const decoder = new Decoder(view);
      const obj = new RunCommandResultPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.exit_code = decoder.int32();
            obj.___exit_code = "exit_code";
            obj.___exit_code_index = 1;
            break;
          }
          case 2: {
            obj.stdout = decoder.bytes();
            break;
          }
          case 3: {
            obj.stderr = decoder.bytes();
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
    } // decode RunCommandResultPayload

    public size(): u32 {
      let size: u32 = 0;

      size += this.exit_code == 0 ? 0 : 1 + Sizer.int32(this.exit_code);
      size +=
        this.stdout.length > 0
          ? 1 + Sizer.varint64(this.stdout.length) + this.stdout.length
          : 0;
      size +=
        this.stderr.length > 0
          ? 1 + Sizer.varint64(this.stderr.length) + this.stderr.length
          : 0;

      for (let n: i32 = 0; n < this.context.length; n++) {
        const messageSize = this.context[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes RunCommandResultPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes RunCommandResultPayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.exit_code != 0) {
        encoder.uint32(0x8);
        encoder.int32(this.exit_code);
      }
      if (this.stdout.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.stdout.length);
        encoder.bytes(this.stdout);
      }
      if (this.stderr.length > 0) {
        encoder.uint32(0x1a);
        encoder.uint32(this.stderr.length);
        encoder.bytes(this.stderr);
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
    } // encode RunCommandResultPayload
  } // RunCommandResultPayload

  export class WebRequestResultPayload {
    public status: i32;
    public headers: Array<Header> = new Array<Header>();
    public body: Array<u8> = new Array<u8>();
    public context: Array<ContextItem> = new Array<ContextItem>();

    // Decodes WebRequestResultPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): WebRequestResultPayload {
      return WebRequestResultPayload.decodeDataView(new DataView(buf));
    }

    // Decodes WebRequestResultPayload from a DataView
    static decodeDataView(view: DataView): WebRequestResultPayload {
      const decoder = new Decoder(view);
      const obj = new WebRequestResultPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.status = decoder.int32();
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.headers.push(
              Header.decodeDataView(
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
            obj.body = decoder.bytes();
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
    } // decode WebRequestResultPayload

    public size(): u32 {
      let size: u32 = 0;

      size += this.status == 0 ? 0 : 1 + Sizer.int32(this.status);

      for (let n: i32 = 0; n < this.headers.length; n++) {
        const messageSize = this.headers[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.body.length > 0
          ? 1 + Sizer.varint64(this.body.length) + this.body.length
          : 0;

      for (let n: i32 = 0; n < this.context.length; n++) {
        const messageSize = this.context[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes WebRequestResultPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes WebRequestResultPayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.status != 0) {
        encoder.uint32(0x8);
        encoder.int32(this.status);
      }

      for (let n: i32 = 0; n < this.headers.length; n++) {
        const messageSize = this.headers[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          this.headers[n].encodeU8Array(encoder);
        }
      }

      if (this.body.length > 0) {
        encoder.uint32(0x1a);
        encoder.uint32(this.body.length);
        encoder.bytes(this.body);
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
    } // encode WebRequestResultPayload
  } // WebRequestResultPayload

  export class ContextItem {
    public name: string = "";
    public value: string = "";

    // Decodes ContextItem from an ArrayBuffer
    static decode(buf: ArrayBuffer): ContextItem {
      return ContextItem.decodeDataView(new DataView(buf));
    }

    // Decodes ContextItem from a DataView
    static decodeDataView(view: DataView): ContextItem {
      const decoder = new Decoder(view);
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
          ? 1 + Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size +=
        this.value.length > 0
          ? 1 + Sizer.varint64(this.value.length) + this.value.length
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
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
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

  export class Header {
    public name: string = "";
    public value: string = "";

    // Decodes Header from an ArrayBuffer
    static decode(buf: ArrayBuffer): Header {
      return Header.decodeDataView(new DataView(buf));
    }

    // Decodes Header from a DataView
    static decodeDataView(view: DataView): Header {
      const decoder = new Decoder(view);
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
          ? 1 + Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size +=
        this.value.length > 0
          ? 1 + Sizer.varint64(this.value.length) + this.value.length
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
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
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

  export class PermissionRequestResultPayload {
    public granted: bool;

    // Decodes PermissionRequestResultPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): PermissionRequestResultPayload {
      return PermissionRequestResultPayload.decodeDataView(new DataView(buf));
    }

    // Decodes PermissionRequestResultPayload from a DataView
    static decodeDataView(view: DataView): PermissionRequestResultPayload {
      const decoder = new Decoder(view);
      const obj = new PermissionRequestResultPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.granted = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode PermissionRequestResultPayload

    public size(): u32 {
      let size: u32 = 0;

      size += this.granted == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes PermissionRequestResultPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes PermissionRequestResultPayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.granted != 0) {
        encoder.uint32(0x8);
        encoder.bool(this.granted);
      }

      return buf;
    } // encode PermissionRequestResultPayload
  } // PermissionRequestResultPayload

  export class FileListPayload {
    public paths: Array<string> = new Array<string>();

    // Decodes FileListPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): FileListPayload {
      return FileListPayload.decodeDataView(new DataView(buf));
    }

    // Decodes FileListPayload from a DataView
    static decodeDataView(view: DataView): FileListPayload {
      const decoder = new Decoder(view);
      const obj = new FileListPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.paths.push(decoder.string());
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode FileListPayload

    public size(): u32 {
      let size: u32 = 0;

      size += __size_string_repeated(this.paths);

      return size;
    }

    // Encodes FileListPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes FileListPayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.paths.length > 0) {
        for (let n: i32 = 0; n < this.paths.length; n++) {
          encoder.uint32(0xa);
          encoder.uint32(this.paths[n].length);
          encoder.string(this.paths[n]);
        }
      }

      return buf;
    } // encode FileListPayload
  } // FileListPayload

  export class CustomMessagePayload {
    public message_name: string = "";
    public payload: string = "";

    // Decodes CustomMessagePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): CustomMessagePayload {
      return CustomMessagePayload.decodeDataView(new DataView(buf));
    }

    // Decodes CustomMessagePayload from a DataView
    static decodeDataView(view: DataView): CustomMessagePayload {
      const decoder = new Decoder(view);
      const obj = new CustomMessagePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.message_name = decoder.string();
            break;
          }
          case 2: {
            obj.payload = decoder.string();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode CustomMessagePayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.message_name.length > 0
          ? 1 +
            Sizer.varint64(this.message_name.length) +
            this.message_name.length
          : 0;
      size +=
        this.payload.length > 0
          ? 1 + Sizer.varint64(this.payload.length) + this.payload.length
          : 0;

      return size;
    }

    // Encodes CustomMessagePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes CustomMessagePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.message_name.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.message_name.length);
        encoder.string(this.message_name);
      }
      if (this.payload.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.payload.length);
        encoder.string(this.payload);
      }

      return buf;
    } // encode CustomMessagePayload
  } // CustomMessagePayload

  export class MouseEventPayload {
    public mouse_event_name: u32;
    public line_count: u32;
    public position: action.Position | null;

    public __mouse_event_payload: string = "";
    public __mouse_event_payload_index: u8 = 0;

    static readonly MOUSE_EVENT_PAYLOAD_LINE_COUNT_INDEX: u8 = 2;
    static readonly MOUSE_EVENT_PAYLOAD_POSITION_INDEX: u8 = 3;

    // Decodes MouseEventPayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): MouseEventPayload {
      return MouseEventPayload.decodeDataView(new DataView(buf));
    }

    // Decodes MouseEventPayload from a DataView
    static decodeDataView(view: DataView): MouseEventPayload {
      const decoder = new Decoder(view);
      const obj = new MouseEventPayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.mouse_event_name = decoder.uint32();
            break;
          }
          case 2: {
            obj.line_count = decoder.uint32();
            obj.__mouse_event_payload = "line_count";
            obj.__mouse_event_payload_index = 2;
            break;
          }
          case 3: {
            const length = decoder.uint32();
            obj.position = action.Position.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.__mouse_event_payload = "position";
            obj.__mouse_event_payload_index = 3;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode MouseEventPayload

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.mouse_event_name == 0
          ? 0
          : 1 + Sizer.uint32(this.mouse_event_name);
      size += this.line_count == 0 ? 0 : 1 + Sizer.uint32(this.line_count);

      if (this.position != null) {
        const f: action.Position = this.position as action.Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes MouseEventPayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes MouseEventPayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.mouse_event_name != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.mouse_event_name);
      }
      if (this.line_count != 0) {
        encoder.uint32(0x10);
        encoder.uint32(this.line_count);
      }

      if (this.position != null) {
        const f = this.position as action.Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x1a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode MouseEventPayload
  } // MouseEventPayload

  export class TabUpdatePayload {
    public tab_info: Array<TabInfo> = new Array<TabInfo>();

    // Decodes TabUpdatePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): TabUpdatePayload {
      return TabUpdatePayload.decodeDataView(new DataView(buf));
    }

    // Decodes TabUpdatePayload from a DataView
    static decodeDataView(view: DataView): TabUpdatePayload {
      const decoder = new Decoder(view);
      const obj = new TabUpdatePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.tab_info.push(
              TabInfo.decodeDataView(
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
    } // decode TabUpdatePayload

    public size(): u32 {
      let size: u32 = 0;

      for (let n: i32 = 0; n < this.tab_info.length; n++) {
        const messageSize = this.tab_info[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes TabUpdatePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes TabUpdatePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      for (let n: i32 = 0; n < this.tab_info.length; n++) {
        const messageSize = this.tab_info[n].size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          this.tab_info[n].encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode TabUpdatePayload
  } // TabUpdatePayload

  export class PaneUpdatePayload {
    public pane_manifest: Array<PaneManifest> = new Array<PaneManifest>();

    // Decodes PaneUpdatePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): PaneUpdatePayload {
      return PaneUpdatePayload.decodeDataView(new DataView(buf));
    }

    // Decodes PaneUpdatePayload from a DataView
    static decodeDataView(view: DataView): PaneUpdatePayload {
      const decoder = new Decoder(view);
      const obj = new PaneUpdatePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.pane_manifest.push(
              PaneManifest.decodeDataView(
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
    } // decode PaneUpdatePayload

    public size(): u32 {
      let size: u32 = 0;

      for (let n: i32 = 0; n < this.pane_manifest.length; n++) {
        const messageSize = this.pane_manifest[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes PaneUpdatePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes PaneUpdatePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      for (let n: i32 = 0; n < this.pane_manifest.length; n++) {
        const messageSize = this.pane_manifest[n].size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          this.pane_manifest[n].encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode PaneUpdatePayload
  } // PaneUpdatePayload

  export class PaneManifest {
    public tab_index: u32;
    public panes: Array<PaneInfo> = new Array<PaneInfo>();

    // Decodes PaneManifest from an ArrayBuffer
    static decode(buf: ArrayBuffer): PaneManifest {
      return PaneManifest.decodeDataView(new DataView(buf));
    }

    // Decodes PaneManifest from a DataView
    static decodeDataView(view: DataView): PaneManifest {
      const decoder = new Decoder(view);
      const obj = new PaneManifest();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.tab_index = decoder.uint32();
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.panes.push(
              PaneInfo.decodeDataView(
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
    } // decode PaneManifest

    public size(): u32 {
      let size: u32 = 0;

      size += this.tab_index == 0 ? 0 : 1 + Sizer.uint32(this.tab_index);

      for (let n: i32 = 0; n < this.panes.length; n++) {
        const messageSize = this.panes[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes PaneManifest to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes PaneManifest to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.tab_index != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.tab_index);
      }

      for (let n: i32 = 0; n < this.panes.length; n++) {
        const messageSize = this.panes[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          this.panes[n].encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode PaneManifest
  } // PaneManifest

  export class SessionManifest {
    public name: string = "";
    public tabs: Array<TabInfo> = new Array<TabInfo>();
    public panes: Array<PaneManifest> = new Array<PaneManifest>();
    public connected_clients: u32;
    public is_current_session: bool;

    // Decodes SessionManifest from an ArrayBuffer
    static decode(buf: ArrayBuffer): SessionManifest {
      return SessionManifest.decodeDataView(new DataView(buf));
    }

    // Decodes SessionManifest from a DataView
    static decodeDataView(view: DataView): SessionManifest {
      const decoder = new Decoder(view);
      const obj = new SessionManifest();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.name = decoder.string();
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.tabs.push(
              TabInfo.decodeDataView(
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
            const length = decoder.uint32();
            obj.panes.push(
              PaneManifest.decodeDataView(
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
            obj.connected_clients = decoder.uint32();
            break;
          }
          case 5: {
            obj.is_current_session = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode SessionManifest

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.name.length > 0
          ? 1 + Sizer.varint64(this.name.length) + this.name.length
          : 0;

      for (let n: i32 = 0; n < this.tabs.length; n++) {
        const messageSize = this.tabs[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      for (let n: i32 = 0; n < this.panes.length; n++) {
        const messageSize = this.panes[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.connected_clients == 0
          ? 0
          : 1 + Sizer.uint32(this.connected_clients);
      size += this.is_current_session == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes SessionManifest to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes SessionManifest to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.name.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.name.length);
        encoder.string(this.name);
      }

      for (let n: i32 = 0; n < this.tabs.length; n++) {
        const messageSize = this.tabs[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          this.tabs[n].encodeU8Array(encoder);
        }
      }

      for (let n: i32 = 0; n < this.panes.length; n++) {
        const messageSize = this.panes[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x1a);
          encoder.uint32(messageSize);
          this.panes[n].encodeU8Array(encoder);
        }
      }

      if (this.connected_clients != 0) {
        encoder.uint32(0x20);
        encoder.uint32(this.connected_clients);
      }
      if (this.is_current_session != 0) {
        encoder.uint32(0x28);
        encoder.bool(this.is_current_session);
      }

      return buf;
    } // encode SessionManifest
  } // SessionManifest

  export class ResurrectableSession {
    public name: string = "";
    public creation_time: u64;

    // Decodes ResurrectableSession from an ArrayBuffer
    static decode(buf: ArrayBuffer): ResurrectableSession {
      return ResurrectableSession.decodeDataView(new DataView(buf));
    }

    // Decodes ResurrectableSession from a DataView
    static decodeDataView(view: DataView): ResurrectableSession {
      const decoder = new Decoder(view);
      const obj = new ResurrectableSession();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.name = decoder.string();
            break;
          }
          case 2: {
            obj.creation_time = decoder.uint64();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode ResurrectableSession

    public size(): u32 {
      let size: u32 = 0;

      size +=
        this.name.length > 0
          ? 1 + Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size +=
        this.creation_time == 0 ? 0 : 1 + Sizer.uint64(this.creation_time);

      return size;
    }

    // Encodes ResurrectableSession to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes ResurrectableSession to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.name.length > 0) {
        encoder.uint32(0xa);
        encoder.uint32(this.name.length);
        encoder.string(this.name);
      }
      if (this.creation_time != 0) {
        encoder.uint32(0x10);
        encoder.uint64(this.creation_time);
      }

      return buf;
    } // encode ResurrectableSession
  } // ResurrectableSession

  export class PaneInfo {
    public id: u32;
    public is_plugin: bool;
    public is_focused: bool;
    public is_fullscreen: bool;
    public is_floating: bool;
    public is_suppressed: bool;
    public title: string = "";
    public exited: bool;
    public exit_status: i32;
    public is_held: bool;
    public pane_x: u32;
    public pane_content_x: u32;
    public pane_y: u32;
    public pane_content_y: u32;
    public pane_rows: u32;
    public pane_content_rows: u32;
    public pane_columns: u32;
    public pane_content_columns: u32;
    public cursor_coordinates_in_pane: action.Position | null;
    public terminal_command: string = "";
    public plugin_url: string = "";
    public is_selectable: bool;

    public ___exit_status: string = "";
    public ___exit_status_index: u8 = 0;

    public ___cursor_coordinates_in_pane: string = "";
    public ___cursor_coordinates_in_pane_index: u8 = 0;

    public ___terminal_command: string = "";
    public ___terminal_command_index: u8 = 0;

    public ___plugin_url: string = "";
    public ___plugin_url_index: u8 = 0;

    static readonly EXIT_STATUS_EXIT_STATUS_INDEX: u8 = 9;
    static readonly CURSOR_COORDINATES_IN_PANE_CURSOR_COORDINATES_IN_PANE_INDEX: u8 = 19;
    static readonly TERMINAL_COMMAND_TERMINAL_COMMAND_INDEX: u8 = 20;
    static readonly PLUGIN_URL_PLUGIN_URL_INDEX: u8 = 21;

    // Decodes PaneInfo from an ArrayBuffer
    static decode(buf: ArrayBuffer): PaneInfo {
      return PaneInfo.decodeDataView(new DataView(buf));
    }

    // Decodes PaneInfo from a DataView
    static decodeDataView(view: DataView): PaneInfo {
      const decoder = new Decoder(view);
      const obj = new PaneInfo();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.id = decoder.uint32();
            break;
          }
          case 2: {
            obj.is_plugin = decoder.bool();
            break;
          }
          case 3: {
            obj.is_focused = decoder.bool();
            break;
          }
          case 4: {
            obj.is_fullscreen = decoder.bool();
            break;
          }
          case 5: {
            obj.is_floating = decoder.bool();
            break;
          }
          case 6: {
            obj.is_suppressed = decoder.bool();
            break;
          }
          case 7: {
            obj.title = decoder.string();
            break;
          }
          case 8: {
            obj.exited = decoder.bool();
            break;
          }
          case 9: {
            obj.exit_status = decoder.int32();
            obj.___exit_status = "exit_status";
            obj.___exit_status_index = 9;
            break;
          }
          case 10: {
            obj.is_held = decoder.bool();
            break;
          }
          case 11: {
            obj.pane_x = decoder.uint32();
            break;
          }
          case 12: {
            obj.pane_content_x = decoder.uint32();
            break;
          }
          case 13: {
            obj.pane_y = decoder.uint32();
            break;
          }
          case 14: {
            obj.pane_content_y = decoder.uint32();
            break;
          }
          case 15: {
            obj.pane_rows = decoder.uint32();
            break;
          }
          case 16: {
            obj.pane_content_rows = decoder.uint32();
            break;
          }
          case 17: {
            obj.pane_columns = decoder.uint32();
            break;
          }
          case 18: {
            obj.pane_content_columns = decoder.uint32();
            break;
          }
          case 19: {
            const length = decoder.uint32();
            obj.cursor_coordinates_in_pane = action.Position.decodeDataView(
              new DataView(
                decoder.view.buffer,
                decoder.pos + decoder.view.byteOffset,
                length,
              ),
            );
            decoder.skip(length);

            obj.___cursor_coordinates_in_pane = "cursor_coordinates_in_pane";
            obj.___cursor_coordinates_in_pane_index = 19;
            break;
          }
          case 20: {
            obj.terminal_command = decoder.string();
            obj.___terminal_command = "terminal_command";
            obj.___terminal_command_index = 20;
            break;
          }
          case 21: {
            obj.plugin_url = decoder.string();
            obj.___plugin_url = "plugin_url";
            obj.___plugin_url_index = 21;
            break;
          }
          case 22: {
            obj.is_selectable = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode PaneInfo

    public size(): u32 {
      let size: u32 = 0;

      size += this.id == 0 ? 0 : 1 + Sizer.uint32(this.id);
      size += this.is_plugin == 0 ? 0 : 1 + 1;
      size += this.is_focused == 0 ? 0 : 1 + 1;
      size += this.is_fullscreen == 0 ? 0 : 1 + 1;
      size += this.is_floating == 0 ? 0 : 1 + 1;
      size += this.is_suppressed == 0 ? 0 : 1 + 1;
      size +=
        this.title.length > 0
          ? 1 + Sizer.varint64(this.title.length) + this.title.length
          : 0;
      size += this.exited == 0 ? 0 : 1 + 1;
      size += this.exit_status == 0 ? 0 : 1 + Sizer.int32(this.exit_status);
      size += this.is_held == 0 ? 0 : 1 + 1;
      size += this.pane_x == 0 ? 0 : 1 + Sizer.uint32(this.pane_x);
      size +=
        this.pane_content_x == 0 ? 0 : 1 + Sizer.uint32(this.pane_content_x);
      size += this.pane_y == 0 ? 0 : 1 + Sizer.uint32(this.pane_y);
      size +=
        this.pane_content_y == 0 ? 0 : 1 + Sizer.uint32(this.pane_content_y);
      size += this.pane_rows == 0 ? 0 : 1 + Sizer.uint32(this.pane_rows);
      size +=
        this.pane_content_rows == 0
          ? 0
          : 2 + Sizer.uint32(this.pane_content_rows);
      size += this.pane_columns == 0 ? 0 : 2 + Sizer.uint32(this.pane_columns);
      size +=
        this.pane_content_columns == 0
          ? 0
          : 2 + Sizer.uint32(this.pane_content_columns);

      if (this.cursor_coordinates_in_pane != null) {
        const f: action.Position = this
          .cursor_coordinates_in_pane as action.Position;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 2 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size +=
        this.terminal_command.length > 0
          ? 2 +
            Sizer.varint64(this.terminal_command.length) +
            this.terminal_command.length
          : 0;
      size +=
        this.plugin_url.length > 0
          ? 2 + Sizer.varint64(this.plugin_url.length) + this.plugin_url.length
          : 0;
      size += this.is_selectable == 0 ? 0 : 2 + 1;

      return size;
    }

    // Encodes PaneInfo to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes PaneInfo to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.id != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.id);
      }
      if (this.is_plugin != 0) {
        encoder.uint32(0x10);
        encoder.bool(this.is_plugin);
      }
      if (this.is_focused != 0) {
        encoder.uint32(0x18);
        encoder.bool(this.is_focused);
      }
      if (this.is_fullscreen != 0) {
        encoder.uint32(0x20);
        encoder.bool(this.is_fullscreen);
      }
      if (this.is_floating != 0) {
        encoder.uint32(0x28);
        encoder.bool(this.is_floating);
      }
      if (this.is_suppressed != 0) {
        encoder.uint32(0x30);
        encoder.bool(this.is_suppressed);
      }
      if (this.title.length > 0) {
        encoder.uint32(0x3a);
        encoder.uint32(this.title.length);
        encoder.string(this.title);
      }
      if (this.exited != 0) {
        encoder.uint32(0x40);
        encoder.bool(this.exited);
      }
      if (this.exit_status != 0) {
        encoder.uint32(0x48);
        encoder.int32(this.exit_status);
      }
      if (this.is_held != 0) {
        encoder.uint32(0x50);
        encoder.bool(this.is_held);
      }
      if (this.pane_x != 0) {
        encoder.uint32(0x58);
        encoder.uint32(this.pane_x);
      }
      if (this.pane_content_x != 0) {
        encoder.uint32(0x60);
        encoder.uint32(this.pane_content_x);
      }
      if (this.pane_y != 0) {
        encoder.uint32(0x68);
        encoder.uint32(this.pane_y);
      }
      if (this.pane_content_y != 0) {
        encoder.uint32(0x70);
        encoder.uint32(this.pane_content_y);
      }
      if (this.pane_rows != 0) {
        encoder.uint32(0x78);
        encoder.uint32(this.pane_rows);
      }
      if (this.pane_content_rows != 0) {
        encoder.uint32(0x80);
        encoder.uint32(this.pane_content_rows);
      }
      if (this.pane_columns != 0) {
        encoder.uint32(0x88);
        encoder.uint32(this.pane_columns);
      }
      if (this.pane_content_columns != 0) {
        encoder.uint32(0x90);
        encoder.uint32(this.pane_content_columns);
      }

      if (this.cursor_coordinates_in_pane != null) {
        const f = this.cursor_coordinates_in_pane as action.Position;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x9a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.terminal_command.length > 0) {
        encoder.uint32(0xa2);
        encoder.uint32(this.terminal_command.length);
        encoder.string(this.terminal_command);
      }
      if (this.plugin_url.length > 0) {
        encoder.uint32(0xaa);
        encoder.uint32(this.plugin_url.length);
        encoder.string(this.plugin_url);
      }
      if (this.is_selectable != 0) {
        encoder.uint32(0xb0);
        encoder.bool(this.is_selectable);
      }

      return buf;
    } // encode PaneInfo
  } // PaneInfo

  export class TabInfo {
    public position: u32;
    public name: string = "";
    public active: bool;
    public panes_to_hide: u32;
    public is_fullscreen_active: bool;
    public is_sync_panes_active: bool;
    public are_floating_panes_visible: bool;
    public other_focused_clients: Array<u32> = new Array<u32>();
    public active_swap_layout_name: string = "";
    public is_swap_layout_dirty: bool;

    public ___active_swap_layout_name: string = "";
    public ___active_swap_layout_name_index: u8 = 0;

    static readonly ACTIVE_SWAP_LAYOUT_NAME_ACTIVE_SWAP_LAYOUT_NAME_INDEX: u8 = 9;

    // Decodes TabInfo from an ArrayBuffer
    static decode(buf: ArrayBuffer): TabInfo {
      return TabInfo.decodeDataView(new DataView(buf));
    }

    // Decodes TabInfo from a DataView
    static decodeDataView(view: DataView): TabInfo {
      const decoder = new Decoder(view);
      const obj = new TabInfo();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.position = decoder.uint32();
            break;
          }
          case 2: {
            obj.name = decoder.string();
            break;
          }
          case 3: {
            obj.active = decoder.bool();
            break;
          }
          case 4: {
            obj.panes_to_hide = decoder.uint32();
            break;
          }
          case 5: {
            obj.is_fullscreen_active = decoder.bool();
            break;
          }
          case 6: {
            obj.is_sync_panes_active = decoder.bool();
            break;
          }
          case 7: {
            obj.are_floating_panes_visible = decoder.bool();
            break;
          }
          case 8: {
            const endPos = decoder.pos + decoder.uint32();
            while (decoder.pos <= endPos) {
              obj.other_focused_clients.push(decoder.uint32());
            }

            break;
          }
          case 9: {
            obj.active_swap_layout_name = decoder.string();
            obj.___active_swap_layout_name = "active_swap_layout_name";
            obj.___active_swap_layout_name_index = 9;
            break;
          }
          case 10: {
            obj.is_swap_layout_dirty = decoder.bool();
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode TabInfo

    public size(): u32 {
      let size: u32 = 0;

      size += this.position == 0 ? 0 : 1 + Sizer.uint32(this.position);
      size +=
        this.name.length > 0
          ? 1 + Sizer.varint64(this.name.length) + this.name.length
          : 0;
      size += this.active == 0 ? 0 : 1 + 1;
      size +=
        this.panes_to_hide == 0 ? 0 : 1 + Sizer.uint32(this.panes_to_hide);
      size += this.is_fullscreen_active == 0 ? 0 : 1 + 1;
      size += this.is_sync_panes_active == 0 ? 0 : 1 + 1;
      size += this.are_floating_panes_visible == 0 ? 0 : 1 + 1;

      if (this.other_focused_clients.length > 0) {
        const packedSize = __size_uint32_repeated_packed(
          this.other_focused_clients,
        );
        if (packedSize > 0) {
          size += 1 + Sizer.varint64(packedSize) + packedSize;
        }
      }

      size +=
        this.active_swap_layout_name.length > 0
          ? 1 +
            Sizer.varint64(this.active_swap_layout_name.length) +
            this.active_swap_layout_name.length
          : 0;
      size += this.is_swap_layout_dirty == 0 ? 0 : 1 + 1;

      return size;
    }

    // Encodes TabInfo to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes TabInfo to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.position != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.position);
      }
      if (this.name.length > 0) {
        encoder.uint32(0x12);
        encoder.uint32(this.name.length);
        encoder.string(this.name);
      }
      if (this.active != 0) {
        encoder.uint32(0x18);
        encoder.bool(this.active);
      }
      if (this.panes_to_hide != 0) {
        encoder.uint32(0x20);
        encoder.uint32(this.panes_to_hide);
      }
      if (this.is_fullscreen_active != 0) {
        encoder.uint32(0x28);
        encoder.bool(this.is_fullscreen_active);
      }
      if (this.is_sync_panes_active != 0) {
        encoder.uint32(0x30);
        encoder.bool(this.is_sync_panes_active);
      }
      if (this.are_floating_panes_visible != 0) {
        encoder.uint32(0x38);
        encoder.bool(this.are_floating_panes_visible);
      }

      if (this.other_focused_clients.length > 0) {
        encoder.uint32(0x42);
        encoder.uint32(
          __size_uint32_repeated_packed(this.other_focused_clients),
        );

        for (let n: i32 = 0; n < this.other_focused_clients.length; n++) {
          encoder.uint32(this.other_focused_clients[n]);
        }
      }

      if (this.active_swap_layout_name.length > 0) {
        encoder.uint32(0x4a);
        encoder.uint32(this.active_swap_layout_name.length);
        encoder.string(this.active_swap_layout_name);
      }
      if (this.is_swap_layout_dirty != 0) {
        encoder.uint32(0x50);
        encoder.bool(this.is_swap_layout_dirty);
      }

      return buf;
    } // encode TabInfo
  } // TabInfo

  export class ModeUpdatePayload {
    public current_mode: u32;
    public keybinds: Array<InputModeKeybinds> = new Array<InputModeKeybinds>();
    public style: style.Style = new style.Style();
    public arrow_fonts_support: bool;
    public session_name: string = "";

    public ___session_name: string = "";
    public ___session_name_index: u8 = 0;

    static readonly SESSION_NAME_SESSION_NAME_INDEX: u8 = 5;

    // Decodes ModeUpdatePayload from an ArrayBuffer
    static decode(buf: ArrayBuffer): ModeUpdatePayload {
      return ModeUpdatePayload.decodeDataView(new DataView(buf));
    }

    // Decodes ModeUpdatePayload from a DataView
    static decodeDataView(view: DataView): ModeUpdatePayload {
      const decoder = new Decoder(view);
      const obj = new ModeUpdatePayload();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.current_mode = decoder.uint32();
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.keybinds.push(
              InputModeKeybinds.decodeDataView(
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
            const length = decoder.uint32();
            obj.style = style.Style.decodeDataView(
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
            obj.arrow_fonts_support = decoder.bool();
            break;
          }
          case 5: {
            obj.session_name = decoder.string();
            obj.___session_name = "session_name";
            obj.___session_name_index = 5;
            break;
          }

          default:
            decoder.skipType(tag & 7);
            break;
        }
      }
      return obj;
    } // decode ModeUpdatePayload

    public size(): u32 {
      let size: u32 = 0;

      size += this.current_mode == 0 ? 0 : 1 + Sizer.uint32(this.current_mode);

      for (let n: i32 = 0; n < this.keybinds.length; n++) {
        const messageSize = this.keybinds[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      if (this.style != null) {
        const f: style.Style = this.style as style.Style;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      size += this.arrow_fonts_support == 0 ? 0 : 1 + 1;
      size +=
        this.session_name.length > 0
          ? 1 +
            Sizer.varint64(this.session_name.length) +
            this.session_name.length
          : 0;

      return size;
    }

    // Encodes ModeUpdatePayload to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes ModeUpdatePayload to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.current_mode != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.current_mode);
      }

      for (let n: i32 = 0; n < this.keybinds.length; n++) {
        const messageSize = this.keybinds[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          this.keybinds[n].encodeU8Array(encoder);
        }
      }

      if (this.style != null) {
        const f = this.style as style.Style;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0x1a);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      if (this.arrow_fonts_support != 0) {
        encoder.uint32(0x20);
        encoder.bool(this.arrow_fonts_support);
      }
      if (this.session_name.length > 0) {
        encoder.uint32(0x2a);
        encoder.uint32(this.session_name.length);
        encoder.string(this.session_name);
      }

      return buf;
    } // encode ModeUpdatePayload
  } // ModeUpdatePayload

  export class InputModeKeybinds {
    public mode: u32;
    public key_bind: Array<KeyBind> = new Array<KeyBind>();

    // Decodes InputModeKeybinds from an ArrayBuffer
    static decode(buf: ArrayBuffer): InputModeKeybinds {
      return InputModeKeybinds.decodeDataView(new DataView(buf));
    }

    // Decodes InputModeKeybinds from a DataView
    static decodeDataView(view: DataView): InputModeKeybinds {
      const decoder = new Decoder(view);
      const obj = new InputModeKeybinds();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            obj.mode = decoder.uint32();
            break;
          }
          case 2: {
            const length = decoder.uint32();
            obj.key_bind.push(
              KeyBind.decodeDataView(
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
    } // decode InputModeKeybinds

    public size(): u32 {
      let size: u32 = 0;

      size += this.mode == 0 ? 0 : 1 + Sizer.uint32(this.mode);

      for (let n: i32 = 0; n < this.key_bind.length; n++) {
        const messageSize = this.key_bind[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes InputModeKeybinds to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes InputModeKeybinds to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.mode != 0) {
        encoder.uint32(0x8);
        encoder.uint32(this.mode);
      }

      for (let n: i32 = 0; n < this.key_bind.length; n++) {
        const messageSize = this.key_bind[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          this.key_bind[n].encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode InputModeKeybinds
  } // InputModeKeybinds

  export class KeyBind {
    public key: key.Key = new key.Key();
    public action: Array<action.Action> = new Array<action.Action>();

    // Decodes KeyBind from an ArrayBuffer
    static decode(buf: ArrayBuffer): KeyBind {
      return KeyBind.decodeDataView(new DataView(buf));
    }

    // Decodes KeyBind from a DataView
    static decodeDataView(view: DataView): KeyBind {
      const decoder = new Decoder(view);
      const obj = new KeyBind();

      while (!decoder.eof()) {
        const tag = decoder.tag();
        const number = tag >>> 3;

        switch (number) {
          case 1: {
            const length = decoder.uint32();
            obj.key = key.Key.decodeDataView(
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
            const length = decoder.uint32();
            obj.action.push(
              action.Action.decodeDataView(
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
    } // decode KeyBind

    public size(): u32 {
      let size: u32 = 0;

      if (this.key != null) {
        const f: key.Key = this.key as key.Key;
        const messageSize = f.size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      for (let n: i32 = 0; n < this.action.length; n++) {
        const messageSize = this.action[n].size();

        if (messageSize > 0) {
          size += 1 + Sizer.varint64(messageSize) + messageSize;
        }
      }

      return size;
    }

    // Encodes KeyBind to the ArrayBuffer
    encode(): ArrayBuffer {
      return changetype<ArrayBuffer>(
        StaticArray.fromArray<u8>(this.encodeU8Array()),
      );
    }

    // Encodes KeyBind to the Array<u8>
    encodeU8Array(encoder: Encoder = new Encoder(new Array<u8>())): Array<u8> {
      const buf = encoder.buf;

      if (this.key != null) {
        const f = this.key as key.Key;

        const messageSize = f.size();

        if (messageSize > 0) {
          encoder.uint32(0xa);
          encoder.uint32(messageSize);
          f.encodeU8Array(encoder);
        }
      }

      for (let n: i32 = 0; n < this.action.length; n++) {
        const messageSize = this.action[n].size();

        if (messageSize > 0) {
          encoder.uint32(0x12);
          encoder.uint32(messageSize);
          this.action[n].encodeU8Array(encoder);
        }
      }

      return buf;
    } // encode KeyBind
  } // KeyBind
} // event

// __size_string_repeated

function __size_string_repeated(value: Array<string>): u32 {
  let size: u32 = 0;

  for (let n: i32 = 0; n < value.length; n++) {
    size += 1 + Sizer.varint64(value[n].length) + value[n].length;
  }

  return size;
}

// __size_uint32_repeated_packed

function __size_uint32_repeated_packed(value: Array<u32>): u32 {
  let size: u32 = 0;

  for (let n: i32 = 0; n < value.length; n++) {
    size += Sizer.uint32(value[n]);
  }

  return size;
}
