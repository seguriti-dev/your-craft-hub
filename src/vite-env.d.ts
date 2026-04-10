/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_TURNSTILE_USE_TEST_KEYS?: string;
  readonly VITE_TURNSTILE_TEST_BEHAVIOR?: "pass" | "fail" | "interactive";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  turnstile?: {
    render: (
      container: string | HTMLElement,
      options: {
        sitekey: string;
        callback?: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
      }
    ) => string;
    reset: (widgetId?: string) => void;
    remove?: (widgetId: string) => void;
  };
}
