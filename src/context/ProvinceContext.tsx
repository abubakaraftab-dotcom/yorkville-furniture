"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Province } from "@/types/province";
import provincesData from "@/data/provinces.json";

interface ProvinceContextType {
  selectedProvince: Province | null;
  changeProvince: (code: string) => void;
  availableProvinces: Province[];
  isLoading: boolean;
}

const ProvinceContext = createContext<ProvinceContextType | undefined>(undefined);

export function ProvinceProvider({ children }: { children: React.ReactNode }) {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const availableProvinces = provincesData.provinces as Province[];

  useEffect(() => {
    // Read from localStorage on mount
    const saved = localStorage.getItem("yorkville-furniture-province");
    if (saved) {
      const province = availableProvinces.find((p) => p.code === saved);
      if (province) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedProvince(province);
      } else {
        // Default to Ontario
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedProvince(availableProvinces[0]);
      }
    } else {
      // Default to Ontario
      setSelectedProvince(availableProvinces[0]);
    }
    setIsLoading(false);
  }, [availableProvinces]);

  const changeProvince = (code: string) => {
    const province = availableProvinces.find((p) => p.code === code);
    if (province) {
      setSelectedProvince(province);
      localStorage.setItem("yorkville-furniture-province", code);
    }
  };

  return (
    <ProvinceContext.Provider
      value={{
        selectedProvince,
        changeProvince,
        availableProvinces,
        isLoading,
      }}
    >
      {children}
    </ProvinceContext.Provider>
  );
}

export function useProvince() {
  const context = useContext(ProvinceContext);
  if (context === undefined) {
    throw new Error("useProvince must be used within a ProvinceProvider");
  }
  return context;
}
