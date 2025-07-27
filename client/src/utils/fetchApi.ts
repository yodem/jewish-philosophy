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

  const requestHeaders: HeadersInit = {
    ...(customHeaders || {}),
    ...(!customHeaders?.["Content-Type"] && { "Content-Type": "application/json" }),
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };

  const requestInit: RequestInit & { next?: NextFetchRequestConfig } = {
    method,
    headers: requestHeaders,
    ...(body && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    ...(next && { next }),
  };

  try {
    const response = await fetch(url, {...requestInit, next: { revalidate: 10, ...requestInit?.next}});
    const contentType = response.headers.get("content-type");
    if (
      contentType &&
      contentType.includes("application/json") &&
      response.ok
    ) {
      return await response.json();
    } else {
      return { status: response.status, statusText: response.statusText };
    }
  } catch (error) {
    console.error(`Error ${method} data:`, error);
    
    // During build time or when server is unavailable, return empty data structure
    // instead of throwing to prevent build failures
    const errorWithCause = error as ErrorWithCause;
    if (errorWithCause instanceof Error && 
        (errorWithCause.message.includes('ECONNREFUSED') || 
         errorWithCause.message.includes('fetch failed') ||
         errorWithCause.cause?.code === 'ECONNREFUSED')) {
      console.warn(`Server unavailable during ${method} to ${url}, returning empty response`);
      return { data: [] };
    }
    
    throw error;
  }
}
