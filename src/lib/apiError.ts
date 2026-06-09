/**
 * Maps an error thrown by the Groq SDK into a user-facing message and HTTP
 * status. The free Groq tier returns 429 when rate-limited and can also surface
 * transient 5xx errors when it's overloaded — in both cases the right thing for
 * the user to do is simply wait and retry, so we tell them that plainly.
 */

export const RATE_LIMIT_MESSAGE =
  "The Groq API hit its rate limit. Please try again in a little while — this demo runs on the free Groq API, which has limited capacity.";

const GENERIC_MESSAGE =
  "Something went wrong talking to the AI service. Please try again.";

/** Pull a numeric HTTP status off an unknown error, if it has one. */
function statusOf(err: unknown): number | undefined {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

export interface ApiErrorInfo {
  /** HTTP status to return to the client. */
  status: number;
  /** Friendly message safe to show in the UI. */
  message: string;
  /** True when the failure is a rate limit / overload the user can retry. */
  rateLimited: boolean;
}

export function toApiError(err: unknown): ApiErrorInfo {
  const status = statusOf(err);

  // 429 = rate limited, 5xx = upstream overloaded/unavailable. Both are
  // "wait and retry" situations on the free tier.
  if (status === 429 || (status !== undefined && status >= 500)) {
    return { status: 429, message: RATE_LIMIT_MESSAGE, rateLimited: true };
  }

  return { status: status ?? 500, message: GENERIC_MESSAGE, rateLimited: false };
}
