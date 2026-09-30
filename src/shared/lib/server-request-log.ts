import "server-only";

export function logServerEvent(event: string, details: Record<string, string | number | boolean | undefined> = {}) {
  if (process.env.NODE_ENV === "development") {
    console.info("[server]", event, details);
  }
}

/** URL 쿼리, 헤더, 요청/응답 본문은 기록하지 않는다. */
export function createLoggedFetch(scope: string): typeof fetch {
  return async (input, init) => {
    if (process.env.NODE_ENV !== "development") return fetch(input, init);
    const url = new URL(input instanceof Request ? input.url : String(input));
    const method = init?.method ?? (input instanceof Request ? input.method : "GET");
    const requestId = crypto.randomUUID();
    const started = performance.now();
    const details = { scope, requestId, method, path: url.pathname };
    logServerEvent("supabase.request", details);
    try {
      const response = await fetch(input, init);
      logServerEvent("supabase.response", {
        ...details, status: response.status, ok: response.ok,
        durationMs: Math.round(performance.now() - started),
      });
      return response;
    } catch (error) {
      logServerEvent("supabase.network_error", {
        ...details, durationMs: Math.round(performance.now() - started),
      });
      throw error;
    }
  };
}
