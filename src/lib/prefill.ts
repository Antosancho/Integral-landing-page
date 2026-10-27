type Listener = (message: string) => void;
interface PrefillStore {
  pending: string | null;
  listeners: Set<Listener>;
}

const KEY = '__factorIntegralContactPrefill';

// Store guardado en globalThis → compartido entre islas aunque el bundler duplique el módulo.
function getStore(): PrefillStore {
  const g = globalThis as unknown as Record<string, PrefillStore | undefined>;
  let store = g[KEY];
  if (!store) {
    store = { pending: null, listeners: new Set() };
    g[KEY] = store;
  }
  return store;
}

export function setContactPrefill(message: string): void {
  const store = getStore();
  store.pending = message;
  store.listeners.forEach((fn) => fn(message));
}

export function consumeContactPrefill(): string | null {
  const store = getStore();
  const value = store.pending;
  store.pending = null;
  return value;
}

export function subscribeContactPrefill(fn: Listener): () => void {
  const store = getStore();
  store.listeners.add(fn);
  return () => {
    store.listeners.delete(fn);
  };
}

/** Solo para tests. */
export function __resetContactPrefill(): void {
  const store = getStore();
  store.pending = null;
  store.listeners.clear();
}
