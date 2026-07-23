import { describe, expect, it } from "vitest";

import { filterMessagesExcludingIds } from "@/features/mailings/lib/mailing-messages-update";
import type { MessageRead } from "@/shared/api";

function createMessage(
  msisdn: string,
  status: MessageRead["status"] = "created",
): MessageRead {
  return {
    id: msisdn,
    msisdn,
    text: "Hello",
    send_on: null,
    external_id: null,
    status,
    batch_id: null,
  };
}

describe("filterMessagesExcludingIds", () => {
  it("removes only created messages with matching ids", () => {
    const messages = [
      createMessage("375291234567"),
      createMessage("375331234567"),
      createMessage("375441234567", "queued"),
    ];

    const remaining = filterMessagesExcludingIds(
      messages,
      new Set(["375291234567", "375441234567"]),
    );

    expect(remaining.map((message) => message.msisdn)).toEqual([
      "375331234567",
      "375441234567",
    ]);
  });
});
