import Breadcrumbs from "@/components/ui/Breadcrumbs";
import siteConfig from "@/data/site-config.json";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "About Us",
  description: "Learn about Yorkville Furniture Canada, our direct-to-warehouse value, and warranty model.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumbs items={[{ label: "About" }]} />

      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
          Our Brand & Values
        </h1>
        <p className="text-muted mt-2">
          Direct-to-warehouse premium furniture with comprehensive warranty protection.
        </p>
      </div>

      <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl flex items-center justify-center border border-border/40 select-none space-x-6 sm:space-x-12">
        <span className="text-6xl sm:text-7xl">🛋️</span>
        <span className="text-6xl sm:text-7xl">📦</span>
        <span className="text-6xl sm:text-7xl">🏢</span>
      </div>

      <div className="space-y-6 text-foreground/80 leading-relaxed font-sans text-sm sm:text-base">
        <p>
          Founded on a mission to eliminate distributor markups and deliver maximum value,{" "}
          <strong className="text-foreground">{siteConfig.storeName}</strong> specializes in premium, warehouse-direct home furniture with built-in warranty satisfaction for kitchens, bedrooms, and offices.
        </p>
        <p>
          Each piece is directly sourced from premier manufacturers, ensuring direct-to-warehouse savings. We back every item in our inventory with a comprehensive warranty program, ensuring you get premium build quality and complete peace of mind without retail inflated markups.
        </p>

        <h3 className="text-xl font-bold font-serif text-foreground pt-4">
          Local Delivery & Cash on Delivery (COD)
        </h3>
        <p>
          We believe building furniture is a personal relationship. To make it completely stress-free, we deliver using our own local vans across Ontario, Quebec, British Columbia, and Alberta. You review the build at your door when it arrives, and only pay (via cash, credit, or debit) once you are 100% satisfied.
        </p>
      </div>

      <div className="border-t border-border pt-8 text-center">
        <h3 className="font-bold text-lg text-foreground mb-4">Want something custom built?</h3>
        <Button href="/custom-build">Design Request Form &rarr;</Button>
      </div>
    </div>
  );
}
