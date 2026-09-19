/**
 * Node 22+ ships an experimental native `localStorage` that, without a
 * --localstorage-file flag, ends up undefined (with a console warning) —
 * and in this Vitest+jsdom setup `window` is `globalThis`, so there's no
 * way to route around it by going through `window.localStorage` either.
 * Rather than depend on jsdom's own storage implementation or Node's
 * experimental one — both version-sensitive and outside our control —
 * this defines a small, fully self-contained in-memory Storage on
 * globalThis before any test runs. It's only ever used in tests; real
 * browsers provide their own localStorage, untouched by this file.
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
  writable: true,
});
