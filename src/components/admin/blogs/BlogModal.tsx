"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  FilePen,
  FilePlus2,
  LoaderCircle,
  Star,
} from "lucide-react";

import Alert from "@/components/admin/ui/Alert";
import Modal, {
  ModalFooter,
  ModalHeader,
} from "@/components/admin/ui/Modal";
import { generateSlug } from "@/components/admin/ui/SlugInput";
import { buttonClass } from "@/components/admin/ui/styles";
import { getAuthors, type Author } from "@/lib/api/authors";
import type { Blog, BlogFormData } from "@/lib/api/blogs";
import { getApiErrorMessage } from "@/lib/api/errors";

import BlogArticleFields from "./BlogArticleFields";
import BlogCoverField from "./BlogCoverField";
import BlogSeoFields from "./BlogSeoFields";
import BlogSettingsFields from "./BlogSettingsFields";
import {
  toBlogPayload,
  toFormValues,
  validateBlogForm,
  type BlogFieldsProps,
  type BlogFormErrors,
} from "./blog-form";
import { BLOG_COVER_LABEL, isAllowedBlogCover } from "./blog-utils";

type BlogAction = "draft" | "publish";

interface BlogModalProps {
  open: boolean;
  mode: "create" | "edit";
  blog?: Blog | null;
  onClose: () => void;
  onSubmit: (data: BlogFormData) => Promise<void>;
}

export default function BlogModal({
  open,
  ...form
}: BlogModalProps) {
  return (
    // No Esc-to-close: a stray key press must not throw an article away.
    <Modal
      open={open}
      closeOnEscape={false}
      onClose={form.onClose}
      labelledBy="blog-modal-title"
      size="xl"
    >
      {/* Mounted per open, so the fields always start from this blog. */}
      <BlogForm
        key={`${form.mode}:${form.blog?.id ?? "new"}`}
        {...form}
      />
    </Modal>
  );
}

function BlogForm({
  mode,
  blog,
  onClose,
  onSubmit,
}: Omit<BlogModalProps, "open">) {
  const isEdit = mode === "edit";
  const isPublished = isEdit && blog?.status === "published";

  const [values, setValues] = useState(() => toFormValues(blog));

  // A new post takes its slug from the title until the slug is typed by hand.
  const [slugEdited, setSlugEdited] = useState(isEdit);

  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    null
  );

  // `null` while the list is loading.
  const [authors, setAuthors] = useState<Author[] | null>(null);

  const [errors, setErrors] = useState<BlogFormErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState<BlogAction | null>(
    null
  );

  const bodyRef = useRef<HTMLDivElement>(null);

  const disabled = submitting !== null;

  useEffect(() => {
    let cancelled = false;

    getAuthors()
      .then((data) => {
        if (!cancelled) setAuthors(data);
      })
      .catch((error) => {
        console.error("Failed to fetch authors:", error);

        if (!cancelled) setAuthors([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Revokes the outgoing object URL whenever the pick changes or the form
  // unmounts — the one place a leak could happen.
  useEffect(() => {
    if (!coverPreview) return;

    return () => URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  const handleChange: BlogFieldsProps["onChange"] = (
    field,
    value
  ) => {
    setValues((current) => {
      const next = { ...current, [field]: value };

      if (field === "title" && !slugEdited) {
        next.slug = generateSlug(next.title);
      }

      return next;
    });

    if (field === "slug") setSlugEdited(true);

    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === "title" && !slugEdited && { slug: undefined }),
    }));
  };

  const handleCoverSelect = (file: File) => {
    if (!isAllowedBlogCover(file)) {
      setErrors((current) => ({
        ...current,
        cover: `The cover must be a ${BLOG_COVER_LABEL} image.`,
      }));

      return;
    }

    setCover(file);
    setCoverPreview(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, cover: undefined }));
  };

  const handleCoverClear = () => {
    setCover(null);
    setCoverPreview(null);
  };

  /** Errors show at the top of the form, so bring the top into view. */
  const showFormError = (message: string) => {
    setFormError(message);
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (action: BlogAction) => {
    // Guards against a double submit from a fast second click.
    if (submitting) return;

    const nextErrors = validateBlogForm(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showFormError(
        "Please fill in the required fields marked in red."
      );
      return;
    }

    try {
      setSubmitting(action);
      setFormError("");

      // The page closes the modal once the request succeeds.
      await onSubmit(
        toBlogPayload(
          values,
          cover,
          action === "publish" ? "published" : "draft"
        )
      );
    } catch (error) {
      console.error("Failed to submit blog:", error);

      showFormError(
        getApiErrorMessage(
          error,
          "Something went wrong while saving the blog. Please try again."
        )
      );
    } finally {
      setSubmitting(null);
    }
  };

  const fields: BlogFieldsProps = {
    values,
    errors,
    disabled,
    onChange: handleChange,
  };

  return (
    <>
      <ModalHeader
        id="blog-modal-title"
        icon={isEdit ? FilePen : FilePlus2}
        title={isEdit ? "Edit Blog" : "Create New Blog"}
        description={
          isEdit
            ? "Update the article, its cover and its SEO details."
            : "Write a new article, then save it as a draft or publish it."
        }
        onClose={onClose}
        disabled={disabled}
      />

      <div
        ref={bodyRef}
        className="flex-1 space-y-5 overflow-y-auto bg-page/60 p-4 sm:p-6"
      >
        {formError && <Alert>{formError}</Alert>}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <BlogArticleFields {...fields} autoSlug={!slugEdited} />

            <BlogSeoFields
              {...fields}
              defaultOpen={Boolean(
                blog?.seo_title || blog?.seo_description
              )}
            />
          </div>

          <div className="space-y-5">
            <BlogCoverField
              preview={coverPreview ?? blog?.cover_image ?? null}
              fileName={cover?.name}
              clearLabel={
                blog?.cover_image ? "Keep current cover" : "Remove"
              }
              alt={values.coverImageAlt}
              disabled={disabled}
              error={errors.cover}
              onSelect={handleCoverSelect}
              onClear={handleCoverClear}
              onAltChange={(alt) =>
                handleChange("coverImageAlt", alt)
              }
            />

            <BlogSettingsFields {...fields} authors={authors} />
          </div>
        </div>
      </div>

      <ModalFooter>
        {/* Where the post stands right now */}
        <p className="mr-auto flex items-center gap-2 text-[11px] font-semibold text-muted">
          <span
            className={`h-2 w-2 rounded-full ${
              isPublished ? "bg-brand-gradient" : "bg-amber-400"
            }`}
          />
          {isPublished ? "Published" : isEdit ? "Draft" : "New post"}

          {values.isFeatured && (
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star size={11} className="fill-current" />
              Featured
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={onClose}
          disabled={disabled}
          className={buttonClass("secondary")}
        >
          Cancel
        </button>

        {/*
          The button decides the status: this one always saves as a draft,
          the gradient one always saves as published.
        */}
        <button
          type="button"
          onClick={() => handleSubmit("draft")}
          disabled={disabled}
          title={
            isPublished
              ? "Save your changes and move this post back to draft"
              : undefined
          }
          className={buttonClass("secondary")}
        >
          {submitting === "draft" && (
            <LoaderCircle size={16} className="animate-spin" />
          )}
          {submitting === "draft"
            ? "Saving..."
            : isPublished
              ? "Unpublish"
              : "Save Draft"}
        </button>

        <button
          type="button"
          onClick={() => handleSubmit("publish")}
          disabled={disabled}
          className={buttonClass("primary")}
        >
          {submitting === "publish" ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Check size={16} strokeWidth={2.5} />
          )}
          {submitting === "publish"
            ? isPublished
              ? "Saving..."
              : "Publishing..."
            : isPublished
              ? "Save Changes"
              : "Publish"}
        </button>
      </ModalFooter>
    </>
  );
}
