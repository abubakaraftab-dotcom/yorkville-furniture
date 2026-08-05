import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";
import { getAllCategories } from "@/lib/categories";
import { getAllProvinces } from "@/lib/provinces";
import { getAllPosts } from "@/lib/blog";
import siteConfig from "@/data/site-config.json";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.seo.siteUrl;

  // 1. Static Pages
  const staticPaths = ["", "/about", "/contact", "/products", "/categories", "/provinces", "/custom-build", "/blog", "/terms", "/privacy-policy"];
  const staticSitemap = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1.0 : 0.8,
  }));

  // 2. Classifications - Categories
  const categories = getAllCategories();
  const categorySitemap = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 3. Products detail
  const products = getAllProducts();
  const productSitemap = products.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // 4. Provinces details
  const provinces = getAllProvinces();
  const provinceSitemap = provinces.map((p) => ({
    url: `${baseUrl}/provinces/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // 5. Cities detailed delivery landing
  const citySitemap: MetadataRoute.Sitemap = [];
  provinces.forEach((p) => {
    p.cities.forEach((c) => {
      citySitemap.push({
        url: `${baseUrl}/provinces/${p.slug}/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      });
    });
  });

  // 6. Blogs details
  const blogs = getAllPosts();
  const blogSitemap = blogs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticSitemap, ...categorySitemap, ...productSitemap, ...provinceSitemap, ...citySitemap, ...blogSitemap];
}
