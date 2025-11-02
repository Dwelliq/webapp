import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Header } from "@/components/layout/Header";
import { ClerkProvider } from "@clerk/nextjs";

// Mock Clerk hooks
vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useUser: vi.fn(() => ({ isLoaded: true })),
  SignedIn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-in">{children}</div>
  ),
  SignedOut: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-out">{children}</div>
  ),
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  UserButton: () => <div data-testid="user-button">UserButton</div>,
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders logo link with correct href", () => {
    render(
      <ClerkProvider>
        <Header />
      </ClerkProvider>
    );

    const logo = screen.getByText("Dwelliq");
    expect(logo).toBeInTheDocument();
    expect(logo.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders navigation links", () => {
    render(
      <ClerkProvider>
        <Header />
      </ClerkProvider>
    );

    expect(screen.getByText("Buy")).toBeInTheDocument();
    expect(screen.getByText("Sell")).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("toggles mobile menu when button is clicked", async () => {
    render(
      <ClerkProvider>
        <Header />
      </ClerkProvider>
    );

    const menuButton = screen.getByLabelText(/toggle navigation menu/i);
    expect(menuButton).toBeInTheDocument();

    // Mobile menu should not be visible initially
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(menuButton);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Click to close
    fireEvent.click(menuButton);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes mobile menu when link is clicked", async () => {
    render(
      <ClerkProvider>
        <Header />
      </ClerkProvider>
    );

    const menuButton = screen.getByLabelText(/toggle navigation menu/i);
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const buyLink = screen.getAllByText("Buy")[1]; // Second instance is in mobile menu
    fireEvent.click(buyLink);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("has proper ARIA attributes for mobile menu button", () => {
    render(
      <ClerkProvider>
        <Header />
      </ClerkProvider>
    );

    const menuButton = screen.getByLabelText(/toggle navigation menu/i);
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveAttribute("aria-controls", "mobile-menu");
  });

  it("renders with semantic header element", () => {
    const { container } = render(
      <ClerkProvider>
        <Header />
      </ClerkProvider>
    );

    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });
});

