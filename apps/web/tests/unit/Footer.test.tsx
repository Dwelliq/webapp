import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Footer } from "@/components/layout/Footer";

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

describe("Footer", () => {
  it("renders footer with semantic element", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("renders all footer links", () => {
    render(<Footer />);

    expect(screen.getByText("How it works")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("Terms")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("displays current year in copyright", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear}`, "i"))).toBeInTheDocument();
  });

  it("has proper navigation ARIA label", () => {
    render(<Footer />);
    const nav = screen.getByLabelText("Footer navigation");
    expect(nav).toBeInTheDocument();
  });

  it("renders links with correct hrefs", () => {
    render(<Footer />);

    expect(screen.getByText("How it works").closest("a")).toHaveAttribute(
      "href",
      "/how"
    );
    expect(screen.getByText("Privacy").closest("a")).toHaveAttribute(
      "href",
      "/privacy"
    );
  });

  it("has accessible link structure", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
      expect(link.textContent).toBeTruthy();
    });
  });
});

