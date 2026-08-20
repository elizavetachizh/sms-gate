import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setCredentials } from "@/features/auth/credentials-storage";
import {
  mailingsApi,
  meApi,
  messagesApi,
  providersApi,
  statsApi,
  templatesApi,
  usersApi,
} from "./endpoints";

function jsonResponse(body: unknown = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function lastPathname(fetchMock: ReturnType<typeof vi.fn>): string {
  return new URL(fetchMock.mock.calls.at(-1)![0]).pathname;
}

describe("OpenAPI paths", () => {
  beforeEach(() => {
    setCredentials({ email: "user@example.com", password: "password123" });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("keeps documented trailing slashes and does not rewrite paths", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(jsonResponse()));
    vi.stubGlobal("fetch", fetchMock);

    await meApi.get();
    expect(lastPathname(fetchMock)).toBe("/api/v1/users/me/");

    await usersApi.update("user-id", {});
    expect(lastPathname(fetchMock)).toBe("/api/v1/users/user-id/");

    await providersApi.update("fake", {});
    expect(lastPathname(fetchMock)).toBe("/api/v1/providers/fake");

    await mailingsApi.getById("mailing-id");
    expect(lastPathname(fetchMock)).toBe("/api/v1/mailings/mailing-id");

    await mailingsApi.update("mailing-id", {});
    expect(lastPathname(fetchMock)).toBe("/api/v1/mailings/mailing-id/");

    await mailingsApi.delete("mailing-id");
    expect(lastPathname(fetchMock)).toBe("/api/v1/mailings/mailing-id");

    await mailingsApi.send("mailing-id");
    expect(lastPathname(fetchMock)).toBe("/api/v1/mailings/mailing-id/send");

    await messagesApi.create("mailing-id", {
      msisdn: "375291234567",
      text: "Hi",
    });
    expect(lastPathname(fetchMock)).toBe(
      "/api/v1/mailings/mailing-id/messages/",
    );

    await messagesApi.getById("mailing-id", "message-id");
    expect(lastPathname(fetchMock)).toBe(
      "/api/v1/mailings/mailing-id/messages/message-id",
    );

    await templatesApi.getById("template-id");
    expect(lastPathname(fetchMock)).toBe("/api/v1/templates/template-id");

    await statsApi.messagesByProvider({
      date_from: "2026-01-01",
      date_to: "2026-01-02",
      timezone: "UTC",
    });
    expect(lastPathname(fetchMock)).toBe("/api/v1/stats/messages-by-provider");
  });
});
