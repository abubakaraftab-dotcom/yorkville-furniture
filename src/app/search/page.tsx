import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SearchResultsClient from "@/components/search/SearchResultsClient";

export const metadata: Metadata = {
  title: "Search Products — Yorkville Furniture Canada",
  description: "Search the full Yorkville Furniture catalogue.",
};

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; province?: string }> }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted mb-4">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-muted">/</span>
            <span className="text-foreground font-medium">Search</span>
          </li>
        </ol>
      </nav>
      <Suspense fallback={<div className="text-sm text-muted">Loading search…</div>}>
        <SearchResultsClient />
      </Suspense>
    </div>
  );
}
