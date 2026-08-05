"use client";

import { useProvince } from "@/context/ProvinceContext";

export default function ProvinceSelector() {
  const { selectedProvince, changeProvince, availableProvinces } = useProvince();

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-muted hidden md:inline">Deliver to:</span>
      <select
        value={selectedProvince?.code || ""}
        onChange={(e) => changeProvince(e.target.value)}
        className="bg-transparent text-primary hover:text-primary-dark font-semibold border-none focus:ring-0 cursor-pointer p-0 pr-6 text-sm"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B4332' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0 center',
          backgroundSize: '1.25rem 1.25rem',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {availableProvinces.map((prov) => (
          <option key={prov.code} value={prov.code} className="text-foreground bg-white text-base">
            {prov.name} ({prov.code})
          </option>
        ))}
      </select>
    </div>
  );
}
