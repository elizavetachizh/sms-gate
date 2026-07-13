import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QueryLoadingPanel } from "./query-loading-panel";

function countSkeletons(container: HTMLElement) {
  return container.querySelectorAll(".animate-pulse").length;
}

describe("QueryLoadingPanel", () => {
  it("renders table-rows preset with 5 skeletons by default", () => {
    const { container } = render(<QueryLoadingPanel />);

    expect(countSkeletons(container)).toBe(5);
    expect(container.querySelector(".rounded-lg.border")).not.toBeNull();
  });

  it("renders custom row count for table-rows preset", () => {
    const { container } = render(
      <QueryLoadingPanel preset="table-rows" rows={3} />,
    );

    expect(countSkeletons(container)).toBe(3);
  });

  it("renders detail preset with 3 skeletons", () => {
    const { container } = render(<QueryLoadingPanel preset="detail" />);

    expect(countSkeletons(container)).toBe(3);
  });

  it("renders cards-grid preset with 3 skeletons by default", () => {
    const { container } = render(<QueryLoadingPanel preset="cards-grid" />);

    expect(countSkeletons(container)).toBe(3);
    expect(container.querySelector(".sm\\:grid-cols-2")).not.toBeNull();
  });

  it("renders chart preset with one skeleton", () => {
    const { container } = render(<QueryLoadingPanel preset="chart" />);

    expect(countSkeletons(container)).toBe(1);
    expect(container.querySelector(".h-80")).not.toBeNull();
  });

  it("renders form preset with 2 skeletons", () => {
    const { container } = render(<QueryLoadingPanel preset="form" />);

    expect(countSkeletons(container)).toBe(2);
  });

  it("renders table preset with one skeleton", () => {
    const { container } = render(<QueryLoadingPanel preset="table" />);

    expect(countSkeletons(container)).toBe(1);
    expect(container.querySelector(".h-64")).not.toBeNull();
  });

  it("renders custom children instead of preset", () => {
    render(
      <QueryLoadingPanel>
        <p>Загрузка…</p>
      </QueryLoadingPanel>,
    );

    expect(screen.getByText("Загрузка…")).toBeInTheDocument();
  });

  it("sets aria-busy on the wrapper", () => {
    const { container } = render(<QueryLoadingPanel preset="chart" />);

    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });
});
