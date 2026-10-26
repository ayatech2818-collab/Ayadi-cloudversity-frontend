import GetStartedCta from "@/components/website/sections/GetStartedCta";

export type LegalSection = {
  title: string;
  body?: string;
  items?: string[];
};

type LegalPageProps = {
  /** The heading's plain words, before the gradient ones. */
  title: string;
  /** The heading's last words, set in the brand gradient. */
  highlight: string;
  intro: string;
  sections: LegalSection[];
};

/** The shared layout of the legal pages (Terms & Conditions, Privacy Policy). */
export default function LegalPage({ title, highlight, intro, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white mt-10 sm:mt-0">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary sm:px-4 sm:py-2 sm:text-sm">
              Legal
            </span>

            <h1 className="mt-4 text-[1.85rem] font-bold leading-tight tracking-tight text-gray-900 sm:mt-5 sm:text-5xl lg:text-6xl">
              {title}{" "}
              <span className="bg-brand-gradient bg-clip-text text-transparent">{highlight}</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600 sm:mt-6 sm:text-lg sm:leading-8">
              {intro}
            </p>
          </div>
        </div>
      </section>

      {/* Sections — two cards a row from md up; with an odd count the last
          card spans both columns rather than sitting alone in the left one.

          The bottom padding is the call-to-action card's room, as on the
          contact page: the card pulls itself up over the end of this section
          (see GetStartedCta.tsx). */}
      <section className="pb-48 pt-10 sm:pt-20 md:pb-82 lg:pb-76">
        <ol className="mx-auto grid max-w-7xl gap-4 px-4 sm:gap-6 sm:px-8 md:grid-cols-2 lg:px-12">
          {sections.map((section, index) => (
            <li
              key={section.title}
              className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:gap-6 sm:p-8 md:last:odd:col-span-2"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white sm:size-11 sm:text-base">
                {index + 1}
              </span>

              <div>
                <h2 className="text-base font-semibold text-gray-900 sm:text-xl">
                  {section.title}
                </h2>

                {section.body && (
                  <p className="mt-2 text-sm leading-6 text-gray-600 sm:mt-3 sm:text-base sm:leading-7">
                    {section.body}
                  </p>
                )}

                {section.items && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-600 marker:text-primary sm:mt-3 sm:text-base sm:leading-7">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Overlaps the footer below it — see the note in GetStartedCta.tsx */}
      <GetStartedCta />
    </main>
  );
}
