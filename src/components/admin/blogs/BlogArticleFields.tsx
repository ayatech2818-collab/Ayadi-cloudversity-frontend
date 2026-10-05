"use client";

import { Clock3, Sparkles } from "lucide-react";

import Field from "@/components/admin/ui/Field";
import FormSection from "@/components/admin/ui/FormSection";
import SlugInput from "@/components/admin/ui/SlugInput";
import { inputClass } from "@/components/admin/ui/styles";

import type { BlogFieldsProps } from "./blog-form";
import { estimateReadingTime } from "./blog-utils";

interface BlogArticleFieldsProps extends BlogFieldsProps {
  /** True while the slug is still following the title. */
  autoSlug: boolean;
}

/** The writing itself: title, slug, excerpt and body. */
export default function BlogArticleFields({
  values,
  errors,
  disabled,
  autoSlug,
  onChange,
}: BlogArticleFieldsProps) {
  return (
    <FormSection
      title="Article"
      aside={
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={12} className="text-primary" />~
          {estimateReadingTime(values.content)} min read
        </span>
      }
    >
      <Field
        label="Title"
        htmlFor="blog-title"
        required
        aside={`${values.title.length}/255`}
        error={errors.title}
      >
        <input
          id="blog-title"
          type="text"
          data-autofocus
          maxLength={255}
          value={values.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="e.g. Next-Generation Cloud Architecture at Scale"
          disabled={disabled}
          aria-invalid={Boolean(errors.title)}
          className={`${inputClass(Boolean(errors.title))} h-11`}
        />
      </Field>

      <Field
        label="Slug / URL path"
        htmlFor="blog-slug"
        required
        aside={
          autoSlug && (
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              <Sparkles size={11} />
              Auto-generating
            </span>
          )
        }
        hint="The unique address of this post."
        error={errors.slug}
      >
        <SlugInput
          id="blog-slug"
          prefix="/blog/"
          value={values.slug}
          onChange={(slug) => onChange("slug", slug)}
          placeholder="next-generation-cloud-architecture"
          invalid={Boolean(errors.slug)}
          disabled={disabled}
        />
      </Field>

      <Field
        label="Summary / excerpt"
        htmlFor="blog-excerpt"
        required
        hint="One or two sentences, shown on cards and in previews."
        error={errors.excerpt}
      >
        <textarea
          id="blog-excerpt"
          rows={3}
          value={values.excerpt}
          onChange={(event) =>
            onChange("excerpt", event.target.value)
          }
          placeholder="A compelling overview of what readers will learn in this article..."
          disabled={disabled}
          aria-invalid={Boolean(errors.excerpt)}
          className={`${inputClass(Boolean(errors.excerpt))} py-3 leading-relaxed`}
        />
      </Field>

      <Field
        label="Article body"
        htmlFor="blog-content"
        required
        aside="Markdown or plain text"
        error={errors.content}
      >
        <textarea
          id="blog-content"
          rows={12}
          value={values.content}
          onChange={(event) =>
            onChange("content", event.target.value)
          }
          placeholder="Write your article content here..."
          disabled={disabled}
          aria-invalid={Boolean(errors.content)}
          className={`${inputClass(Boolean(errors.content))} py-3 leading-relaxed`}
        />
      </Field>
    </FormSection>
  );
}
