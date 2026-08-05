import Breadcrumbs from "@/components/ui/Breadcrumbs";
import siteConfig from "@/data/site-config.json";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "About Us",
  description: "Learn about Maple Furniture Co., our heritage, and solid wood craftsmanship.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumbs items={[{ label: "About" }]} />

      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
          Our Brand & Heritage
        </h1>
        <p className="text-muted mt-2">
          Handcrafting solid wood heirloom furniture built to stand the test of time.
        </p>
      </div>

      <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl flex items-center justify-center border border-border/40 select-none">
        <span className="text-7xl">🪚</span>
      </div>

      <div className="space-y-6 text-foreground/80 leading-relaxed font-sans text-sm sm:text-base">
        <p>
          Founded on a deep respect for natural lumber and traditional woodworking joinery techniques,{" "}
          <strong className="text-foreground">{siteConfig.storeName}</strong> specializes in creating simple, gorgeous solid wood pieces for kitchens, bedrooms, and offices.
        </p>
        <p>
          Each table, bed, and shelf is constructed by our master craftsmen from premium hardwoods like White Oak and Walnut sourced locally in North America. We use toxic-free oils and natural raw beeswax to polish our pieces, bringing out the organic timber grain instead of masking it with thick lacquer.
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
