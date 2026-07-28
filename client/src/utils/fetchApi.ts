type NextFetchRequestConfig = {
  revalidate?: number | false;
  tags?: string[];
};

interface FetchAPIOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  authToken?: string;
  body?: Record<string, unknown> | string;
  next?: NextFetchRequestConfig;
  headers?: Record<string, string>;
}

interface ErrorWithCause extends Error {
  cause?: { code?: string };
}

export type StrapiErrorPayload = {
  message: string;
  status: number;
  name?: string;
};

/** Loose result shape — callers historically treat this as untyped Strapi JSON. */
export type FetchAPIResult = {
  data?: any;
  error?: StrapiErrorPayload;
  meta?: any;
  status?: number;
  statusText?: string;
  [key: string]: any;
};

/** Throw when Strapi returned an error — callers must not treat this as a content miss. */
export function assertNoStrapiError(
  res: { error?: StrapiErrorPayload } | null | undefined,
  context: string
): void {
  if (res?.error) {
    throw new Error(
      `Strapi error in ${context}: ${res.error.status} ${res.error.message}`
    );
  }
}

export async function fetchAPI(
  url: string,
  options: FetchAPIOptions
): Promise<FetchAPIResult> {
  const { method, authToken, body, next, headers: customHeaders } = options;

  // Prefer server-only token; fall back to NEXT_PUBLIC_ for backward compatibility
  const token =
    authToken ||
    process.env.STRAPI_API_TOKEN ||
    process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  const requestHeaders: HeadersInit = {
    ...(customHeaders || {}),
    ...(!customHeaders?.["Content-Type"] && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const requestInit: RequestInit & { next?: NextFetchRequestConfig } = {
    method,
    headers: requestHeaders,
    ...(body && { body: typeof body === "string" ? body : JSON.stringify(body) }),
    ...(next && { next }),
  };

  try {
    const response = await fetch(url, {
      ...requestInit,
      next: { ...requestInit?.next },
    });
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (isJson) {
      const data = await response.json();
      if (!response.ok) {
        // Strapi returns { error: { message, status, name } } on errors
        return data.error
          ? data
          : {
              error: {
                message: data.message || response.statusText,
                status: response.status,
              },
            };
      }
      return data;
    } else {
      if (!response.ok) {
        return { error: { message: response.statusText, status: response.status } };
      }
      return { status: response.status, statusText: response.statusText };
    }
  } catch (error) {
    const err = error as ErrorWithCause;
    const isUnavailable =
      err?.message?.includes("ECONNREFUSED") ||
      err?.message?.includes("fetch failed") ||
      (err?.cause as { code?: string })?.code === "ECONNREFUSED";
    if (isUnavailable) {
      // Do NOT return { data: [] } — that looks like a content miss and poisons 404 caches
      return {
        data: null,
        error: {
          message: err.message || "fetch failed",
          status: 503,
          name: "ServiceUnavailable",
        },
      };
    }
    console.error(`Error ${method} data:`, error);
    throw error;
  }
}
