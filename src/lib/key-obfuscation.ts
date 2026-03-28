/**
 * Obfuscates API keys stored in browser storage so they don't appear as
 * recognizable plaintext to casual observers in DevTools.
 *
 * This is NOT cryptographic security — any script running on this origin can
 * reverse the obfuscation. The goal is to prevent the key from being trivially
 * readable by someone glancing at localStorage.
 */

const OBFUSCATION_PREFIX = "v1:";

const APP_PASSPHRASE = "promptclaude-local-wrap-2025";

const ALGO = "AES-GCM";
const IV_BYTES = 12;

let _derivedKeyPromise: Promise<CryptoKey> | null = null;

function getDerivedKey(): Promise<CryptoKey> {
  if (_derivedKeyPromise) return _derivedKeyPromise;

  _derivedKeyPromise = (async () => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(APP_PASSPHRASE),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("promptclaude-salt"),
        iterations: 100_000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: ALGO, length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  })();

  return _derivedKeyPromise;
}

function toBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}

export async function obfuscate(plaintext: string): Promise<string> {
  const key = await getDerivedKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    new TextEncoder().encode(plaintext)
  );

  return OBFUSCATION_PREFIX + toBase64(iv.buffer as ArrayBuffer) + "." + toBase64(ciphertext);
}

export async function deobfuscate(stored: string): Promise<string> {
  if (!stored.startsWith(OBFUSCATION_PREFIX)) {
    return stored;
  }

  const payload = stored.slice(OBFUSCATION_PREFIX.length);
  const dotIdx = payload.indexOf(".");
  if (dotIdx === -1) return stored;

  try {
    const iv = fromBase64(payload.slice(0, dotIdx));
    const ciphertextBytes = fromBase64(payload.slice(dotIdx + 1));
    const key = await getDerivedKey();
    const plainBuf = await crypto.subtle.decrypt(
      { name: ALGO, iv: iv.buffer as ArrayBuffer },
      key,
      ciphertextBytes.buffer as ArrayBuffer
    );
    return new TextDecoder().decode(plainBuf);
  } catch {
    return stored;
  }
}

export function isObfuscated(value: string): boolean {
  return value.startsWith(OBFUSCATION_PREFIX);
}
