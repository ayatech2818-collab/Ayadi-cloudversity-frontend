"use client";

import axios from "axios";
import { FormEvent, useState } from "react";
import { Mail, Phone, Send, Loader2 } from "lucide-react";

import { createEnquiry } from "@/lib/api/enquiry";

interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zipcode: string;
  message: string;
}

const initialForm: ContactFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  zipcode: "",
  message: "",
};

export default function ContactForm({
  className = "",
}: {
  /** Layout classes for the card — the page decides how it sits in the grid. */
  className?: string;
}) {
  const [form, setForm] = useState<ContactFormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!form.first_name.trim()) {
      setError("Please enter your first name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await createEnquiry({
        type: "contact",

        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || null,

        email: form.email.trim(),
        phone: form.phone.trim() || null,

        address: form.address.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        zipcode: form.zipcode.trim() || null,

        message: form.message.trim() || null,
      });

      setSuccess(
        "Thank you for contacting us. We will get back to you soon."
      );

      setForm(initialForm);
    } catch (err: unknown) {
      console.error("Contact enquiry failed:", err);

      // A validation failure sends `detail` as a list of objects, which
      // cannot be rendered — only a plain message is shown as-is.
      const detail = axios.isAxiosError(err)
        ? err.response?.data?.detail
        : null;

      setError(
        typeof detail === "string" && detail
          ? detail
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 ${className}`}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Send Us an Enquiry
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Have a question or need more information? Fill out the
          form and our team will get back to you.
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary ring-1 ring-inset ring-primary/20">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="first_name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              First Name <span className="text-red-500">*</span>
            </label>

            <input
              id="first_name"
              name="first_name"
              type="text"
              value={form.first_name}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>

            <input
              id="last_name"
              name="last_name"
              type="text"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Enter your last name"
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Email / Phone */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                maxLength={255}
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone
            </label>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                maxLength={30}
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Address
          </label>

          <input
            id="address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter your address"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Location */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              City
            </label>

            <input
              id="city"
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Country
            </label>

            <input
              id="country"
              name="country"
              type="text"
              value={form.country}
              onChange={handleChange}
              placeholder="Country"
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label
              htmlFor="zipcode"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              ZIP / Postal Code
            </label>

            <input
              id="zipcode"
              name="zipcode"
              type="text"
              value={form.zipcode}
              onChange={handleChange}
              placeholder="Postal code"
              maxLength={20}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Message
          </label>

          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us how we can help..."
            rows={5}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-accent/25 transition-[translate,box-shadow] duration-200 enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Enquiry
            </>
          )}
        </button>
      </form>
    </div>
  );
}