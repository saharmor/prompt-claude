"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "anthropic_api_key";
const CONSENT_KEY = "anthropic_api_key_saved";
export const SETTINGS_CHANGE_EVENT = "promptclaude-settings-change";
export const OPEN_SETTINGS_EVENT = "promptclaude-open-settings";

interface StoredSettings {
  key: string;
  saveConsent: boolean;
}

const emptyStoredSettings: StoredSettings = { key: "", saveConsent: false };
let cachedStoredSettings: StoredSettings = emptyStoredSettings;

function getStoredSettingsSnapshot(): StoredSettings {
  if (typeof window === "undefined") {
    return emptyStoredSettings;
  }

  const nextSnapshot = {
    key:
      localStorage.getItem(STORAGE_KEY) ??
      sessionStorage.getItem(STORAGE_KEY) ??
      "",
    saveConsent: localStorage.getItem(CONSENT_KEY) === "true",
  };

  if (
    cachedStoredSettings.key === nextSnapshot.key &&
    cachedStoredSettings.saveConsent === nextSnapshot.saveConsent
  ) {
    return cachedStoredSettings;
  }

  cachedStoredSettings = nextSnapshot;
  return cachedStoredSettings;
}

function subscribeToStoredSettings(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key !== null &&
      event.key !== STORAGE_KEY &&
      event.key !== CONSENT_KEY
    ) {
      return;
    }

    callback();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(SETTINGS_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(SETTINGS_CHANGE_EVENT, handleChange);
  };
}

function notifyStoredSettingsChange(hasApiKey: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SETTINGS_CHANGE_EVENT, {
      detail: { hasApiKey },
    })
  );
}

export function SettingsPanel() {
  const storedSettings = useSyncExternalStore(
    subscribeToStoredSettings,
    getStoredSettingsSnapshot,
    () => emptyStoredSettings
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<StoredSettings | null>(null);

  useEffect(() => {
    const handleOpenSettings = () => setOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, handleOpenSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, handleOpenSettings);
  }, []);
  const [saved, setSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guideId = "api-key-guide";

  const key = draft?.key ?? storedSettings.key;
  const saveConsent = draft?.saveConsent ?? storedSettings.saveConsent;

  function triggerSavedFeedback() {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    setSaved(true);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
  }

  function handleSave() {
    const trimmed = key.trim();
    if (!trimmed) {
      // Empty: clear everything
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CONSENT_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } else if (saveConsent) {
      // Persistent: write to localStorage only
      localStorage.setItem(STORAGE_KEY, trimmed);
      localStorage.setItem(CONSENT_KEY, "true");
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      // Session only: write to sessionStorage, do NOT persist to localStorage
      sessionStorage.setItem(STORAGE_KEY, trimmed);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CONSENT_KEY);
    }
    notifyStoredSettingsChange(trimmed.length > 0);
    if (trimmed) {
      trackEvent("api_key_saved", {
        storage: saveConsent ? "local" : "session",
      });
    }
    setDraft(null);
    triggerSavedFeedback();
    setOpen(false);
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONSENT_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    notifyStoredSettingsChange(false);
    setDraft(null);
    triggerSavedFeedback();
  }

  const isValid = key.trim() === "" || key.trim().startsWith("sk-ant-");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        aria-label="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* API Key Input */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="api-key">Anthropic API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-ant-..."
              value={key}
              onChange={(e) =>
                setDraft((current) => ({
                  key: e.target.value,
                  saveConsent: current?.saveConsent ?? storedSettings.saveConsent,
                }))
              }
              className="font-mono text-sm"
            />
            {!isValid && (
              <p className="text-xs text-destructive">
                Anthropic keys start with &quot;sk-ant-&quot;
              </p>
            )}
          </div>

          {/* Save consent */}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={saveConsent}
              onChange={(e) =>
                setDraft((current) => ({
                  key: current?.key ?? storedSettings.key,
                  saveConsent: e.target.checked,
                }))
              }
              className="mt-0.5 accent-primary"
            />
            <span className="text-muted-foreground">
              Remember this key in my browser.{" "}
              <span className="text-xs">
                The key is stored only in your browser and is never stored on
                our servers.
              </span>
            </span>
          </label>

          {/* Session-only warning */}
          {key.trim() && !saveConsent && (
            <p className="text-xs text-muted-foreground bg-muted rounded px-3 py-2 border border-border">
              <strong>Heads up:</strong> Without &quot;Remember this key,&quot;
              your key will only be kept for this browser session. You&apos;ll
              need to re-enter it after closing this tab or browser.
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={!isValid}>
              {saved ? "Saved!" : "Save"}
            </Button>
            {key && (
              <Button variant="ghost" onClick={handleClear}>
                Clear key
              </Button>
            )}
          </div>

          {/* How to get a key guide */}
          <div className="border-t border-border pt-3">
            <button
              onClick={() => setShowGuide(!showGuide)}
              aria-expanded={showGuide}
              aria-controls={guideId}
              className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span
                className="transition-transform text-xs"
                style={{
                  transform: showGuide ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                &#9654;
              </span>
              How do I get an API key?
            </button>
            {showGuide && (
              <ol
                id={guideId}
                className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground pl-5 list-decimal"
              >
                <li>
                  Go to{" "}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    console.anthropic.com
                  </a>{" "}
                  and sign in or create a free account.
                </li>
                <li>
                  Navigate to <strong>API Keys</strong> in the left sidebar.
                </li>
                <li>
                  Click <strong>Create Key</strong>, give it a name, and copy
                  the key (it starts with{" "}
                  <code className="text-xs bg-muted px-1 rounded">sk-ant-</code>
                  ).
                </li>
                <li>
                  Paste it above. The key is used only to grade your submissions
                  and is never stored on our servers.
                </li>
              </ol>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
