"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import Field from "@/components/admin/ui/Field";
import { inputClass } from "@/components/admin/ui/styles";
import TagInput from "@/components/admin/ui/TagInput";

import type { BlogFieldsProps } from "./blog-form";

interface BlogSeoFieldsProps
  extends Omit<BlogFieldsProps, "errors"> {
  /** Open from the start when the post already has SEO details. */
  defaultOpen: boolean;
}

/** Optional search-engine details, folded away until they are wanted. */
export default function BlogSeoFields({
  values,
  disabled,
  defaultOpen,
  onChange,
}: BlogSeoFieldsProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl bg-surface ring-1 ring-inset ring-border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="blog-seo-fields"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl p-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:px-5"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md shadow-brand-start/25">
            <Search size={15} />
          </span>

          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-accent">
              Search engines (SEO)
            </span>

            <span className="mt-0.5 block text-[11px] text-muted">
              Optional — the title, description and keywords
              search results show
            </span>
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id="blog-seo-fields"
          className="space-y-4 border-t border-border p-4 sm:p-5"
        >
          <Field
            label="SEO title"
            htmlFor="blog-seo-title"
            aside={`${values.seoTitle.length}/60 recommended`}
          >
            <input
              id="blog-seo-title"
              type="text"
              maxLength={255}
              value={values.seoTitle}
              onChange={(event) =>
                onChange("seoTitle", event.target.value)
              }
              placeholder={
                values.title ||
                "Custom page title for search engines..."
              }
              disabled={disabled}
              className={`${inputClass()} h-11`}
            />
          </Field>

          <Field
            label="Meta description"
            htmlFor="blog-seo-description"
            aside={`${values.seoDescription.length}/160 recommended`}
          >
            <textarea
              id="blog-seo-description"
              rows={2}
              value={values.seoDescription}
              onChange={(event) =>
                onChange("seoDescription", event.target.value)
              }
              placeholder={
                values.excerpt || "Search engine summary..."
              }
              disabled={disabled}
              className={`${inputClass()} py-3 leading-relaxed`}
            />
          </Field>

          <Field
            label="Meta keywords"
            htmlFor="blog-seo-keywords"
            aside="Enter or comma to add"
          >
            <TagInput
              id="blog-seo-keywords"
              values={values.seoKeywords}
              onChange={(keywords) =>
                onChange("seoKeywords", keywords)
              }
              placeholder="e.g. cloud education"
              disabled={disabled}
            />
          </Field>
        </div>
      )}
    </section>
  );
}
