import { useSyncExternalStore } from "react";

import { KEY_STORAGE_KEY, looksLikeOpenRouterKey } from "@/lib/openrouter";

const listeners = new Set<() => void>();

function emitKeyStoreChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribeKeyStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readStoredKey(): string | null {
  try {
    const existing = sessionStorage.getItem(KEY_STORAGE_KEY);
    if (existing && looksLikeOpenRouterKey(existing)) {
      return existing;
    }
  } catch {
    // sessionStorage may be unavailable.
  }
  return null;
}

function getServerKeySnapshot(): string | null {
  return null;
}

export function writeStoredKey(value: string): boolean {
  try {
    sessionStorage.setItem(KEY_STORAGE_KEY, value);
    emitKeyStoreChange();
    return true;
  } catch {
    emitKeyStoreChange();
    return false;
  }
}

export function clearStoredKey(): void {
  try {
    sessionStorage.removeItem(KEY_STORAGE_KEY);
  } catch {
    // ignore
  }
  emitKeyStoreChange();
}

export function useStoredOpenRouterKey(): string | null {
  return useSyncExternalStore(subscribeKeyStore, readStoredKey, getServerKeySnapshot);
}
