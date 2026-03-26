import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google";

import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Ohio Notary OS",
  description: "Operations console for an Ohio mobile and RON notary business.",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/book-now", label: "Book Now" },
  { href: "/portal", label: "Portal" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans text-ink antialiased">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-12 pt-4 md:px-5 md:pt-6 lg:px-8">
          <header className="rounded-[28px] border border-black/5 bg-white/75 px-4 py-4 shadow-card backdrop-blur md:rounded-[32px] md:px-6 md:py-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-rust">Ohio Notary OS</p>
                <h1 className="mt-2 font-serif text-3xl leading-none text-ink md:text-4xl xl:text-5xl">
                  Columbus operations, Ohio rules.
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-walnut/75">
                  Public booking website, secure client portal, and internal Ohio
                  notary operations in one workspace.
                </p>
              </div>
              <div className="w-full rounded-[20px] bg-ink px-4 py-3 text-sm text-parchment xl:w-auto xl:shrink-0">
                Ohio fee caps: in-person `$5/act`, RON `$30/act`, tech `$10/session`
              </div>
            </div>
            <nav className="mt-5 flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-black/5 bg-parchment px-3 py-2 text-sm text-walnut transition hover:bg-white md:px-4"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="mt-8 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
