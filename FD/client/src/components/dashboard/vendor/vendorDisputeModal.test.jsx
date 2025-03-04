import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, vi, beforeEach, afterEach } from "vitest";
import DisputeModal from "./vendorDisputeModal";
import { formatCurrency } from "../../utils/currencyFormatter";
import { formatDate } from "../../utils/dateFormates";
import { getStatusStyle } from "../../utils/statusStyles";
import { useVendorDispute } from "../../../hooks/useVendorDispute";
import "@testing-library/jest-dom";

vi.mock("../../../hooks/useVendorDispute");

describe("DisputeModal Component", () => {
  const mockHandleSubmitResponse = vi.fn();
  const mockHandleRequestApiKey = vi.fn();
  const mockHandleDownloadPDF = vi.fn();
  const mockSetResponseMessage = vi.fn();
  const mockOnClose = vi.fn();
  const mockAddNotification = vi.fn();

  const dispute = {
    email: "user@example.com",
    ticketNumber: "T12345",
    transactionId: "TX98765",
    amount: 100.5,
    createdAt: "2024-03-01T12:00:00Z",
    digitalChannel: "Online Banking",
    debitCardNumber: "**** **** **** 1234",
    cardType: "VISA",
    status: "Pending",
    complaintType: "Unauthorized Transaction",
    description: "Transaction not recognized",
    vendorResponse: null,
    updatedAt: "2024-03-02T12:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useVendorDispute.mockReturnValue({
      handleSubmitResponse: mockHandleSubmitResponse,
      handleRequestApiKey: mockHandleRequestApiKey,
      handleDownloadPDF: mockHandleDownloadPDF,
    });

    act(() => {
      render(
        <DisputeModal
          show={true}
          dispute={dispute}
          responseMessage=""
          setResponseMessage={mockSetResponseMessage}
          onClose={mockOnClose}
          modalAnimation="fade"
          addNotification={mockAddNotification}
        />
      );
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });


  it("calls handleRequestApiKey when 'Request API Key' button is clicked", () => {
    const requestApiKeyButton = screen.getByRole("button", { name: /Request API Key/i });
    fireEvent.click(requestApiKeyButton);
    expect(mockHandleRequestApiKey).toHaveBeenCalledTimes(1);
  });

  it("renders textarea and updates response message", () => {
    const textarea = screen.getByPlaceholderText("Enter your response to this dispute...");
    fireEvent.change(textarea, { target: { value: "This is my response" } });
    expect(mockSetResponseMessage).toHaveBeenCalledWith("This is my response");
  });

  it("calls handleSubmitResponse when 'Submit' button is clicked", () => {
    const submitButton = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(submitButton);
    expect(mockHandleSubmitResponse).toHaveBeenCalledTimes(1);
  });

  it("calls handleDownloadPDF when 'Download PDF' button is clicked", () => {
    const downloadButton = screen.getByRole("button", { name: /Download PDF/i });
    fireEvent.click(downloadButton);
    expect(mockHandleDownloadPDF).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when 'Close' button is clicked", () => {
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("displays vendor response if available", () => {
    act(() => {
      render(
        <DisputeModal
          show={true}
          dispute={{ ...dispute, vendorResponse: "Approved. No fraud detected." }}
          responseMessage=""
          setResponseMessage={mockSetResponseMessage}
          onClose={mockOnClose}
          modalAnimation="fade"
          addNotification={mockAddNotification}
        />
      );
    });

    expect(screen.getByText("Your Response:")).toBeInTheDocument();
    expect(screen.getByText("Approved. No fraud detected.")).toBeInTheDocument();
    expect(screen.getByText(`Submitted on ${formatDate(dispute.updatedAt)}`)).toBeInTheDocument();
  });
});
