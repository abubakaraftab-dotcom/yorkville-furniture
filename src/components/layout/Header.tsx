"use client";

import { useState } from "react";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import HeaderCategoriesDropdown from "./HeaderCategoriesDropdown";
import { getAllCategories } from "@/lib/categories";
import ProvinceSelector from "./ProvinceSelector";
import CartIcon from "@/components/cart/CartIcon";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/products", label: "Products" },
  { href: "/provinces", label: "Provinces" },
  { href: "/custom-build", label: "Custom Build" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const LogoIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="6"
    className={`${className} text-primary`}
  >
    <path
      d="M50 12 C30 15 22 25 22 48 C22 72 50 88 50 88 C50 88 78 72 78 48 C78 25 70 15 50 12 Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M38 34 L45 46 M52 34 L45 46 M45 46 V64" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M56 36 H66 M56 46 H64 M56 36 V64" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Header() {
  const categories = getAllCategories();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}

          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.svg" alt="Yorkville Furniture Logo" className="h-8 w-8 object-contain" />

          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              if (link.label === "Categories") {
                return <HeaderCategoriesDropdown key={link.href} categories={categories} />;
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Province + Cart + Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* Province Selector */}
            <ProvinceSelector />

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2"
              aria-label="Shopping cart"
            >
              <CartIcon />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-foreground hover:text-primary cursor-pointer"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={navLinks}
        categories={categories}
      />
    </header>
  );
}
