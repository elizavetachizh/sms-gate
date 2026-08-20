import { getApiBaseUrl, getCredentials } from "./config.ts";
import {
  ApiError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./errors.ts";
import type { BasicCredentials } from "./types.ts";

type QueryParamValue =
  | string
  | number
  | boolean
  | readonly (string | number | boolean)[]
  | undefined
  | null;

// Query params are represented as an object where each key is a query-string name.
// Array values become repeated params: { status: ['queued', 'failed'] }
// -> ?status=queued&status=failed
type QueryParams = Record<string, QueryParamValue>;

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: QueryParams;
  /** Override stored credentials, e.g. login probe before saving the session. */
  auth?: BasicCredentials;
};

function buildUrl(baseUrl: string, path: string, params?: QueryParams): string {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(
    `${normalizedBase}${normalizedPath}`,
    window.location.origin,
  );

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          // append preserves repeated filters required by the API.
          url.searchParams.append(key, String(item));
        }
      } else if (value !== undefined && value !== null && value !== "") {
        // set is used for scalar params where a key should have a single value.
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

function toBasicAuthorization(credentials: BasicCredentials): string {
  return `Basic ${btoa(`${credentials.email}:${credentials.password}`)}`;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly resolveCredentials: () => BasicCredentials | null;

  constructor(
    baseUrl: string,
    resolveCredentials: () => BasicCredentials | null,
  ) {
    this.baseUrl = baseUrl;
    this.resolveCredentials = resolveCredentials;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, params, headers, auth, ...init } = options;
    const credentials = auth ?? this.resolveCredentials();

    if (!credentials) {
      throw new UnauthorizedError();
    }

    const response = await fetch(buildUrl(this.baseUrl, path, params), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        Authorization: toBasicAuthorization(credentials),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      throw new UnauthorizedError();
    }

    if (response.status === 403) {
      throw new ForbiddenError();
    }

    if (response.status === 400) {
      const errorBody = (await response.json().catch(() => null)) as {
        detail?: string;
      } | null;
      throw new BadRequestError(errorBody?.detail ?? "Bad request");
    }

    if (response.status === 404) {
      const errorBody = (await response.json().catch(() => null)) as {
        detail?: string;
      } | null;
      throw new NotFoundError(errorBody?.detail ?? "Not found");
    }

    if (response.status === 409) {
      const errorBody = (await response.json().catch(() => null)) as {
        detail?: string;
      } | null;
      throw new ConflictError(errorBody?.detail ?? "Conflict");
    }

    if (response.status === 422) {
      throw await ValidationError.fromResponse(response);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new ApiError(response.status, errorBody);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(
    path: string,
    params?: QueryParams,
    options?: Omit<RequestOptions, "params" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "GET", params });
  }

  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">,
  ) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">,
  ) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  delete(path: string, options?: Omit<RequestOptions, "body">) {
    return this.request<void>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(getApiBaseUrl(), getCredentials);
