import Badge from "@/components/ui/Badge";

interface ProvinceAvailabilityProps {
  availability: string[];
}

const provinceNames: Record<string, string> = {
  ON: "Ontario",
  QC: "Quebec",
  BC: "British Columbia",
  AB: "Alberta",
};

export default function ProvinceAvailability({ availability }: ProvinceAvailabilityProps) {
  return (
    <div className="border border-border rounded-xl p-4 bg-muted-light/50">
      <h3 className="text-sm font-semibold text-foreground mb-2">Delivery Availability</h3>
      <div className="flex flex-wrap gap-2">
        {["ON", "QC", "BC", "AB"].map((code) => {
          const isAvail = availability.includes(code);
          return (
            <div
              key={code}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                isAvail
                  ? "bg-success/5 border-success/20 text-success"
                  : "bg-muted-light border-border text-muted opacity-50"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isAvail ? "bg-success" : "bg-muted"}`} />
              <span>
                {provinceNames[code]} ({code})
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted mt-3">
        * Orders are shipped locally. Ensure the product is available in your selected province in the header.
      </p>
    </div>
  );
}
