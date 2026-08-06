"use client";

import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import siteConfig from "@/data/site-config.json";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function CustomBuildPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    province: "ON",
    furnitureType: "dining-table",
    dimensions: "",
    material: "oak",
    colour: "",
    budget: "$1000 - $2000",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const summaryMsg =
        `*New Custom Build Request*\n\n` +
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone}\n` +
        `Deliver to: ${formData.province}\n\n` +
        `Type: ${formData.furnitureType}\n` +
        `Material: ${formData.material}\n` +
        `Colour: ${formData.colour || "Any"}\n` +
        `Dimensions: ${formData.dimensions || "Not specified"}\n` +
        `Budget Range: ${formData.budget}\n` +
        `Details: ${formData.description}`;

      // EmailJS send details
      if (
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
        process.env.NEXT_PUBLIC_EMAILJS_OWNER_TEMPLATE_ID &&
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      ) {
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_OWNER_TEMPLATE_ID!,
          {
            order_id: "CUSTOM-BUILD",
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            customer_address: `Delivery Province: ${formData.province}`,
            items_list: `CUSTOM FURNITURE REQUEST:\n- Type: ${formData.furnitureType}\n- Material: ${formData.material}\n- Dimensions: ${formData.dimensions}\n- Budget: ${formData.budget}`,
            notes: formData.description,
            subtotal: "$0.00",
            tax: "$0.00",
            total: "$0.00 (Inquiry)",
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        );
      } else {
        console.log("EmailJS Custom Inquiry (Simulated):", formData);
      }

      setSuccess(true);
      setIsSubmitting(false);

      // Open WhatsApp chat
      const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(summaryMsg)}`;
      window.open(whatsappUrl, "_blank");
    } catch (err) {
      console.error("Custom request send failed", err);
      setErrorMsg("An error occurred. Please try again or message us on WhatsApp directly.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ label: "Custom Build" }]} />

      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
          Custom Furniture Request / Inquiry
        </h1>
        <p className="text-muted mt-2">
          Can't find the exact size or specifications you need? Send us your requirements and we will search our warehouses to fetch a custom quote for you.
        </p>
      </div>

      {success ? (
        <div className="bg-success/5 border border-success/20 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 text-success mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-serif text-foreground">Request Received!</h2>
          <p className="text-sm text-muted">
            We will get back to you by email shortly. If WhatsApp hasn't opened, feel free to use the button below to text us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4">
            <Button href="/products" variant="outline">Browse products</Button>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi! I submitted a custom request.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-success hover:bg-success/90 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Open WhatsApp Chat
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="bg-white border border-border rounded-xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold font-serif text-foreground border-b border-border pb-3">
            Design Requirements
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                First & Last Name <span className="text-error">*</span>
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Email Address <span className="text-error">*</span>
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Phone Number <span className="text-error">*</span>
              </label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. 416-555-0199"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Delivery Province <span className="text-error">*</span>
              </label>
              <select
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white bg-[image:var(--tw-select-image)]"
              >
                <option value="ON">Ontario (ON)</option>
                <option value="QC">Quebec (QC)</option>
                <option value="BC">British Columbia (BC)</option>
                <option value="AB">Alberta (AB)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Furniture Type <span className="text-error">*</span>
              </label>
              <select
                name="furnitureType"
                value={formData.furnitureType}
                onChange={handleInputChange}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white bg-[image:var(--tw-select-image)]"
              >
                <option value="dining-table">Dining Table</option>
                <option value="dining-chair">Dining Chair</option>
                <option value="sofa">Sofa & Sofa beds</option>
                <option value="coffee-table">Coffee Table</option>
                <option value="bed">Bed & Bed Frame</option>
                <option value="door-frame">Door / Door Frame</option>
                <option value="custom-office">Office Furniture</option>
                <option value="other">Other custom piece</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Approximate Budget (CAD)
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white bg-[image:var(--tw-select-image)]"
              >
                <option value="Under $1,000">Under $1,000</option>
                <option value="$1,000 - $2,000">$1,000 - $2,000</option>
                <option value="$2,000 - $4,000">$2,000 - $4,000</option>
                <option value="$4,000+">$4,000+</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Wood & Material Preferences
              </label>
              <select
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white bg-[image:var(--tw-select-image)]"
              >
                <option value="oak">Solid Oak Wood</option>
                <option value="walnut">Solid Walnut Wood</option>
                <option value="pine">Rustic Pine Wood</option>
                <option value="other-wood">Other / I am not sure</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-foreground">
                Size & Color Specifications
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleInputChange}
                placeholder="e.g., 200cm length x 95cm width x 78cm height"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-foreground">
              Describe Your Requirements <span className="text-error">*</span>
            </label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide as much detail as possible about your layout, features list, drawers details, special legs patterns..."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-36"
            />
          </div>

          {errorMsg && (
            <p className="text-sm font-semibold text-error text-center">{errorMsg}</p>
          )}

          <div className="flex justify-end border-t border-border pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Sending Request..." : "Submit Inquiry & Open WhatsApp"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
