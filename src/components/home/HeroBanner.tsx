import Button from "@/components/ui/Button";
import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden group">
      {/* Background image with hover zoom effect */}
      <div className="absolute inset-0 bg-neutral-900">
        <Image
          src="/images/hero-banner.jpg"
          alt="Hero Banner"
          fill
          priority
          unoptimized
          className="object-cover object-center lg:object-[center_30%] transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40 lg:bg-gradient-to-r lg:from-black/60 lg:via-black/30 lg:to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10 min-h-[90vh] lg:min-h-0 flex flex-col lg:block justify-between">
        <div className="max-w-2xl relative z-10 h-full flex flex-col justify-between lg:block">

          {/* Top heading */}
          <div className="mt-8 lg:mt-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-md">
              Premium Quality Furniture for{" "}<br className="hidden lg:inline"/>
              <span className="text-accent">Canadian Homes</span>
            </h1>
          </div>

          {/* Mobile spacing block */}
          <div className="flex-grow min-h-[40vh] lg:hidden"></div>

          <div className="mt-6 max-w-2xl mb-8 lg:mb-0">
            <p className="text-lg text-white font-medium drop-shadow-md">
              Quality furniture delivered to your door. Cash on delivery available
              across Ontario, Quebec, British Columbia, and Alberta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button href="/products" variant="secondary" size="lg">
                Shop Now
              </Button>
              <Button href="/custom-build" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Custom Sizes
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-white font-medium drop-shadow-md">
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
