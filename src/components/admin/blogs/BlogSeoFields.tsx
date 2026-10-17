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
    <section className="rounded-xl bg-surface ring-1 ring-inset ring-border min-[360px]:rounded-2xl">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="blog-seo-fields"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl p-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary min-[360px]:gap-3 min-[360px]:rounded-2xl min-[360px]:p-3.5 sm:p-4 sm:px-5"
      >
        <span className="flex items-center gap-2.5 min-[360px]:gap-3">
          <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-md shadow-brand-start/25 min-[360px]:h-8 min-[360px]:w-8 min-[360px]:rounded-xl sm:h-9 sm:w-9">
            <Search className="size-3.5 min-[360px]:size-4 sm:size-[15px]" />
          </span>

          <span>
            <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-accent min-[360px]:text-xs">
              Search engines (SEO)
            </span>

            <span className="mt-0.5 block text-[10px] text-muted min-[360px]:text-[11px]">
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
          className="space-y-3 border-t border-border p-3 min-[360px]:space-y-3.5 min-[360px]:p-4 sm:space-y-4 sm:p-5"
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
              className={`${inputClass()} h-9 text-xs min-[360px]:h-9.5 min-[360px]:text-[13px] sm:h-11 sm:text-sm`}
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
              className={`${inputClass()} py-2 text-xs leading-relaxed min-[360px]:py-2.5 min-[360px]:text-[13px] sm:py-3 sm:text-sm`}
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
