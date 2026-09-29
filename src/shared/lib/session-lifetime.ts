export const SESSION_MAX_AGE_SECONDS = 20 * 60;

/** 반드시 getClaims()로 서명을 검증한 클레임을 전달한다. iat는 갱신되므로 사용하지 않는다. */
export function isLoginExpired(claims: { amr?: unknown }, now = Date.now()) {
  if (!Array.isArray(claims.amr)) return true;
  const timestamps = claims.amr.flatMap((entry: unknown) => {
    if (!entry || typeof entry !== "object") return [];
    const value = entry as { method?: unknown; timestamp?: unknown };
    return value.method === "password" && typeof value.timestamp === "number" && Number.isFinite(value.timestamp)
      ? [value.timestamp] : [];
  });
  if (!timestamps.length) return true;
  const signedInAt = Math.min(...timestamps);
  return signedInAt <= 0 || signedInAt > now / 1000 || now / 1000 >= signedInAt + SESSION_MAX_AGE_SECONDS;
}
