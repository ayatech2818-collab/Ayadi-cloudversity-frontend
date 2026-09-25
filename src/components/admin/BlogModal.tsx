"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  X,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Settings2,
  Search,
  Check,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  Eye,
  Trash2,
  Upload,
} from "lucide-react";

import type { Blog, BlogFormData, BlogStatus } from "@/lib/api/blogs";

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
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogModal({
  open,
  mode,
  blog,
  onClose,
  onSubmit,
}: BlogModalProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("Technology");
  const [author, setAuthor] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImageKey, setCoverImageKey] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<BlogStatus>("draft");
  const [isFeatured, setIsFeatured] = useState(false);

  // SEO state
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  // Submission & Validation
  const [isSubmitting, setIsSubmitting] = useState<"draft" | "publish" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Reset or Populate on modal open / blog change
  useEffect(() => {
    if (!open) {
      setErrorMessage(null);
      setFieldErrors({});
      setIsSubmitting(null);
      return;
    }

    if (mode === "edit" && blog) {
      setTitle(blog.title || "");
      setSlug(blog.slug || "");
      setIsSlugManuallyEdited(true); // Don't auto-regenerate on edit
      setExcerpt(blog.excerpt || "");
      setContent(blog.content || "");
      setCategory(blog.category || "Technology");
      setAuthor(blog.author || "");
      setCoverImage(blog.cover_image || blog.image || "");
      setCoverImageKey(blog.cover_image_key || "");
      setCoverImageAlt(blog.cover_image_alt || "");
      setTags(Array.isArray(blog.tags) ? blog.tags : []);
      setStatus(blog.status || "draft");
      setIsFeatured(Boolean(blog.is_featured));

      // SEO
      setSeoTitle(blog.seo_title || "");
      setSeoDescription(blog.seo_description || "");
      setSeoKeywords(Array.isArray(blog.seo_keywords) ? blog.seo_keywords : []);
      setIsSeoOpen(Boolean(blog.seo_title || blog.seo_description));
    } else {
      // Create mode
      setTitle("");
      setSlug("");
      setIsSlugManuallyEdited(false);
      setExcerpt("");
      setContent("");
      setCategory("Technology");
      setAuthor("Ayadi Cloudversity");
      setCoverImage("");
      setCoverImageKey("");
      setCoverImageAlt("");
      setTags([]);
      setStatus("draft");
      setIsFeatured(false);

      // SEO
      setSeoTitle("");
      setSeoDescription("");
      setSeoKeywords([]);
      setIsSeoOpen(false);
    }

    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(null);
  }, [open, mode, blog]);

  // Handle Title change: auto-generate slug in create mode if not manually modified
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (fieldErrors.title) {
      setFieldErrors((prev) => ({ ...prev, title: "" }));
    }

    if (mode === "create" && !isSlugManuallyEdited) {
      setSlug(generateSlug(val));
      if (fieldErrors.slug) {
        setFieldErrors((prev) => ({ ...prev, slug: "" }));
      }
    }
  };

  // Handle manual Slug change
  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(val.toLowerCase().replace(/\s+/g, "-"));
    if (fieldErrors.slug) {
      setFieldErrors((prev) => ({ ...prev, slug: "" }));
    }
  };

  // Tag helper
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,+|,+$/g, "");
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // SEO Keyword helper
  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = keywordInput.trim().replace(/^,+|,+$/g, "");
      if (trimmed && !seoKeywords.includes(trimmed)) {
        setSeoKeywords([...seoKeywords, trimmed]);
        setKeywordInput("");
      }
    }
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setSeoKeywords(seoKeywords.filter((k) => k !== kwToRemove));
  };

  // Reading time estimate
  const estimatedReadingTime = useMemo(() => {
    if (!content.trim()) return 1;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [content]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    }

    if (!slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (!excerpt.trim()) {
      errors.excerpt = "Excerpt is required";
    }

    if (!content.trim()) {
      errors.content = "Content is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Submit (Draft or Publish)
  const handleFormSubmit = async (targetAction: "draft" | "publish") => {
    setErrorMessage(null);

    if (!validateForm()) {
      setErrorMessage("Please fill in all required fields marked in red.");
      return;
    }

    const payload: BlogFormData = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      cover_image: coverImage.trim() || null,
      cover_image_key: coverImageKey.trim() || null,
      cover_image_alt: coverImageAlt.trim() || null,
      category: category.trim() || null,
      tags: tags,
      author: author.trim() || null,
      author_id: blog?.author_id || null,
      status: targetAction === "publish" ? "published" : "draft",
      is_featured: isFeatured,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      seo_keywords: seoKeywords,
    };

    try {
      setIsSubmitting(targetAction);
      await onSubmit(payload, targetAction);
      onClose();
    } catch (err: unknown) {
      console.error("Failed to submit blog:", err);
      const message =
        err instanceof Error
          ? err.message
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
      {/* Modal Box */}
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
        {/* STICKY HEADER */}
        {/* ================================================= */}
        <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={20} strokeWidth={2.2} />
            </div>

            <div>
              <h2
                id="blog-modal-title"
                className="text-lg font-semibold tracking-tight text-text"
              >
                {mode === "create" ? "Create New Blog" : "Edit Blog"}
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
        {/* SCROLLABLE BODY */}
        {/* ================================================= */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-7">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
              <div className="text-xs font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* 1. BASIC INFORMATION */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-border/60">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                1. Basic Information
              </span>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                <span>Title <span className="text-rose-500">*</span></span>
                <span className="text-[11px] font-normal text-muted">
                  {title.length}/255
                </span>
              </label>
              <input
                type="text"
                required
                maxLength={255}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Next-Generation Cloud Architecture at Scale"
                className={`
                  h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text
                  outline-none transition-all placeholder:text-muted/60
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  ${fieldErrors.title ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : "border-border"}
                `}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                <span>Slug / URL Path <span className="text-rose-500">*</span></span>
                {mode === "create" && !isSlugManuallyEdited && (
                  <span className="text-[11px] text-primary font-medium flex items-center gap-1">
                    <Sparkles size={11} /> Auto-generating
                  </span>
                )}
              </label>
              <div className="flex items-center rounded-xl border border-border bg-page/50 overflow-hidden focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                <span className="px-3.5 text-xs text-muted font-mono select-none bg-page border-r border-border py-2.5">
                  /blog/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="next-generation-cloud-architecture"
                  className="
                    h-10 w-full bg-transparent px-3 text-xs font-mono text-text
                    outline-none placeholder:text-muted/60
                  "
                />
              </div>
              {fieldErrors.slug ? (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.slug}</p>
              ) : (
                <p className="mt-1 text-[11px] text-muted">
                  Unique URL slug identifier for this post.
                </p>
              )}
            </div>

            {/* Category & Author Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="
                      h-11 w-full cursor-pointer appearance-none
                      rounded-xl border border-border bg-surface px-4 text-sm text-text
                      outline-none transition-all hover:border-border/80
                      focus:border-primary focus:ring-4 focus:ring-primary/10
                    "
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
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
                  Author / Organization
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Ayadi Cloudversity"
                  className="
                    h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text
                    outline-none transition-all placeholder:text-muted/60
                    focus:border-primary focus:ring-4 focus:ring-primary/10
                  "
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                <span>Tags</span>
                <span className="text-[11px] text-muted">Press Enter or Comma to add</span>
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
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? "Add tag and press Enter..." : "Add more..."}
                  className="
                    h-7 flex-1 min-w-[130px] bg-transparent px-2 text-xs text-text
                    outline-none placeholder:text-muted/60
                  "
                />
              </div>
            </div>
          </section>

          {/* 2. CONTENT & EXCERPT */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-border/60">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                2. Article Content
              </span>

              {/* Estimated Reading Time */}
              <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                <Clock size={13} className="text-primary" />
                <span>Est. reading time: ~{estimatedReadingTime} min read</span>
              </span>
            </div>

            {/* Excerpt */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                <span>Summary / Excerpt <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-muted">1-2 sentences for previews & social</span>
              </label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  if (fieldErrors.excerpt) {
                    setFieldErrors((prev) => ({ ...prev, excerpt: "" }));
                  }
                }}
                placeholder="A compelling overview of what students or professionals will learn in this article..."
                className={`
                  w-full rounded-xl border bg-surface p-3.5 text-sm text-text
                  outline-none transition-all placeholder:text-muted/60
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  ${fieldErrors.excerpt ? "border-rose-400 focus:border-rose-500" : "border-border"}
                `}
              />
              {fieldErrors.excerpt && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.excerpt}</p>
              )}
            </div>

            {/* Full Content */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                <span>Article Body <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-muted">Markdown or plain text</span>
              </label>
              <textarea
                rows={9}
                required
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (fieldErrors.content) {
                    setFieldErrors((prev) => ({ ...prev, content: "" }));
                  }
                }}
                placeholder="Write your article content here..."
                className={`
                  w-full rounded-xl border bg-surface p-3.5 text-sm font-sans leading-relaxed text-text
                  outline-none transition-all placeholder:text-muted/60
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  ${fieldErrors.content ? "border-rose-400 focus:border-rose-500" : "border-border"}
                `}
              />
              {fieldErrors.content && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.content}</p>
              )}
            </div>
          </section>

          {/* 3. COVER IMAGE */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-border/60">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                3. Cover Image
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Image Input Details */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text">
                    Image URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="
                        h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-text
                        outline-none transition-all placeholder:text-muted/60
                        focus:border-primary focus:ring-4 focus:ring-primary/10
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

                {/* Alt Text */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text">
                    Cover Image Alt Text (Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    value={coverImageAlt}
                    onChange={(e) => setCoverImageAlt(e.target.value)}
                    placeholder="e.g. Students collaborating around a modern laptop in a digital classroom"
                    className="
                      h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-xs text-text
                      outline-none transition-all placeholder:text-muted/60
                      focus:border-primary focus:ring-4 focus:ring-primary/10
                    "
                  />
                </div>
              </div>

              {/* Preview Thumbnail */}
              <div className="flex flex-col items-center justify-center">
                <span className="mb-1.5 block w-full text-xs font-semibold text-text">
                  Preview
                </span>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-page flex items-center justify-center">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={coverImageAlt || "Cover preview"}
                      onError={() => {
                        // Keep component stable on broken image
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-muted">
                      <ImageIcon size={22} className="opacity-40" />
                      <span className="text-[11px]">No cover image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 4. PUBLISHING & VISIBILITY */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-border/60">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                4. Publishing & Visibility
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Status Switcher */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                <div>
                  <p className="text-xs font-semibold text-text">Publishing Status</p>
                  <p className="text-[11px] text-muted">
                    {status === "published"
                      ? "Article will be visible on the public website"
                      : "Article is saved as an internal working draft"}
                  </p>
                </div>

                <div className="flex items-center rounded-lg border border-border bg-page p-0.5">
                  <button
                    type="button"
                    onClick={() => setStatus("draft")}
                    className={`
                      rounded-md px-2.5 py-1 text-xs font-semibold transition-all
                      ${status === "draft" ? "bg-surface text-text shadow-sm" : "text-muted hover:text-text"}
                    `}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("published")}
                    className={`
                      rounded-md px-2.5 py-1 text-xs font-semibold transition-all
                      ${status === "published" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-text"}
                    `}
                  >
                    Published
                  </button>
                </div>
              </div>

              {/* Featured Switcher */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                <div>
                  <p className="text-xs font-semibold text-text">Featured Article</p>
                  <p className="text-[11px] text-muted">
                    Promote to hero position on the blog page
                  </p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-border peer-checked:bg-primary transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
          </section>

          {/* 5. SEO (COLLAPSIBLE) */}
          <section className="rounded-2xl border border-border bg-page/40 p-4 sm:p-5">
            <button
              type="button"
              onClick={() => setIsSeoOpen(!isSeoOpen)}
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
                <span>{isSeoOpen ? "Collapse" : "Expand"}</span>
                {isSeoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {isSeoOpen && (
              <div className="mt-5 space-y-4 border-t border-border/80 pt-4">
                {/* SEO Title */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                    <span>SEO Title</span>
                    <span className="text-[11px] text-muted">{seoTitle.length}/60 recommended</span>
                  </label>
                  <input
                    type="text"
                    maxLength={255}
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={title || "Custom page title for search engines..."}
                    className="
                      h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-xs text-text
                      outline-none transition-all placeholder:text-muted/60
                      focus:border-primary focus:ring-4 focus:ring-primary/10
                    "
                  />
                </div>

                {/* SEO Description */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                    <span>SEO Meta Description</span>
                    <span className="text-[11px] text-muted">{seoDescription.length}/160 recommended</span>
                  </label>
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder={excerpt || "Search engine summary..."}
                    className="
                      w-full rounded-xl border border-border bg-surface p-3 text-xs text-text
                      outline-none transition-all placeholder:text-muted/60
                      focus:border-primary focus:ring-4 focus:ring-primary/10
                    "
                  />
                </div>

                {/* SEO Keywords */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text">
                    <span>Meta Keywords</span>
                    <span className="text-[11px] text-muted">Press Enter to add keywords</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface p-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                    {seoKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="
                          inline-flex items-center gap-1
                          rounded-lg bg-page px-2 py-0.5
                          text-[11px] font-medium text-text border border-border
                        "
                      >
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:text-rose-600"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleAddKeyword}
                      placeholder={seoKeywords.length === 0 ? "e.g. cloud education, ai learning..." : "Add keyword..."}
                      className="
                        h-6 flex-1 min-w-[140px] bg-transparent px-2 text-xs text-text
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
        {/* STICKY FOOTER / ACTIONS */}
        {/* ================================================= */}
        <div className="sticky bottom-0 z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-page/70 px-6 py-4 backdrop-blur-md">
          {/* Status info */}
          <div className="flex items-center gap-2">
            <span
              className={`
                inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold
                ${status === "published" ? "bg-primary/10 text-primary" : "bg-muted/15 text-muted"}
              `}
            >
              <span
                className={`
                  h-1.5 w-1.5 rounded-full
                  ${status === "published" ? "bg-primary" : "bg-muted"}
                `}
              />
              Target: {status === "published" ? "Published" : "Draft"}
            </span>

            {isFeatured && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={Boolean(isSubmitting)}
              className="
                rounded-xl border border-border bg-surface px-4 py-2.5
                text-xs font-semibold text-text
                transition-colors hover:bg-page
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            {/* Save Draft Button */}
            <button
              type="button"
              disabled={Boolean(isSubmitting)}
              onClick={() => handleFormSubmit("draft")}
              className="
                inline-flex items-center gap-1.5
                rounded-xl border border-border bg-surface px-4 py-2.5
                text-xs font-semibold text-text shadow-sm
                transition-all hover:bg-page hover:border-border/80 active:scale-95
                disabled:opacity-50
              "
            >
              {isSubmitting === "draft" ? (
                <>
                  <Loader2 size={14} className="animate-spin text-muted" />
                  <span>Saving Draft...</span>
                </>
              ) : (
                <span>{mode === "create" ? "Save Draft" : "Save Changes"}</span>
              )}
            </button>

            {/* Publish Button */}
            <button
              type="button"
              disabled={Boolean(isSubmitting)}
              onClick={() => handleFormSubmit("publish")}
              className="
                inline-flex items-center gap-1.5
                rounded-xl bg-primary px-4.5 py-2.5
                text-xs font-semibold text-white shadow-sm
                transition-all hover:bg-primary-hover hover:shadow-md
                active:scale-95
                disabled:opacity-50
              "
            >
              {isSubmitting === "publish" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Check size={14} strokeWidth={2.5} />
                  <span>{mode === "create" ? "Publish" : "Publish Changes"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
