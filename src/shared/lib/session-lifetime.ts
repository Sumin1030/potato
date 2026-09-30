export const SESSION_MAX_AGE_SECONDS = 20 * 60;
const CLOCK_SKEW_TOLERANCE_SECONDS = 60;

/** 반드시 getClaims()로 서명을 검증한 클레임을 전달한다. iat는 갱신되므로 사용하지 않는다. */
export function isLoginExpired(claims: { amr?: unknown }, now = Date.now()) {
  if (!Array.isArray(claims.amr)) return reportExpired("missing_authentication_time");
  const timestamps = claims.amr.flatMap((entry: unknown) => {
    if (!entry || typeof entry !== "object") return [];
    const value = entry as { method?: unknown; timestamp?: unknown };
    return value.method === "password" && typeof value.timestamp === "number" && Number.isFinite(value.timestamp)
      ? [value.timestamp] : [];
  });
  if (!timestamps.length) return reportExpired("missing_password_authentication_time");
  const signedInAt = Math.min(...timestamps);
  const ageSeconds = now / 1000 - signedInAt;
  if (signedInAt <= 0) return reportExpired("invalid_authentication_time");
  if (ageSeconds < -CLOCK_SKEW_TOLERANCE_SECONDS) return reportExpired("authentication_time_in_future", ageSeconds);
  if (ageSeconds >= SESSION_MAX_AGE_SECONDS) return reportExpired("duration_exceeded", ageSeconds);
  return false;
}

function reportExpired(reason: string, ageSeconds?: number) {
  if (process.env.NODE_ENV === "development") {
    console.info("[server]", "session.rejected", { reason, ageSeconds, maxAgeSeconds: SESSION_MAX_AGE_SECONDS });
  }
  return true;
}
