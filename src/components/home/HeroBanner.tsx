import Button from "@/components/ui/Button";
import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden group">
      {/* Background image with hover zoom effect */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/hero-banner.jpg"
          alt="Hero Banner"
          fill
          priority
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
        <div className="max-w-2xl lg:max-w-xl xl:max-w-lg relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
            Premium Quality Furniture for{" "}<br className="hidden lg:inline"/>
            <span className="text-accent">Canadian Homes</span>
          </h1>

          <div className="mt-6">
            <p className="text-lg text-white font-medium [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
              Quality furniture delivered to your door. Cash on delivery available
              across Ontario, Quebec, British Columbia, and Alberta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button href="/products" variant="secondary" size="lg">
                Shop Now
              </Button>
              <Button href="/custom-build" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Custom Sizes
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-white font-medium [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
              <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              Direct Factory Prices
            </span>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              Cash on Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              Quality Guaranteed
            </span>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              No Taxes
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
