const RELOAD_KEY = "qf_chunk_reloaded_at";

function isChunkLoadError(message: string) {
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

/**
 * When a deploy replaces the JS files, an open tab may still request the old
 * ones and blank out. Reload once (at most every 10s) to pick up the new build.
 */
export function installChunkReloadGuard() {
  if (typeof window === "undefined") return;

  const maybeReload = (message: string) => {
    if (!isChunkLoadError(message)) return;
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    window.location.reload();
  };

  window.addEventListener("error", (e) => maybeReload(String(e.message ?? "")));
  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    maybeReload(String(reason?.message ?? reason ?? ""));
  });
}
