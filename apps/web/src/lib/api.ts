export interface ApiEnvelope<T> {
  readonly data: T;
  readonly meta: { readonly at: string };
}

export interface ApiError {
  readonly error: { readonly code: string; readonly message: string };
  readonly meta: { readonly requestId: string | null; readonly path: string | null; readonly at: string };
}

const SERVER_BASE = process.env.API_URL ?? 'http://127.0.0.1:4000';

export class ApiFailure extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiFailure';
  }
}

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = SERVER_BASE + path;
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: { accept: 'application/json', ...(init?.headers ?? {}) },
  });

  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | ApiError | null;

  if (!res.ok) {
    const err = body as ApiError | null;
    throw new ApiFailure(err?.error?.code ?? 'HTTP_' + res.status, err?.error?.message ?? 'Permintaan gagal', res.status);
  }

  const env = body as ApiEnvelope<T>;
  return env?.data as T;
}

export async function tryFetchApi<T>(path: string): Promise<T | null> {
  try {
    return await fetchApi<T>(path);
  } catch {
    return null;
  }
}
