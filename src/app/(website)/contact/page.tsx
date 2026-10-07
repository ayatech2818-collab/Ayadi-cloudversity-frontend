import ContactForm from "@/components/admin/contact/ContactForm";
import ContactLocation from "@/components/admin/contact/ContactLocation";
import GetStartedCta from "@/components/website/sections/GetStartedCta";

export const metadata = {
  title: "Contact Us | Ayadi Cloudversity",
  description:
    "Get in touch with Ayadi Cloudversity. Send us your enquiry or visit our location.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Get In Touch
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              We&apos;d Love to{" "}
              <span className="bg-brand-gradient bg-clip-text text-transparent">Hear From You</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Have a question about our courses, programs, or services?
              Send us an enquiry and our team will get back to you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact — two columns from lg up: the enquiry form on the left, the
          locations and their maps on the right.

          The right column is the taller one, so the form is pinned beside it
          while the maps scroll past. top-28 clears the fixed navbar, and
          self-start stops the card stretching to the height of the maps.

          The height cap only bites on a short screen, where the form scrolls
          inside its card rather than leaving Send below the fold until the
          maps have gone by.

          The bottom padding is the call-to-action card's room: that card pulls
          itself up over the end of this section (-mt-44, md:-mt-65, lg:-mt-55
          in GetStartedCta.tsx), so the padding is that overlap plus a gap, and
          the card never lands on the form or the maps. */}
      <section className="pb-60 pt-16 sm:pt-20 md:pb-82 lg:pb-76">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
          <ContactForm className="lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto" />

          <ContactLocation />
        </div>
      </section>

      {/* Overlaps the footer below it — see the note in GetStartedCta.tsx */}
      <GetStartedCta />
    </main>
  );
}