function replaceClose(
  index: i32,
  string: string,
  close: string,
  replace: string,
): string {
  const head = string.substring(0, index) + replace;
  const tail = string.substring(index + close.length);
  const next = tail.indexOf(close);
  return head + (next < 0 ? tail : replaceClose(next, tail, close, replace));
}

function clearBleed(
  index: i32,
  string: string,
  open: string,
  close: string,
  replace: string,
): string {
  if (index < 0) {
    return open + string + close;
  } else {
    return open + replaceClose(index, string, close, replace) + close;
  }
}

function filterEmpty(
  open: string,
  close: string,
  string: string,
  replace: string | null,
): string {
  let _replace = replace;
  if (_replace === null) {
    _replace = open;
  }
  if (string !== null && string.length > 0) {
    return clearBleed(
      ("" + string).indexOf(close, open.length + 1),
      string,
      open,
      close,
      _replace,
    );
  } else {
    return "";
  }
}

function init(
  open: i32,
  close: i32,
  string: string,
  replace: string | null = null,
): string {
  return filterEmpty(`\x1b[${open}m`, `\x1b[${close}m`, string, replace);
}

function rgbInit(
  mode: u32,
  open: Array<u32>,
  close: u32,
  string: string,
  replace: string | null = null,
): string {
  return filterEmpty(
    `\x1b[${mode};2;${open[0]};${open[1]};${open[2]}m`,
    `\x1b[${close}m`,
    string,
    replace,
  );
}

const _colors = new Map<string, (s: string) => string>();
_colors.set("reset", (s: string) => init(0, 0, s));
_colors.set("bold", (s: string) => init(1, 22, s, "\x1b[22m\x1b[1m"));
_colors.set("dim", (s: string) => init(2, 22, s, "\x1b[22m\x1b[2m"));
_colors.set("italic", (s: string) => init(3, 23, s));
_colors.set("underline", (s: string) => init(4, 24, s));
_colors.set("inverse", (s: string) => init(7, 27, s));
_colors.set("hidden", (s: string) => init(8, 28, s));
_colors.set("strikethrough", (s: string) => init(9, 29, s));
_colors.set("black", (s: string) => init(30, 39, s));
_colors.set("red", (s: string) => init(31, 39, s));
_colors.set("green", (s: string) => init(32, 39, s));
_colors.set("yellow", (s: string) => init(33, 39, s));
_colors.set("blue", (s: string) => init(34, 39, s));
_colors.set("magenta", (s: string) => init(35, 39, s));
_colors.set("cyan", (s: string) => init(36, 39, s));
_colors.set("white", (s: string) => init(37, 39, s));
_colors.set("gray", (s: string) => init(90, 39, s));
_colors.set("bgBlack", (s: string) => init(40, 49, s));
_colors.set("bgRed", (s: string) => init(41, 49, s));
_colors.set("bgGreen", (s: string) => init(42, 49, s));
_colors.set("bgYellow", (s: string) => init(43, 49, s));
_colors.set("bgBlue", (s: string) => init(44, 49, s));
_colors.set("bgMagenta", (s: string) => init(45, 49, s));
_colors.set("bgCyan", (s: string) => init(46, 49, s));
_colors.set("bgWhite", (s: string) => init(47, 49, s));
_colors.set("blackBright", (s: string) => init(90, 39, s));
_colors.set("redBright", (s: string) => init(91, 39, s));
_colors.set("greenBright", (s: string) => init(92, 39, s));
_colors.set("yellowBright", (s: string) => init(93, 39, s));
_colors.set("blueBright", (s: string) => init(94, 39, s));
_colors.set("magentaBright", (s: string) => init(95, 39, s));
_colors.set("cyanBright", (s: string) => init(96, 39, s));
_colors.set("whiteBright", (s: string) => init(97, 39, s));
_colors.set("bgBlackBright", (s: string) => init(100, 49, s));
_colors.set("bgRedBright", (s: string) => init(101, 49, s));
_colors.set("bgGreenBright", (s: string) => init(102, 49, s));
_colors.set("bgYellowBright", (s: string) => init(103, 49, s));
_colors.set("bgBlueBright", (s: string) => init(104, 49, s));
_colors.set("bgMagentaBright", (s: string) => init(105, 49, s));
_colors.set("bgCyanBright", (s: string) => init(106, 49, s));
_colors.set("bgWhiteBright", (s: string) => init(107, 49, s));

export const colors = _colors;

export function hexForeground(s: string, hex: string): string {
  const rgb = hex2rgb(hex);
  return rgbInit(38, rgb, 39, s);
}

export function hexBackground(s: string, hex: string): string {
  const rgb = hex2rgb(hex);
  return rgbInit(48, rgb, 49, s);
}

function hex2rgb(hex: string): Array<u32> {
  const r: u32 = u32(parseInt(hex.slice(1, 3), 16));
  const g: u32 = u32(parseInt(hex.slice(3, 5), 16));
  const b: u32 = u32(parseInt(hex.slice(5, 7), 16));
  return [r, g, b];
}
