import Link from "next/link";

type FooterLink = {
  href: string;
  label: string;
};

const footerLinks: ReadonlyArray<FooterLink> = [
  { href: "/how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer role="contentinfo" className="border-t border-gray-200 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-6 justify-center sm:justify-start">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 text-center sm:text-left">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Dwelliq. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
