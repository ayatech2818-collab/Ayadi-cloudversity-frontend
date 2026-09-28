"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ImageOff,
  ImagePlus,
  Images,
  Info,
  Loader2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import type {
  Gallery,
  GalleryFormData,
} from "@/lib/api/galleries";
import { getApiErrorMessage } from "@/lib/api/errors";

import {
  GALLERY_COVER_ACCEPT,
  GALLERY_COVER_LABEL,
  generateSlug,
  isAllowedCoverFile,
} from "./gallery-utils";

export interface GalleryModalProps {
  open: boolean;
  mode: "create" | "edit";
  gallery?: Gallery | null;
  onClose: () => void;
  onSubmit: (data: GalleryFormData) => Promise<void>;
}

const DESCRIPTION_LIMIT = 500;

export default function GalleryModal({
  open,
  mode,
  gallery,
  onClose,
  onSubmit,
}: GalleryModalProps) {
  // =========================================================
  // FORM STATE
  // =========================================================

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
    useState(false);

  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  // =========================================================
  // COVER IMAGE
  //
  // Held locally and never submitted: there is no backend field or upload
  // endpoint for a gallery cover yet, and sending one would 422. `coverFile`
  // is the File the API will take once that lands — see handleFormSubmit.
  // =========================================================

  const [coverFile, setCoverFile] = useState<File | null>(
    null
  );

  /** Object URL for the picked file; null when nothing is picked. */
  const [coverPreview, setCoverPreview] = useState<
    string | null
  >(null);

  /** Set when an existing backend cover was cleared by the admin. */
  const [coverRemoved, setCoverRemoved] = useState(false);

  const [coverBroken, setCoverBroken] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  // Revokes the previous object URL whenever it is swapped out, cleared, or
  // the modal unmounts — the one place a leak could happen.
  useEffect(() => {
    if (!coverPreview) return;

    return () => URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  // =========================================================
  // RESET / POPULATE
  // =========================================================

  /**
   * Seeding the form during render (rather than in an effect) means the first
   * paint of the modal already shows the gallery values — no blank flash.
   */
  const formKey = open
    ? `${mode}:${gallery?.id ?? "new"}`
    : null;

  const [syncedKey, setSyncedKey] = useState<string | null>(
    null
  );

  if (syncedKey !== formKey) {
    setSyncedKey(formKey);

    if (formKey !== null) {
      if (mode === "edit" && gallery) {
        setTitle(gallery.title || "");
        setSlug(gallery.slug || "");
        setIsSlugManuallyEdited(true);

        setDescription(gallery.description || "");
        setEventDate(
          gallery.event_date
            ? gallery.event_date.slice(0, 10)
            : ""
        );
        setIsPublished(Boolean(gallery.is_published));
      } else {
        setTitle("");
        setSlug("");
        setIsSlugManuallyEdited(false);

        setDescription("");
        setEventDate("");
        setIsPublished(false);
      }
    }

    // The cleanup effect revokes the outgoing object URL for us.
    setCoverFile(null);
    setCoverPreview(null);
    setCoverRemoved(false);
    setCoverBroken(false);

    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(false);
  }

  // =========================================================
  // TITLE / SLUG
  // =========================================================

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) =>
      prev[field] ? { ...prev, [field]: "" } : prev
    );
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    clearFieldError("title");

    if (mode === "create" && !isSlugManuallyEdited) {
      setSlug(generateSlug(value));
      clearFieldError("slug");
    }
  };

  const handleSlugChange = (value: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(value.toLowerCase().replace(/\s+/g, "-"));
    clearFieldError("slug");
  };

  // =========================================================
  // COVER HANDLERS
  // =========================================================

  const existingCoverUrl =
    mode === "edit"
      ? (gallery?.cover_image_url ?? null)
      : null;

  const previewUrl =
    coverPreview ?? (coverRemoved ? null : existingCoverUrl);

  const handleCoverSelect = (file: File) => {
    if (!isAllowedCoverFile(file)) {
      setFieldErrors((prev) => ({
        ...prev,
        cover_image: `Cover image must be ${GALLERY_COVER_LABEL}.`,
      }));

      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverRemoved(false);
    setCoverBroken(false);
    clearFieldError("cover_image");
  };

  const handleCoverRemove = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setCoverRemoved(true);
    setCoverBroken(false);
    clearFieldError("cover_image");
  };

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
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (!eventDate) {
      errors.event_date = "Event date is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleFormSubmit = async () => {
    // Guards against a double submit from a fast second click.
    if (isSubmitting) return;

    setErrorMessage(null);

    if (!validateForm()) {
      setErrorMessage(
        "Please fill in all required fields marked in red."
      );
      return;
    }

    /*
     * TODO(backend): once the gallery cover endpoint exists, this is the only
     * place that changes — widen the payload (or add a follow-up upload call)
     * with `coverFile` for a new/replaced cover, and `coverRemoved` to clear
     * an existing one. Until then the body carries exactly the fields the API
     * accepts, so nothing is silently dropped or 422'd.
     */
    const payload: GalleryFormData = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      event_date: eventDate || null,
      is_published: isPublished,
    };

    try {
      setIsSubmitting(true);

      await onSubmit(payload);
    } catch (error: unknown) {
      console.error("Failed to submit gallery:", error);

      setErrorMessage(
        getApiErrorMessage(
          error,
          "An error occurred while saving the gallery. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-modal-title"
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        overflow-y-auto
        bg-black/50 p-3 backdrop-blur-sm sm:p-5 md:p-6
      "
    >
      <div
        className="
          relative flex max-h-[92vh] w-full max-w-2xl
          flex-col overflow-hidden
          rounded-2xl border border-border
          bg-surface text-text shadow-2xl
        "
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Images size={20} strokeWidth={2.2} />
            </div>

            <div>
              <h2
                id="gallery-modal-title"
                className="text-lg font-semibold tracking-tight text-text"
              >
                {mode === "create"
                  ? "Add Gallery"
                  : "Edit Gallery"}
              </h2>

              <p className="text-xs text-muted">
                {mode === "create"
                  ? "Create an event gallery, then upload its photos and videos."
                  : "Update the details of this event gallery."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl border border-border text-muted
              transition-colors hover:bg-page hover:text-text
              disabled:opacity-50
            "
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* ================================================= */}
        {/* BODY */}
        {/* ================================================= */}

        <div className="flex-1 space-y-6 overflow-y-auto p-6 sm:p-7">
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

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                1. Gallery Details
              </span>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="gallery-title"
                className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text"
              >
                <span>
                  Title{" "}
                  <span className="text-rose-500">*</span>
                </span>

                <span className="text-[11px] font-normal text-muted">
                  {title.length}/255
                </span>
              </label>

              <input
                id="gallery-title"
                type="text"
                maxLength={255}
                value={title}
                onChange={(event) =>
                  handleTitleChange(event.target.value)
                }
                placeholder="e.g. Convesta 2026"
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
              <label
                htmlFor="gallery-slug"
                className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text"
              >
                <span>
                  Slug / URL Path{" "}
                  <span className="text-rose-500">*</span>
                </span>

                {mode === "create" &&
                  !isSlugManuallyEdited && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                      <Sparkles size={11} />
                      Auto-generating
                    </span>
                  )}
              </label>

              <div
                className={`
                  flex items-center overflow-hidden rounded-xl border bg-page/50
                  focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10
                  ${
                    fieldErrors.slug
                      ? "border-rose-400"
                      : "border-border"
                  }
                `}
              >
                <span className="select-none border-r border-border bg-page px-3.5 py-2.5 font-mono text-xs text-muted">
                  /media/
                </span>

                <input
                  id="gallery-slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    handleSlugChange(event.target.value)
                  }
                  placeholder="convesta-2026"
                  className="
                    h-10 w-full bg-transparent px-3
                    font-mono text-xs text-text
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
                  Unique URL slug identifier for this gallery.
                </p>
              )}
            </div>

            {/* Event date */}
            <div>
              <label
                htmlFor="gallery-event-date"
                className="mb-1.5 block text-xs font-semibold text-text"
              >
                Event Date{" "}
                <span className="text-rose-500">*</span>
              </label>

              <input
                id="gallery-event-date"
                type="date"
                value={eventDate}
                onChange={(event) => {
                  setEventDate(event.target.value);
                  clearFieldError("event_date");
                }}
                className={`
                  h-11 w-full rounded-xl border bg-surface px-4 text-sm text-text
                  outline-none transition-all
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                  sm:max-w-xs
                  ${
                    fieldErrors.event_date
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                      : "border-border"
                  }
                `}
              />

              {fieldErrors.event_date && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.event_date}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="gallery-description"
                className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text"
              >
                <span>Description</span>

                <span className="text-[11px] font-normal text-muted">
                  {description.length}/{DESCRIPTION_LIMIT}
                </span>
              </label>

              <textarea
                id="gallery-description"
                rows={4}
                maxLength={DESCRIPTION_LIMIT}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="A short summary of the event this gallery covers."
                className="
                  w-full resize-y rounded-xl border border-border bg-surface
                  px-4 py-3 text-sm leading-relaxed text-text
                  outline-none transition-all placeholder:text-muted/60
                  focus:border-primary focus:ring-4 focus:ring-primary/10
                "
              />
            </div>
          </section>

          {/* ================================================= */}
          {/* 2. GALLERY COVER */}
          {/* ================================================= */}

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-1">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                2. Gallery Cover
              </span>

              <span className="text-[11px] font-medium text-muted">
                Optional
              </span>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-start">
              {/* Preview */}
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border border-border bg-page sm:w-52">
                {previewUrl && !coverBroken ? (
                  <img
                    src={previewUrl}
                    alt="Gallery cover preview"
                    onError={() => setCoverBroken(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-hero-ambient text-muted">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface/80 text-primary">
                      {coverBroken ? (
                        <ImageOff size={16} />
                      ) : (
                        <Images size={16} />
                      )}
                    </span>

                    <p className="text-[11px] font-semibold text-text">
                      Gallery cover
                    </p>

                    <p className="text-[10px]">
                      {coverBroken
                        ? "Preview unavailable"
                        : "No image selected"}
                    </p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text">
                    Card thumbnail
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-muted">
                    Shown on the gallery card. {GALLERY_COVER_LABEL}.
                    Leave it empty to fall back to the first
                    photo in the gallery.
                  </p>

                  {coverFile && (
                    <p
                      title={coverFile.name}
                      className="mt-2 truncate rounded-lg border border-border bg-page px-2.5 py-1.5 text-[11px] font-medium text-text"
                    >
                      {coverFile.name}
                    </p>
                  )}
                </div>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept={GALLERY_COVER_ACCEPT}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      handleCoverSelect(file);
                    }

                    // Lets the same file be re-picked after a removal.
                    event.target.value = "";
                  }}
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      coverInputRef.current?.click()
                    }
                    className="
                      inline-flex items-center gap-1.5
                      rounded-xl border border-border bg-surface
                      px-3.5 py-2 text-xs font-semibold text-text
                      transition-colors hover:border-primary/40 hover:bg-page
                      disabled:cursor-not-allowed disabled:opacity-50
                    "
                  >
                    <ImagePlus
                      size={14}
                      className="text-primary"
                    />
                    {previewUrl
                      ? "Replace image"
                      : "Select image"}
                  </button>

                  {previewUrl && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleCoverRemove}
                      className="
                        inline-flex items-center gap-1.5
                        rounded-xl border border-border bg-surface
                        px-3.5 py-2 text-xs font-semibold text-rose-600
                        transition-colors hover:border-rose-200 hover:bg-rose-50
                        disabled:cursor-not-allowed disabled:opacity-50
                      "
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>

                {fieldErrors.cover_image && (
                  <p className="text-xs text-rose-600">
                    {fieldErrors.cover_image}
                  </p>
                )}

                {/*
                  Honest about the current state of the world: the picked file
                  lives in this modal only until the backend can store it.
                */}
                {coverFile && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-amber-800">
                    <Info
                      size={13}
                      className="mt-0.5 shrink-0"
                    />

                    <p className="text-[11px] font-medium leading-relaxed">
                      Preview only — gallery covers are not
                      stored yet, so this image is discarded
                      when the modal closes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Visibility */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                3. Visibility
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
              <div className="pr-4">
                <p className="text-xs font-semibold text-text">
                  Published
                </p>

                <p className="text-[11px] text-muted">
                  {isPublished
                    ? "Gallery will be visible on the public website"
                    : "Gallery is saved as an internal working draft"}
                </p>
              </div>

              <label className="relative inline-flex cursor-pointer items-center">
                <span className="sr-only">
                  Publish gallery
                </span>

                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(event) =>
                    setIsPublished(event.target.checked)
                  }
                  className="peer sr-only"
                />

                <div className="h-6 w-11 rounded-full bg-border transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
              </label>
            </div>
          </section>
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-page/40 px-6 py-4">
          <span className="flex items-center gap-2 text-[11px] font-medium text-muted">
            <span
              className={`
                h-1.5 w-1.5 rounded-full
                ${isPublished ? "bg-primary" : "bg-muted"}
              `}
            />
            Target:{" "}
            {isPublished ? "Published" : "Draft"}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="
                rounded-xl border border-border bg-surface
                px-4 py-2.5 text-xs font-semibold text-text
                transition-colors hover:bg-page
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="
                inline-flex items-center gap-1.5
                rounded-xl bg-primary px-4.5 py-2.5
                text-xs font-semibold text-white shadow-sm
                transition-all hover:bg-primary-hover hover:shadow-md
                active:scale-95
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} strokeWidth={2.5} />
                  <span>
                    {mode === "create"
                      ? "Create Gallery"
                      : "Save Changes"}
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
