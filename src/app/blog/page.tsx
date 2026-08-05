import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/formatters";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "Blog",
  description: "Read helpful design tips, material buying guides, and maintenance tutorials.",
};

export default function BlogListingPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Blog" }]} />

      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
          Craft & Inspiration Blog
        </h1>
        <p className="text-muted mt-2">
          Helpful suggestions for designing spaces, selecting dimensions, and looking after solid wood.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="group flex flex-col bg-white border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <Link href={`/blog/${post.slug}`} className="relative aspect-[16/9] bg-muted-light block overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-accent/15" />
            </Link>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-muted mb-3 font-semibold">
                  <span>By {post.author}</span>
                  <span>&bull;</span>
                  <span>{formatDate(post.date)}</span>
                </div>
                <h2 className="text-xl font-bold font-serif text-foreground group-hover:text-primary transition-colors mb-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-sm text-muted line-clamp-3 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex justify-between items-center mt-auto border-t border-border pt-4">
                <div className="flex gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] uppercase font-bold tracking-wider text-accent-dark bg-accent/5 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold text-primary group-hover:text-primary-dark transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  Read &rarr;
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
