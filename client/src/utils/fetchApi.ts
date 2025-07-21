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
    const response = await fetch(url, requestInit);
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
    throw error;
  }
}
