"use client";

import { useState } from "react";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import HeaderCategoriesDropdown from "./HeaderCategoriesDropdown";
import HeaderProvincesDropdown from "./HeaderProvincesDropdown";
import { getAllCategories } from "@/lib/categories";
import { getAllProvinces } from "@/lib/provinces";
import ProvinceSelector from "./ProvinceSelector";
import CartIcon from "@/components/cart/CartIcon";
import SearchBar from "@/components/search/SearchBar";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/products", label: "Products" },
  { href: "/provinces", label: "Shop by Province" },
  { href: "/custom-build", label: "Custom Build" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const categories = getAllCategories();
  const provinces = getAllProvinces();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e1da] bg-[#faf9f7]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[5.25rem] items-center justify-between gap-3">
          {/* Logo */}

          <Link href="/" className="flex items-center gap-2">
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/logo-clean-transparent.png`} alt="Yorkville Furniture Logo" className="h-14 w-auto shrink-0 object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 xl:gap-5 lg:flex">
            {navLinks.map((link) => {
              if (link.label === "Categories") {
                return <HeaderCategoriesDropdown key={link.href} categories={categories} />;
              }
              if (link.label === "Shop by Province") {
                return <HeaderProvincesDropdown key={link.href} provinces={provinces} />;
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap text-[12px] font-semibold capitalize text-foreground/80 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Search + Province + Cart + Mobile Toggle */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Site-wide search */}
            <div className="hidden lg:block w-48">
              <SearchBar />
            </div>
            <button
              type="button"
              className="md:hidden p-2 text-foreground/80 hover:text-primary transition-colors"
              aria-label="Search products"
              onClick={() => {
                const q = window.prompt("Search products:");
                if (q && q.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
                }
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </button>
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
        provinces={provinces}
      />
    </header>
  );
}
