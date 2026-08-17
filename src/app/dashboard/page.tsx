import ProductDashboardClient from "@/components/admin/ProductDashboardClient";

export const metadata = {
  title: "Product Dashboard | Yorkville Furniture Canada",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <ProductDashboardClient />;
}
