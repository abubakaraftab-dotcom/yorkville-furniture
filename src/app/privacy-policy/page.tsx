import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-sm text-foreground/80 leading-relaxed">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

      <h1 className="text-3xl font-bold font-serif text-foreground mb-4">Privacy Policy</h1>
      <p className="text-xs text-muted">Last Updated: August 4, 2026</p>

      <p>
        This privacy policy details how we handle customer details when placing orders on our website.
      </p>

      <h2 className="text-lg font-bold text-foreground font-serif pt-4">1. Information We Collect</h2>
      <p>
        When you submit an order, custom request, or contact form, we collect your name, email address, shipping delivery address, phone number, and transaction details.
      </p>

      <h2 className="text-lg font-bold text-foreground font-serif pt-2">2. How We Collect It</h2>
      <p>
        We use EmailJS to route order receipts from the client browser directly to our secure shop email. No online payment gateways or active database nodes process or persist data outside our local network.
      </p>
    </div>
  );
}
