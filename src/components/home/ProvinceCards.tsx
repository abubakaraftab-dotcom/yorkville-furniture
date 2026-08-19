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
            Find furniture available in your area
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {provinces.map((province) => (
            <Link
              key={province.code}
              href={`/provinces/${province.slug}`}
              className="group relative rounded-xl overflow-hidden min-h-[250px] flex flex-col justify-end hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={`/images/provinces/${province.code.toLowerCase()}.jpg`}
                  alt={province.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              </div>

              <div className="relative p-6 z-10">
                <h3 className="text-xl font-bold text-white mb-1">
                  {province.name}
                </h3>
                <p className="text-sm text-white/80">{province.deliveryNote}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-white/60">
                  <span>{province.cities.length} cities</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
