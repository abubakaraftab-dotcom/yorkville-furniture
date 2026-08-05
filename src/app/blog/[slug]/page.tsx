import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/formatters";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      <header className="mb-8 border-b border-border pb-6">
        <div className="flex gap-2 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase font-bold tracking-wider text-accent-dark bg-accent/5 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-foreground mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted font-medium">
          <span>By {post.author}</span>
          <span>&middot;</span>
          <span>{formatDate(post.date)}</span>
        </div>
      </header>

      {/* Blog Article Banner */}
      <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl mb-10 flex items-center justify-center border border-border/40 select-none">
        <span className="text-6xl text-primary/30">📖</span>
      </div>

      <div className="prose prose-primary max-w-none space-y-6 text-foreground/80 leading-relaxed font-sans">
        {post.content.split("\n\n").map((para, i) => {
          if (para.startsWith("###")) {
            return (
              <h3 key={i} className="text-xl font-bold font-serif text-foreground pt-4 mb-2">
                {para.replace("###", "").trim()}
              </h3>
            );
          }
          if (para.startsWith("-")) {
            return (
              <ul key={i} className="list-disc pl-5 space-y-1.5 text-sm text-foreground/80">
                {para.split("\n").map((li, idx) => (
                  <li key={idx}>
                    {li.replace("-", "").trim()}
                  </li>
                ))}
              </ul>
            );
          }
          return <p key={i}>{para}</p>;
        })}
      </div>

      <footer className="mt-12 pt-6 border-t border-border flex justify-between">
        <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
          &larr; Back to Blog Feed
        </Link>
      </footer>
    </article>
  );
}
