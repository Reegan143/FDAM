import { render, screen } from "@testing-library/react";
import NotificationToast from "./notificationToast";
import { describe, it, expect } from "vitest";

describe("NotificationToast Component", () => {
  it("renders without crashing when there are no notifications", () => {
    render(<NotificationToast notifications={[]} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders a single notification correctly", () => {
    const notifications = [
      { id: 1, message: "Test Notification", variant: "success" }
    ];
    render(<NotificationToast notifications={notifications} />);

    expect(screen.getByText("Test Notification")).toBeInTheDocument();
    expect(screen.getByText("Notification")).toBeInTheDocument();
  });

  it("renders multiple notifications correctly", () => {
    const notifications = [
      { id: 1, message: "First Notification", variant: "success" },
      { id: 2, message: "Second Notification", variant: "danger" }
    ];
    render(<NotificationToast notifications={notifications} />);

    expect(screen.getByText("First Notification")).toBeInTheDocument();
    expect(screen.getByText("Second Notification")).toBeInTheDocument();
  });

  it("applies correct styles based on the variant", () => {
    const notifications = [
      { id: 1, message: "Error Message", variant: "danger" }
    ];
    render(<NotificationToast notifications={notifications} />);

    const toastBody = screen.getByText("Error Message");
    expect(toastBody).toHaveClass("text-white");
  });

  it("renders the timestamp correctly", () => {
    const notifications = [
      { id: 1, message: "Time Test", variant: "info" }
    ];
    render(<NotificationToast notifications={notifications} />);

    expect(screen.getByText("Notification")).toBeInTheDocument();
    expect(screen.getByText(/:/)).toBeInTheDocument(); // Checks for time format like HH:MM:SS
  });
});
