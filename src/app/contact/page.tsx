"use client";

import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import siteConfig from "@/data/site-config.json";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      if (
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
        process.env.NEXT_PUBLIC_EMAILJS_OWNER_TEMPLATE_ID &&
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      ) {
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_OWNER_TEMPLATE_ID!,
          {
            order_id: "GENERAL-CONTACT",
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: "Not specified",
            customer_address: "Contact Form",
            items_list: `Subject: ${formData.subject}`,
            notes: formData.message,
            subtotal: "$0.00",
            tax: "$0.00",
            total: "$0.00 (Inquiry)",
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        );
      } else {
        console.log("EmailJS Contact Submission (Simulated):", formData);
      }

      setSuccess(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error("General contact message failed", err);
      setErrorMsg("An error occurred. Please try again or message us on WhatsApp.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Contact" }]} />

      <h1 className="text-3xl font-bold font-serif text-foreground mb-8">
        Get in Touch
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          {success ? (
            <div className="bg-success/5 border border-success/20 rounded-2xl p-8 text-center space-y-4">
              <span className="text-4xl">✉️</span>
              <h2 className="text-2xl font-bold font-serif text-foreground">Message Sent!</h2>
              <p className="text-muted">
                Thank you for contacting us. Our team will review your message and get back to you shortly.
              </p>
              <Button href="/products">Continue Shopping</Button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="bg-white border border-border rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-foreground">Name</label>
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
                  <label className="block text-sm font-semibold mb-1 text-foreground">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-foreground">Subject</label>
                <input
                  required
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-foreground">Message</label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="How can we help you?"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-36"
                />
              </div>

              {errorMsg && (
                <p className="text-sm font-semibold text-error text-center">{errorMsg}</p>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>

        {/* Store Information Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-6 rounded-xl space-y-6">
            <div>
              <h3 className="font-bold text-lg text-foreground mb-3">Our Office</h3>
              <p className="text-sm text-muted leading-relaxed">
                {siteConfig.address.street}<br />
                {siteConfig.address.city}, {siteConfig.address.province} <br />
                {siteConfig.address.postalCode}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-foreground mb-3">Contact Direct</h3>
              <div className="text-sm text-muted space-y-2">
                <p>Phone: <span className="font-semibold text-foreground">{siteConfig.phone}</span></p>
                <p>Email: <span className="font-semibold text-foreground">{siteConfig.email}</span></p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi! I have a question.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full bg-success hover:bg-success/90 text-white font-semibold px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer"
              >
                💬 Chat Instant on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
