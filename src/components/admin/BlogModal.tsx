"use client";

import { useEffect, useMemo, useState } from "react";

import {
  X,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Search,
  Check,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
} from "lucide-react";

import type {
  Blog,
  BlogFormData,
  BlogStatus,
} from "@/lib/api/blogs";

import {
  getAuthors,
  type Author,
} from "@/lib/api/authors";

export interface BlogModalProps {
  open: boolean;
  mode: "create" | "edit";
  blog?: Blog | null;
  onClose: () => void;
  onSubmit: (
    data: BlogFormData,
    action: "draft" | "publish"
  ) => Promise<void>;
}

const CATEGORY_OPTIONS = [
  "Technology",
  "Education",
  "AI",
  "Career",
  "Learning",
  "Cloud & DevOps",
  "Industry Insights",
  "Student Stories",
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s\_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogModal({
  open,
  mode,
  blog,
  onClose,
  onSubmit,
}: BlogModalProps) {
  // =========================================================
  // FORM STATE
  // =========================================================

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
    useState(false);

  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Technology");

  // Author
  const [authorId, setAuthorId] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(false);

  // Cover image
  const [coverImage, setCoverImage] = useState("");
  const [coverImageKey, setCoverImageKey] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Publishing
  const [status, setStatus] = useState<BlogStatus>("draft");
  const [isFeatured, setIsFeatured] = useState(false);

  // =========================================================
  // SEO STATE
  // =========================================================

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  // =========================================================
  // SUBMISSION / VALIDATION
  // =========================================================

  const [isSubmitting, setIsSubmitting] = useState<
    "draft" | "publish" | null
  >(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  // =========================================================
  // FETCH AUTHORS
  // =========================================================

  useEffect(() => {
    if (!open) return;

    const fetchAuthors = async () => {
      try {
        setLoadingAuthors(true);

        const data = await getAuthors();

        setAuthors(data);
      } catch (error) {
        console.error("Failed to fetch authors:", error);
      } finally {
        setLoadingAuthors(false);
      }
    };

    fetchAuthors();
  }, [open]);

  // =========================================================
  // RESET / POPULATE FORM
  // =========================================================

  useEffect(() => {
    if (!open) {
      setErrorMessage(null);
      setFieldErrors({});
      setIsSubmitting(null);
      return;
    }

    if (mode === "edit" && blog) {
      // Basic information
      setTitle(blog.title || "");
      setSlug(blog.slug || "");
      setIsSlugManuallyEdited(true);

      setExcerpt(blog.excerpt || "");
      setContent(blog.content || "");
      setCategory(blog.category || "Technology");

      // Author
      setAuthorId(blog.author_id || "");

      // Cover image
      setCoverImage(blog.cover_image || "");
      setCoverImageKey(blog.cover_image_key || "");
      setCoverImageAlt(blog.cover_image_alt || "");

      // Tags
      setTags(Array.isArray(blog.tags) ? blog.tags : []);

      // Publishing
      setStatus(blog.status || "draft");
      setIsFeatured(Boolean(blog.is_featured));

      // SEO
      setSeoTitle(blog.seo_title || "");
      setSeoDescription(blog.seo_description || "");
      setSeoKeywords(
        Array.isArray(blog.seo_keywords)
          ? blog.seo_keywords
          : []
      );

      setIsSeoOpen(
        Boolean(blog.seo_title || blog.seo_description)
      );
    } else {
      // =====================================================
      // CREATE MODE
      // =====================================================

      setTitle("");
      setSlug("");
      setIsSlugManuallyEdited(false);

      setExcerpt("");
      setContent("");
      setCategory("Technology");

      // No default author
      setAuthorId("");

      setCoverImage("");
      setCoverImageKey("");
      setCoverImageAlt("");

      setTags([]);
      setTagInput("");

      setStatus("draft");
      setIsFeatured(false);

      // SEO
      setSeoTitle("");
      setSeoDescription("");
      setSeoKeywords([]);
      setKeywordInput("");
      setIsSeoOpen(false);
    }

    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(null);
  }, [open, mode, blog]);

  // =========================================================
  // TITLE / SLUG
  // =========================================================

  const handleTitleChange = (value: string) => {
    setTitle(value);

    if (fieldErrors.title) {
      setFieldErrors((prev) => ({
        ...prev,
        title: "",
      }));
    }

    if (mode === "create" && !isSlugManuallyEdited) {
      setSlug(generateSlug(value));

      if (fieldErrors.slug) {
        setFieldErrors((prev) => ({
          ...prev,
          slug: "",
        }));
      }
    }
  };

  const handleSlugChange = (value: string) => {
    setIsSlugManuallyEdited(true);

    setSlug(
      value
        .toLowerCase()
        .replace(/\s+/g, "-")
    );

    if (fieldErrors.slug) {
      setFieldErrors((prev) => ({
        ...prev,
        slug: "",
      }));
    }
  };

  // =========================================================
  // TAGS
  // =========================================================

  const handleAddTag = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();

      const trimmed = tagInput
        .trim()
        .replace(/^,+|,+$/g, "");

      if (
        trimmed &&
        !tags.includes(trimmed)
      ) {
        setTags((prev) => [
          ...prev,
          trimmed,
        ]);

        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (
    tagToRemove: string
  ) => {
    setTags((prev) =>
      prev.filter(
        (tag) => tag !== tagToRemove
      )
    );
  };

  // =========================================================
  // SEO KEYWORDS
  // =========================================================

  const handleAddKeyword = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();

      const trimmed = keywordInput
        .trim()
        .replace(/^,+|,+$/g, "");

      if (
        trimmed &&
        !seoKeywords.includes(trimmed)
      ) {
        setSeoKeywords((prev) => [
          ...prev,
          trimmed,
        ]);

        setKeywordInput("");
      }
    }
  };

  const handleRemoveKeyword = (
    keywordToRemove: string
  ) => {
    setSeoKeywords((prev) =>
      prev.filter(
        (keyword) =>
          keyword !== keywordToRemove
      )
    );
  };

  // =========================================================
  // READING TIME
  // =========================================================

  const estimatedReadingTime = useMemo(() => {
    if (!content.trim()) return 1;

    const words = content
      .trim()
      .split(/\s+/).length;

    return Math.max(
      1,
      Math.ceil(words / 200)
    );
  }, [content]);

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    }

    if (!slug.trim()) {
      errors.slug = "Slug is required";
    } else if (
      !/^[a-z0-9-]+$/.test(slug)
    ) {
      errors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (!excerpt.trim()) {
      errors.excerpt =
        "Excerpt is required";
    }

    if (!content.trim()) {
      errors.content =
        "Content is required";
    }

    setFieldErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleFormSubmit = async (
    targetAction: "draft" | "publish"
  ) => {
    setErrorMessage(null);

    if (!validateForm()) {
      setErrorMessage(
        "Please fill in all required fields marked in red."
      );
      return;
    }

    const payload: BlogFormData = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),

      cover_image:
        coverImage.trim() || null,

      cover_image_key:
        coverImageKey.trim() || null,

      cover_image_alt:
        coverImageAlt.trim() || null,

      category:
        category.trim() || null,

      tags,

      // IMPORTANT
      author_id:
        authorId || null,

      status:
        targetAction === "publish"
          ? "published"
          : "draft",

      is_featured: isFeatured,

      // IMPORTANT
      reading_time_minutes:
        estimatedReadingTime,

      seo_title:
        seoTitle.trim() || null,

      seo_description:
        seoDescription.trim() || null,

      seo_keywords: seoKeywords,
    };

    try {
      setIsSubmitting(targetAction);

      await onSubmit(
        payload,
        targetAction
      );

      onClose();
    } catch (error: unknown) {
      console.error(
        "Failed to submit blog:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while saving the blog. Please try again.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(null);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-modal-title"
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        overflow-y-auto
        bg-black/50 p-3 sm:p-5 md:p-6
        backdrop-blur-sm
      "
    >
      <div
        className="
          relative flex max-h-[92vh] w-full max-w-4xl
          flex-col overflow-hidden
          rounded-2xl border border-border
          bg-surface text-text
          shadow-2xl
        "
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText
                size={20}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <h2
                id="blog-modal-title"
                className="text-lg font-semibold tracking-tight text-text"
              >
                {mode === "create"
                  ? "Create New Blog"
                  : "Edit Blog"}
              </h2>

              <p className="text-xs text-muted">
                {mode === "create"
                  ? "Draft or publish a new article for Ayadi Cloudversity."
                  : "Update your article content, SEO metadata, and publishing options."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(isSubmitting)}
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl border border-border
              text-muted
              transition-colors
              hover:bg-page hover:text-text
              disabled:opacity-50
            "
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* ================================================= */}
        {/* BODY */}
        {/* ================================================= */}

        <div className="flex-1 space-y-7 overflow-y-auto p-6 sm:p-7">
          {/* Error */}
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-rose-600"
              />

              <div className="text-xs font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* 1. BASIC INFORMATION */}
          {/* ================================================= */}

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                1. Basic Information
              </span>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                <span>
                  Title{" "}
                  <span className="text-rose-500">
                    *
                  </span>
                </span>

                <span className="text-[11px] font-normal text-muted">
                  {title.length}/255
                </span>
              </label>

              <input
                type="text"
                required
                maxLength={255}
                value={title}
                onChange={(event) =>
                  handleTitleChange(
                    event.target.value
                  )
                }
                placeholder="e.g. Next-Generation Cloud Architecture at Scale"
                className={`
                  h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text
                  outline-none transition-all placeholder:text-muted/60
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  ${
                    fieldErrors.title
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                      : "border-border"
                  }
                `}
              />

              {fieldErrors.title && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.title}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                <span>
                  Slug / URL Path{" "}
                  <span className="text-rose-500">
                    *
                  </span>
                </span>

                {mode === "create" &&
                  !isSlugManuallyEdited && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                      <Sparkles size={11} />
                      Auto-generating
                    </span>
                  )}
              </label>

              <div className="flex items-center overflow-hidden rounded-xl border border-border bg-page/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                <span className="select-none border-r border-border bg-page px-3.5 py-2.5 font-mono text-xs text-muted">
                  /blog/
                </span>

                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(event) =>
                    handleSlugChange(
                      event.target.value
                    )
                  }
                  placeholder="next-generation-cloud-architecture"
                  className="
                    h-10 w-full bg-transparent px-3
                    text-xs font-mono text-text
                    outline-none placeholder:text-muted/60
                  "
                />
              </div>

              {fieldErrors.slug ? (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.slug}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-muted">
                  Unique URL slug identifier for this post.
                </p>
              )}
            </div>

            {/* Category + Author */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text">
                  Category
                </label>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value
                      )
                    }
                    className="
                      h-11 w-full cursor-pointer appearance-none
                      rounded-xl border border-border bg-surface
                      px-4 text-sm text-text
                      outline-none transition-all
                      hover:border-border/80
                      focus:border-primary
                      focus:ring-4 focus:ring-primary/10
                    "
                  >
                    {CATEGORY_OPTIONS.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>

              {/* Author */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text">
                  Author
                </label>

                <div className="relative">
                  <select
                    value={authorId}
                    onChange={(event) =>
                      setAuthorId(
                        event.target.value
                      )
                    }
                    disabled={loadingAuthors}
                    className="
                      h-11 w-full cursor-pointer appearance-none
                      rounded-xl border border-border bg-surface
                      px-4 pr-10 text-sm text-text
                      outline-none transition-all
                      hover:border-border/80
                      focus:border-primary
                      focus:ring-4 focus:ring-primary/10
                      disabled:cursor-not-allowed disabled:opacity-60
                    "
                  >
                    <option value="">
                      {loadingAuthors
                        ? "Loading authors..."
                        : "Select an author"}
                    </option>

                    {authors.map(
                      (author) => (
                        <option
                          key={author.id}
                          value={author.id}
                        >
                          {author.name}
                          {author.designation
                            ? ` — ${author.designation}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>

                {!loadingAuthors &&
                  authors.length === 0 && (
                    <p className="mt-1 text-[11px] text-muted">
                      No active authors found.
                    </p>
                  )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                <span>Tags</span>

                <span className="text-[11px] text-muted">
                  Press Enter or Comma to add
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface p-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="
                      inline-flex items-center gap-1
                      rounded-lg bg-primary/10 px-2 py-1
                      text-xs font-medium text-primary
                    "
                  >
                    <Tag size={11} />

                    <span>{tag}</span>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveTag(tag)
                      }
                      className="ml-0.5 hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  value={tagInput}
                  onChange={(event) =>
                    setTagInput(
                      event.target.value
                    )
                  }
                  onKeyDown={handleAddTag}
                  placeholder={
                    tags.length === 0
                      ? "Add tag and press Enter..."
                      : "Add more..."
                  }
                  className="
                    h-7 min-w-[130px] flex-1
                    bg-transparent px-2 text-xs text-text
                    outline-none placeholder:text-muted/60
                  "
                />
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* 2. ARTICLE CONTENT */}
          {/* ================================================= */}

          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-1">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                2. Article Content
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                <Clock
                  size={13}
                  className="text-primary"
                />

                <span>
                  Est. reading time: ~
                  {estimatedReadingTime} min
                  read
                </span>
              </span>
            </div>

            {/* Excerpt */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                <span>
                  Summary / Excerpt{" "}
                  <span className="text-rose-500">
                    *
                  </span>
                </span>

                <span className="text-[11px] text-muted">
                  1-2 sentences for previews & social
                </span>
              </label>

              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(event) => {
                  setExcerpt(
                    event.target.value
                  );

                  if (fieldErrors.excerpt) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      excerpt: "",
                    }));
                  }
                }}
                placeholder="A compelling overview of what students or professionals will learn in this article..."
                className={`
                  w-full rounded-xl border bg-surface p-3.5 text-sm text-text
                  outline-none transition-all placeholder:text-muted/60
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  ${
                    fieldErrors.excerpt
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-border"
                  }
                `}
              />

              {fieldErrors.excerpt && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.excerpt}
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                <span>
                  Article Body{" "}
                  <span className="text-rose-500">
                    *
                  </span>
                </span>

                <span className="text-[11px] text-muted">
                  Markdown or plain text
                </span>
              </label>

              <textarea
                rows={9}
                required
                value={content}
                onChange={(event) => {
                  setContent(
                    event.target.value
                  );

                  if (fieldErrors.content) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      content: "",
                    }));
                  }
                }}
                placeholder="Write your article content here..."
                className={`
                  w-full rounded-xl border bg-surface p-3.5
                  text-sm font-sans leading-relaxed text-text
                  outline-none transition-all placeholder:text-muted/60
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  ${
                    fieldErrors.content
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-border"
                  }
                `}
              />

              {fieldErrors.content && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.content}
                </p>
              )}
            </div>
          </section>

          {/* ================================================= */}
          {/* 3. COVER IMAGE */}
          {/* ================================================= */}

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                3. Cover Image
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-3 md:col-span-2">
                {/* Image URL */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text">
                    Image URL
                  </label>

                  <div className="relative">
                    <input
                      type="url"
                      value={coverImage}
                      onChange={(event) =>
                        setCoverImage(
                          event.target.value
                        )
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="
                        h-11 w-full rounded-xl border border-border
                        bg-surface pl-10 pr-4 text-sm text-text
                        outline-none transition-all
                        placeholder:text-muted/60
                        focus:border-primary
                        focus:ring-4 focus:ring-primary/10
                      "
                    />

                    <ImageIcon
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>

                  <p className="mt-1 text-[11px] text-muted">
                    Supports high-resolution web formats (JPG, PNG, WebP).
                  </p>
                </div>

                {/* Alt */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text">
                    Cover Image Alt Text
                    (Accessibility & SEO)
                  </label>

                  <input
                    type="text"
                    value={coverImageAlt}
                    onChange={(event) =>
                      setCoverImageAlt(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Students collaborating around a modern laptop in a digital classroom"
                    className="
                      h-10 w-full rounded-xl border border-border
                      bg-surface px-3.5 text-xs text-text
                      outline-none transition-all
                      placeholder:text-muted/60
                      focus:border-primary
                      focus:ring-4 focus:ring-primary/10
                    "
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="flex flex-col items-center justify-center">
                <span className="mb-1.5 block w-full text-xs font-semibold text-text">
                  Preview
                </span>

                <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-page">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={
                        coverImageAlt ||
                        "Cover preview"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-muted">
                      <ImageIcon
                        size={22}
                        className="opacity-40"
                      />

                      <span className="text-[11px]">
                        No cover image
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* 4. PUBLISHING */}
          {/* ================================================= */}

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                4. Publishing & Visibility
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Status */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                <div>
                  <p className="text-xs font-semibold text-text">
                    Publishing Status
                  </p>

                  <p className="text-[11px] text-muted">
                    {status === "published"
                      ? "Article will be visible on the public website"
                      : "Article is saved as an internal working draft"}
                  </p>
                </div>

                <div className="flex items-center rounded-lg border border-border bg-page p-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setStatus("draft")
                    }
                    className={`
                      rounded-md px-2.5 py-1 text-xs font-semibold transition-all
                      ${
                        status === "draft"
                          ? "bg-surface text-text shadow-sm"
                          : "text-muted hover:text-text"
                      }
                    `}
                  >
                    Draft
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setStatus("published")
                    }
                    className={`
                      rounded-md px-2.5 py-1 text-xs font-semibold transition-all
                      ${
                        status === "published"
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted hover:text-text"
                      }
                    `}
                  >
                    Published
                  </button>
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                <div>
                  <p className="text-xs font-semibold text-text">
                    Featured Article
                  </p>

                  <p className="text-[11px] text-muted">
                    Promote to hero position on the blog page
                  </p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(event) =>
                      setIsFeatured(
                        event.target.checked
                      )
                    }
                    className="peer sr-only"
                  />

                  <div className="h-6 w-11 rounded-full bg-border transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* 5. SEO */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-border bg-page/40 p-4 sm:p-5">
            <button
              type="button"
              onClick={() =>
                setIsSeoOpen(
                  (prev) => !prev
                )
              }
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Search size={15} />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-text">
                    5. Search Engine Optimization (SEO)
                  </span>

                  <p className="text-[11px] text-muted">
                    Customize meta tags, description, and keywords
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted">
                <span>
                  {isSeoOpen
                    ? "Collapse"
                    : "Expand"}
                </span>

                {isSeoOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </button>

            {isSeoOpen && (
              <div className="mt-5 space-y-4 border-t border-border/80 pt-4">
                {/* SEO title */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                    <span>SEO Title</span>

                    <span className="text-[11px] text-muted">
                      {seoTitle.length}/60
                      recommended
                    </span>
                  </label>

                  <input
                    type="text"
                    maxLength={255}
                    value={seoTitle}
                    onChange={(event) =>
                      setSeoTitle(
                        event.target.value
                      )
                    }
                    placeholder={
                      title ||
                      "Custom page title for search engines..."
                    }
                    className="
                      h-10 w-full rounded-xl border border-border
                      bg-surface px-3.5 text-xs text-text
                      outline-none transition-all
                      placeholder:text-muted/60
                      focus:border-primary
                      focus:ring-4 focus:ring-primary/10
                    "
                  />
                </div>

                {/* SEO description */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                    <span>
                      SEO Meta Description
                    </span>

                    <span className="text-[11px] text-muted">
                      {seoDescription.length}/160
                      recommended
                    </span>
                  </label>

                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(event) =>
                      setSeoDescription(
                        event.target.value
                      )
                    }
                    placeholder={
                      excerpt ||
                      "Search engine summary..."
                    }
                    className="
                      w-full rounded-xl border border-border
                      bg-surface p-3 text-xs text-text
                      outline-none transition-all
                      placeholder:text-muted/60
                      focus:border-primary
                      focus:ring-4 focus:ring-primary/10
                    "
                  />
                </div>

                {/* SEO keywords */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                    <span>
                      Meta Keywords
                    </span>

                    <span className="text-[11px] text-muted">
                      Press Enter to add keywords
                    </span>
                  </label>

                  <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface p-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                    {seoKeywords.map(
                      (keyword) => (
                        <span
                          key={keyword}
                          className="
                            inline-flex items-center gap-1
                            rounded-lg border border-border
                            bg-page px-2 py-0.5
                            text-[11px] font-medium text-text
                          "
                        >
                          <span>
                            {keyword}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveKeyword(
                                keyword
                              )
                            }
                            className="hover:text-rose-600"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      )
                    )}

                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(event) =>
                        setKeywordInput(
                          event.target.value
                        )
                      }
                      onKeyDown={
                        handleAddKeyword
                      }
                      placeholder={
                        seoKeywords.length === 0
                          ? "e.g. cloud education, ai learning..."
                          : "Add keyword..."
                      }
                      className="
                        h-6 min-w-[140px] flex-1
                        bg-transparent px-2 text-xs text-text
                        outline-none placeholder:text-muted/60
                      "
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="sticky bottom-0 z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-page/70 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span
              className={`
                inline-flex items-center gap-1.5 rounded-full
                px-2.5 py-1 text-[11px] font-semibold
                ${
                  status === "published"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/15 text-muted"
                }
              `}
            >
              <span
                className={`
                  h-1.5 w-1.5 rounded-full
                  ${
                    status === "published"
                      ? "bg-primary"
                      : "bg-muted"
                  }
                `}
              />

              Target:{" "}
              {status === "published"
                ? "Published"
                : "Draft"}
            </span>

            {isFeatured && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                ⭐ Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              disabled={Boolean(
                isSubmitting
              )}
              className="
                rounded-xl border border-border
                bg-surface px-4 py-2.5
                text-xs font-semibold text-text
                transition-colors hover:bg-page
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            {/* Draft */}
            <button
              type="button"
              disabled={Boolean(
                isSubmitting
              )}
              onClick={() =>
                handleFormSubmit("draft")
              }
              className="
                inline-flex items-center gap-1.5
                rounded-xl border border-border
                bg-surface px-4 py-2.5
                text-xs font-semibold text-text shadow-sm
                transition-all
                hover:border-border/80 hover:bg-page
                active:scale-95
                disabled:opacity-50
              "
            >
              {isSubmitting === "draft" ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin text-muted"
                  />
                  <span>
                    Saving Draft...
                  </span>
                </>
              ) : (
                <span>
                  {mode === "create"
                    ? "Save Draft"
                    : "Save Changes"}
                </span>
              )}
            </button>

            {/* Publish */}
            <button
              type="button"
              disabled={Boolean(
                isSubmitting
              )}
              onClick={() =>
                handleFormSubmit(
                  "publish"
                )
              }
              className="
                inline-flex items-center gap-1.5
                rounded-xl bg-primary
                px-4.5 py-2.5
                text-xs font-semibold text-white shadow-sm
                transition-all
                hover:bg-primary-hover hover:shadow-md
                active:scale-95
                disabled:opacity-50
              "
            >
              {isSubmitting ===
              "publish" ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  <span>
                    Publishing...
                  </span>
                </>
              ) : (
                <>
                  <Check
                    size={14}
                    strokeWidth={2.5}
                  />

                  <span>
                    {mode === "create"
                      ? "Publish"
                      : "Publish Changes"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}