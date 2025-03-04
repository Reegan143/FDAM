import { render, screen } from "@testing-library/react";
import DisputeHeader from "./disputeHeader";
import { describe, it, expect } from "vitest";

describe("DisputeHeader Component", () => {
  it("renders correctly with a given dispute count", () => {
    render(<DisputeHeader count={5} />);
    expect(screen.getByText("Associated Disputes (5)")).toBeInTheDocument();
  });

  it("renders correctly with zero disputes", () => {
    render(<DisputeHeader count={0} />);
    expect(screen.getByText("Associated Disputes (0)")).toBeInTheDocument();
  });

  it("renders correctly with a large number of disputes", () => {
    render(<DisputeHeader count={1000} />);
    expect(screen.getByText("Associated Disputes (1000)")).toBeInTheDocument();
  });

  it("renders correctly with negative dispute count", () => {
    render(<DisputeHeader count={-5} />);
    expect(screen.getByText("Associated Disputes (-5)")).toBeInTheDocument();
  });
});
