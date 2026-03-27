export function readBrowserJson<T>(storageKey: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeBrowserJson(
  storageKey: string,
  value: unknown,
  changeEvent: string
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(value));
  window.dispatchEvent(new Event(changeEvent));
}

export function removeBrowserValue(storageKey: string, changeEvent: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeToBrowserStorage(
  storageKey: string,
  changeEvent: string,
  callback: () => void
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key !== null &&
      event.key !== storageKey
    ) {
      return;
    }

    callback();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(changeEvent, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(changeEvent, handleChange);
  };
}

export function createBrowserStore(storageKey: string, changeEvent: string) {
  return {
    storageKey,
    changeEvent,
    read<T>(fallback: T) {
      return readBrowserJson(storageKey, fallback);
    },
    write(value: unknown) {
      writeBrowserJson(storageKey, value, changeEvent);
    },
    remove() {
      removeBrowserValue(storageKey, changeEvent);
    },
    subscribe(callback: () => void) {
      return subscribeToBrowserStorage(storageKey, changeEvent, callback);
    },
  };
}
