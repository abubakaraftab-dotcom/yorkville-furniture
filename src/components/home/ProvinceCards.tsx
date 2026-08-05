import Link from "next/link";
import { getAllProvinces } from "@/lib/provinces";

export default function ProvinceCards() {
  const provinces = getAllProvinces();

  return (
    <section className="py-16 bg-muted-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">Shop by Province</h2>
          <p className="text-muted mt-2">
            Find furniture available for delivery in your area
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {provinces.map((province) => (
            <Link
              key={province.code}
              href={`/provinces/${province.slug}`}
              className="group bg-white rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className="text-3xl mb-3">
                {province.code === "ON" && "🏙️"}
                {province.code === "QC" && "⚜️"}
                {province.code === "BC" && "🌲"}
                {province.code === "AB" && "🏔️"}
              </div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {province.name}
              </h3>
              <p className="text-sm text-muted mt-1">{province.deliveryNote}</p>
              <div className="flex items-center gap-1 mt-3 text-sm text-muted">
                <span>{province.cities.length} cities</span>
                <span className="mx-1">&middot;</span>
                <span>{province.taxLabel}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
