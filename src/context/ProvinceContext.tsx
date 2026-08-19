"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Province } from "@/types/province";
import provincesData from "@/data/provinces.json";

interface ProvinceContextType {
  selectedProvince: Province | null;
  selectedCity: string;
  changeProvince: (code: string) => void;
  selectCity: (cityName: string) => void;
  clearCity: () => void;
  resetToHome: () => void;
  availableProvinces: Province[];
  isLoading: boolean;
}

const ProvinceContext = createContext<ProvinceContextType | undefined>(undefined);

export function ProvinceProvider({ children }: { children: React.ReactNode }) {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const availableProvinces = provincesData.provinces as Province[];

  useEffect(() => {
    // Read from localStorage on mount
    const saved = localStorage.getItem("yorkville-furniture-province");
    const savedCity = localStorage.getItem("yorkville-furniture-city") || "";
    if (saved) {
      const province = availableProvinces.find((p) => p.code === saved);
      if (province) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedProvince(province);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedCity(savedCity);
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
      setSelectedCity("");
      localStorage.setItem("yorkville-furniture-province", code);
      localStorage.removeItem("yorkville-furniture-city");
    }
  };

  const selectCity = (cityName: string) => {
    setSelectedCity(cityName);
    localStorage.setItem("yorkville-furniture-city", cityName);
  };

  const clearCity = () => {
    setSelectedCity("");
    localStorage.removeItem("yorkville-furniture-city");
  };

  // Mandatory spec rule: clicking the logo returns to the homepage and
  // resets the regional context to Ontario, clearing any selected city.
  const resetToHome = () => {
    const on = availableProvinces.find((p) => p.code === "ON") ?? availableProvinces[0];
    setSelectedProvince(on);
    setSelectedCity("");
    localStorage.setItem("yorkville-furniture-province", on?.code ?? "ON");
    localStorage.removeItem("yorkville-furniture-city");
  };

  return (
    <ProvinceContext.Provider
      value={{
        selectedProvince,
        selectedCity,
        changeProvince,
        selectCity,
        clearCity,
        resetToHome,
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
