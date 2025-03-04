import { render, screen, fireEvent } from "@testing-library/react";
import DisputeCard from "./vendorDisputeCard";
import { describe, it, expect, vi } from "vitest";

// Mocking utility functions to control outputs
vi.mock("../../utils/currencyFormatter", () => ({
  formatCurrency: (amount) => `$${amount.toFixed(2)}`,
}));

vi.mock("../../utils/dateFormates", () => ({
  formatDate: () => "Jan 1, 2023",
}));

vi.mock("../../utils/statusStyles", () => ({
  getStatusStyle: (status) =>
    status === "Resolved" ? { color: "green" } : { color: "red" },
}));

describe("DisputeCard Component", () => {
  const mockDispute = {
    transactionId: "TX12345",
    email: "user@example.com",
    amount: 150.5,
    complaintType: "Unauthorized Transaction",
    createdAt: "2023-01-01T12:00:00Z",
    status: "Pending",
  };

  it("renders all dispute details correctly", () => {
    render(<DisputeCard dispute={mockDispute} onClick={() => {}} />);

    expect(screen.getByText(`Transaction ID: ${mockDispute.transactionId}`)).toBeInTheDocument();
    expect(screen.getByText(mockDispute.email)).toBeInTheDocument();
    expect(screen.getByText("$150.50")).toBeInTheDocument(); // Formatted currency
    expect(screen.getByText(mockDispute.complaintType)).toBeInTheDocument();
    expect(screen.getByText("Jan 1, 2023")).toBeInTheDocument(); // Mocked formatted date
    expect(screen.getByText(mockDispute.status)).toBeInTheDocument();
  });

  it("applies correct status styling", () => {
    render(<DisputeCard dispute={{ ...mockDispute, status: "Resolved" }} onClick={() => {}} />);
    const statusElement = screen.getByText("Resolved");

    // ✅ Fix: Check actual computed color style
    const computedColor = getComputedStyle(statusElement).color;
    expect(["green", "rgb(0, 128, 0)"]).toContain(computedColor);
  });

  it("handles card click event", () => {
    const mockOnClick = vi.fn();
    render(<DisputeCard dispute={mockDispute} onClick={mockOnClick} />);

    const cardElement = screen.getByText(`Transaction ID: ${mockDispute.transactionId}`);
    fireEvent.click(cardElement);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockDispute);
  });

  it("truncates long email addresses correctly", () => {
    const longEmailDispute = { ...mockDispute, email: "verylongemailaddress@example.com" };
    render(<DisputeCard dispute={longEmailDispute} onClick={() => {}} />);

    const emailElement = screen.getByText("verylongemailaddress@example.com");
    expect(emailElement).toBeInTheDocument();
    expect(emailElement).toHaveClass("text-truncate");
  });

  it("applies correct currency formatting", () => {
    render(<DisputeCard dispute={mockDispute} onClick={() => {}} />);
    expect(screen.getByText("$150.50")).toBeInTheDocument();
  });

  it("applies correct date formatting", () => {
    render(<DisputeCard dispute={mockDispute} onClick={() => {}} />);
    expect(screen.getByText("Jan 1, 2023")).toBeInTheDocument();
  });
});
