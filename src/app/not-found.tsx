import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
      <span className="text-6xl select-none">🗺️</span>
      <h1 className="text-4xl font-bold font-serif text-foreground">Page Not Found</h1>
      <p className="text-muted max-w-md mx-auto">
        The page you are looking for does not exist or has been moved. Check the URL or return homepage to browse products.
      </p>
      <div className="pt-4">
        <Button href="/">Return Home</Button>
      </div>
    </div>
  );
}
