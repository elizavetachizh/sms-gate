import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MailingStatusBadge } from "./MailingStatusBadge";

describe("MailingStatusBadge", () => {
  it("renders delivered mailing status", () => {
    render(<MailingStatusBadge status="delivered" />);

    expect(screen.getByText("Доставлено")).toBeInTheDocument();
  });

  it("renders created mailing status", () => {
    render(<MailingStatusBadge status="created" />);

    expect(screen.getByText("Создана")).toBeInTheDocument();
  });
});
