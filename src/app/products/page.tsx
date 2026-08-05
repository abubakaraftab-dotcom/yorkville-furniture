import { getAllProducts } from "@/lib/products";
import { getAllCategories } from "@/lib/categories";
import ProductsClient from "@/components/product/ProductsClient";

export const metadata = {
  title: "All Products",
  description: "Browse our complete collection of handcrafted furniture available for delivery across Canada.",
};

export default function ProductsPage() {
  const products = getAllProducts();
  const categories = getAllCategories();

  return <ProductsClient products={products} categories={categories} />;
}
