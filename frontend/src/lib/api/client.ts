export const API_BASE_URL = ((import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

export class ApiError extends Error {
  status?: number | undefined;
  isNetworkError: boolean;

  constructor(message: string, options: { status?: number; isNetworkError?: boolean } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.isNetworkError = options.isNetworkError ?? false;
  }
}

const NETWORK_MESSAGE = `Unable to reach the local RAG server. Make sure your backend is running at ${API_BASE_URL}`;

function extractMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload.trim().slice(0, 400);
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["detail", "message", "error"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
      if (Array.isArray(value) && value.length) {
        const first = value[0] as Record<string, unknown> | string;
        if (typeof first === "string") return first;
        if (first && typeof first["msg"] === "string") return first["msg"] as string;
      }
    }
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(NETWORK_MESSAGE, { isNetworkError: true });
  }

  const raw = await response.text();
  let payload: unknown = raw;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }
  }

  if (!response.ok) {
    throw new ApiError(extractMessage(payload, `The local RAG server responded with ${response.status}.`), { status: response.status });
  }

  return payload as T;
}

export const apiClient = {
  postJson: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
};
