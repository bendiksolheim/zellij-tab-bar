export interface ZellijPlugin {
  load(configuration: Map<string, string>): void;
  update(): bool;
  render(rows: i32, cols: i32): void;
}

let STATE: ZellijPlugin | null = null;

export function registerPlugin(p: ZellijPlugin): void {
  STATE = p;
}

export function load(): void {
  if (STATE !== null) {
    STATE!.load(new Map());
  }
}

export function update(): bool {
  if (STATE !== null) {
    return STATE!.update();
  } else {
    return false;
  }
}

export function render(rows: i32, cols: i32): void {
  if (STATE !== null) {
    STATE!.render(rows, cols);
  }
}

export function plugin_version(): void {
  console.log("0.39.0");
}
