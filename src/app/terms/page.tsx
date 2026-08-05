import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-sm text-foreground/80 leading-relaxed">
      <Breadcrumbs items={[{ label: "Terms & Conditions" }]} />

      <h1 className="text-3xl font-bold font-serif text-foreground mb-4">Terms & Conditions</h1>
      <p className="text-xs text-muted">Last Updated: August 4, 2026</p>

      <h2 className="text-lg font-bold text-foreground font-serif pt-4">1. Cash on Delivery Policy</h2>
      <p>
        Orders are delivered locally. Payment is due in full at the time of delivery. We accept cash, debit card, and Visa/Mastercard credit card readers at your doorstep. We reserve the right to verify customer details by phone prior to dispatching large orders.
      </p>

      <h2 className="text-lg font-bold text-foreground font-serif pt-4">2. Shipping and Assembly</h2>
      <p>
        Standard delivery takes between 5 to 14 business days depending on province availability. Free delivery applies to orders starting at $500 or as highlighted locally. If manual assembly is required, you can request assembly from our delivery crew for a small local fee.
      </p>
    </div>
  );
}
