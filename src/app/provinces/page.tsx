import Link from "next/link";
import { getAllProvinces } from "@/lib/provinces";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "Shop by Province",
  description: "Browse furniture collections available in Ontario, Quebec, British Columbia, and Alberta.",
};

export default function ProvincesPage() {
  const provinces = getAllProvinces();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Provinces" }]} />

      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
          Furniture Delivery across Canada
        </h1>
        <p className="text-muted mt-3">
          We deliver premium furniture directly to your home. Explore availability for your province.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {provinces.map((province) => (
          <Link
            key={province.code}
            href={`/provinces/${province.slug}`}
            className="group bg-white rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="text-4xl mb-4">
                {province.code === "ON" && "🏙️"}
                {province.code === "QC" && "⚜️"}
                {province.code === "BC" && "🌲"}
                {province.code === "AB" && "🏔️"}
              </div>
              <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {province.name}
              </h2>
              <p className="text-sm text-muted mt-2">{province.deliveryNote}</p>
            </div>

            <div className="border-t border-border mt-6 pt-4 text-xs text-muted space-y-1">
              <div className="flex justify-between">
                <span>Cities Serviced:</span>
                <span className="font-semibold text-foreground">{province.cities.length}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
