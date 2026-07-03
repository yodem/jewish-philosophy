import "server-only";

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

export async function fetchAPI(url: string, options: FetchAPIOptions) {
  const { method, authToken, body, next, headers: customHeaders } = options;

  // Use provided authToken or fall back to server-only env var, then public env var for backward compatibility
  const token = authToken || process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  const requestHeaders: HeadersInit = {
    ...(customHeaders || {}),
    ...(!customHeaders?.["Content-Type"] && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const requestInit: RequestInit & { next?: NextFetchRequestConfig } = {
    method,
    headers: requestHeaders,
    ...(body && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    ...(next && { next }),
  };

  try {
    const response = await fetch(url, {...requestInit, next: { ...requestInit?.next}});
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (isJson) {
      const data = await response.json();
      if (!response.ok) {
        // Strapi returns { error: { message, status, name } } on errors
        // If it doesn't have that shape, synthesize it
        return data.error
          ? data
          : { error: { message: data.message || response.statusText, status: response.status } };
      }
      return data;
    } else {
      if (!response.ok) {
        return { error: { message: response.statusText, status: response.status } };
      }
      return { status: response.status, statusText: response.statusText };
    }
  } catch (error) {
    // During build time or when server is unavailable, return empty data structure
    // instead of throwing to prevent build failures and noisy logs
    const err = error as ErrorWithCause;
    const isUnavailable =
      err?.message?.includes('ECONNREFUSED') ||
      err?.message?.includes('fetch failed') ||
      (err?.cause as { code?: string })?.code === 'ECONNREFUSED';
    if (isUnavailable) {
      return { data: [] };
    }
    console.error(`Error ${method} data:`, error);
    throw error;
  }
}
