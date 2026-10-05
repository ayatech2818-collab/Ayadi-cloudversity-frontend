"use client";

import Field from "@/components/admin/ui/Field";
import FormSection from "@/components/admin/ui/FormSection";
import Select from "@/components/admin/ui/Select";
import Switch from "@/components/admin/ui/Switch";
import TagInput from "@/components/admin/ui/TagInput";
import type { Author } from "@/lib/api/authors";

import type { BlogFieldsProps } from "./blog-form";
import { BLOG_CATEGORIES } from "./blog-utils";

interface BlogSettingsFieldsProps extends BlogFieldsProps {
  /** Active authors to pick from. `null` while they are loading. */
  authors: Author[] | null;
}

/** Where the post is filed: category, author, tags and the featured flag. */
export default function BlogSettingsFields({
  values,
  disabled,
  authors,
  onChange,
}: BlogSettingsFieldsProps) {
  // A post saved under a category that is no longer listed keeps it.
  const categories = BLOG_CATEGORIES.includes(values.category)
    ? BLOG_CATEGORIES
    : [values.category, ...BLOG_CATEGORIES];

  return (
    <FormSection title="Organise">
      <Field label="Category" htmlFor="blog-category">
        <Select
          id="blog-category"
          value={values.category}
          disabled={disabled}
          onChange={(event) =>
            onChange("category", event.target.value)
          }
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Author"
        htmlFor="blog-author"
        hint={
          authors?.length === 0
            ? "No active authors found."
            : undefined
        }
      >
        <Select
          id="blog-author"
          value={values.authorId}
          disabled={disabled || authors === null}
          onChange={(event) =>
            onChange("authorId", event.target.value)
          }
        >
          <option value="">
            {authors === null
              ? "Loading authors..."
              : "Select an author"}
          </option>

          {authors?.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
              {author.designation ? ` — ${author.designation}` : ""}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Tags"
        htmlFor="blog-tags"
        aside="Enter or comma to add"
      >
        <TagInput
          id="blog-tags"
          values={values.tags}
          onChange={(tags) => onChange("tags", tags)}
          placeholder="Add a tag..."
          disabled={disabled}
        />
      </Field>

      <Switch
        label="Featured article"
        description="Promote to the hero position on the blog page"
        checked={values.isFeatured}
        onChange={(checked) => onChange("isFeatured", checked)}
        disabled={disabled}
      />
    </FormSection>
  );
}
