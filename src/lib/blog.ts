import type { BlogPost } from "@/types/blog";
import blogPostsData from "@/data/blog-posts.json";

const posts: BlogPost[] = blogPostsData.posts as BlogPost[];

export function getAllPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostsByTag(tag: string): BlogPost[] {
  return posts.filter((p) => p.tags.includes(tag));
}
