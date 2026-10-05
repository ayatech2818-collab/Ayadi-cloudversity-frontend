"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ImagePlus,
  Images,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import Alert from "@/components/admin/ui/Alert";
import Field from "@/components/admin/ui/Field";
import FormSection from "@/components/admin/ui/FormSection";
import Modal, {
  ModalFooter,
  ModalHeader,
} from "@/components/admin/ui/Modal";
import SlugInput, {
  generateSlug,
} from "@/components/admin/ui/SlugInput";
import Switch from "@/components/admin/ui/Switch";
import {
  buttonClass,
  inputClass,
} from "@/components/admin/ui/styles";
import type {
  Gallery,
  GalleryFormData,
} from "@/lib/api/galleries";
import { getApiErrorMessage } from "@/lib/api/errors";

import GalleryCoverField from "./GalleryCoverField";
import {
  GALLERY_COVER_LABEL,
  isAllowedCoverFile,
} from "./gallery-utils";

interface GalleryModalProps {
  open: boolean;
  mode: "create" | "edit";
  gallery?: Gallery | null;
  onClose: () => void;
  onSubmit: (data: GalleryFormData) => Promise<void>;
}

const DESCRIPTION_LIMIT = 500;

export default function GalleryModal({
  open,
  ...form
}: GalleryModalProps) {
  const [saving, setSaving] = useState(false);

  return (
    <Modal
      open={open}
      busy={saving}
      onClose={form.onClose}
      labelledBy="gallery-modal-title"
      size="lg"
    >
      {/* Mounted per open, so the fields always start from this gallery. */}
      <GalleryForm
        key={`${form.mode}:${form.gallery?.id ?? "new"}`}
        {...form}
        saving={saving}
        onSavingChange={setSaving}
      />
    </Modal>
  );
}

interface GalleryFormProps extends Omit<GalleryModalProps, "open"> {
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
}

type FieldName = "title" | "slug" | "event_date" | "cover_image";

function GalleryForm({
  mode,
  gallery,
  saving,
  onSavingChange,
  onClose,
  onSubmit,
}: GalleryFormProps) {
  const isEdit = mode === "edit";

  // =========================================================
  // FORM STATE
  // =========================================================

  const [title, setTitle] = useState(gallery?.title ?? "");
  const [slug, setSlug] = useState(gallery?.slug ?? "");

  // A new gallery takes its slug from the title until the slug is typed by
  // hand.
  const [slugEdited, setSlugEdited] = useState(isEdit);

  const [description, setDescription] = useState(
    gallery?.description ?? ""
  );
  const [eventDate, setEventDate] = useState(
    gallery?.event_date ? gallery.event_date.slice(0, 10) : ""
  );
  const [isPublished, setIsPublished] = useState(
    Boolean(gallery?.is_published)
  );

  const [errors, setErrors] = useState<
    Partial<Record<FieldName, string>>
  >({});
  const [formError, setFormError] = useState("");

  // =========================================================
  // COVER IMAGE
  //
  // Held locally and never submitted: there is no backend field or upload
  // endpoint for a gallery cover yet, and sending one would 422. `coverFile`
  // is the File the API will take once that lands — see handleSubmit.
  // =========================================================

  const [coverFile, setCoverFile] = useState<File | null>(null);

  /** Object URL for the picked file; null when nothing is picked. */
  const [coverPreview, setCoverPreview] = useState<string | null>(
    null
  );

  /** Set when an existing backend cover was cleared by the admin. */
  const [coverRemoved, setCoverRemoved] = useState(false);

  // Revokes the previous object URL whenever it is swapped out, cleared, or
  // the form unmounts — the one place a leak could happen.
  useEffect(() => {
    if (!coverPreview) return;

    return () => URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  const existingCoverUrl = isEdit
    ? (gallery?.cover_image_url ?? null)
    : null;

  const previewUrl =
    coverPreview ?? (coverRemoved ? null : existingCoverUrl);

  const clearError = (field: FieldName) =>
    setErrors((current) => ({ ...current, [field]: undefined }));

  const handleCoverSelect = (file: File) => {
    if (!isAllowedCoverFile(file)) {
      setErrors((current) => ({
        ...current,
        cover_image: `Cover image must be ${GALLERY_COVER_LABEL}.`,
      }));

      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverRemoved(false);
    clearError("cover_image");
  };

  const handleCoverRemove = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setCoverRemoved(true);
    clearError("cover_image");
  };

  // =========================================================
  // TITLE / SLUG
  // =========================================================

  const handleTitleChange = (value: string) => {
    setTitle(value);
    clearError("title");

    if (!slugEdited) {
      setSlug(generateSlug(value));
      clearError("slug");
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setSlug(value);
    clearError("slug");
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // Guards against a double submit from a fast second click.
    if (saving) return;

    const nextErrors: typeof errors = {};

    if (!title.trim()) {
      nextErrors.title = "Title is required";
    }

    if (!slug.trim()) {
      nextErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      nextErrors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (!eventDate) {
      nextErrors.event_date = "Event date is required";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFormError(
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
      onSavingChange(true);
      setFormError("");

      // The page closes the modal once the request succeeds.
      await onSubmit(payload);
    } catch (error) {
      console.error("Failed to submit gallery:", error);

      setFormError(
        getApiErrorMessage(
          error,
          "An error occurred while saving the gallery. Please try again."
        )
      );
    } finally {
      onSavingChange(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <ModalHeader
        id="gallery-modal-title"
        icon={isEdit ? Images : ImagePlus}
        title={isEdit ? "Edit Gallery" : "Add Gallery"}
        description={
          isEdit
            ? "Update the details of this event gallery."
            : "Create an event gallery, then upload its photos and videos."
        }
        onClose={onClose}
        disabled={saving}
      />

      <div className="flex-1 space-y-5 overflow-y-auto bg-page/60 p-4 sm:p-6">
        {formError && <Alert>{formError}</Alert>}

        <FormSection title="Gallery details">
          <Field
            label="Title"
            htmlFor="gallery-title"
            required
            aside={`${title.length}/255`}
            error={errors.title}
          >
            <input
              id="gallery-title"
              type="text"
              data-autofocus
              maxLength={255}
              value={title}
              onChange={(event) =>
                handleTitleChange(event.target.value)
              }
              placeholder="e.g. Convesta 2026"
              disabled={saving}
              aria-invalid={Boolean(errors.title)}
              className={`${inputClass(Boolean(errors.title))} h-11`}
            />
          </Field>

          <Field
            label="Slug / URL path"
            htmlFor="gallery-slug"
            required
            aside={
              !slugEdited && (
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  <Sparkles size={11} />
                  Auto-generating
                </span>
              )
            }
            hint="Unique URL slug identifier for this gallery."
            error={errors.slug}
          >
            <SlugInput
              id="gallery-slug"
              prefix="/media/"
              value={slug}
              onChange={handleSlugChange}
              placeholder="convesta-2026"
              invalid={Boolean(errors.slug)}
              disabled={saving}
            />
          </Field>

          <Field
            label="Event date"
            htmlFor="gallery-event-date"
            required
            error={errors.event_date}
          >
            <input
              id="gallery-event-date"
              type="date"
              value={eventDate}
              onChange={(event) => {
                setEventDate(event.target.value);
                clearError("event_date");
              }}
              disabled={saving}
              aria-invalid={Boolean(errors.event_date)}
              className={`${inputClass(Boolean(errors.event_date))} h-11 sm:max-w-xs`}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="gallery-description"
            aside={`${description.length}/${DESCRIPTION_LIMIT}`}
          >
            <textarea
              id="gallery-description"
              rows={4}
              maxLength={DESCRIPTION_LIMIT}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="A short summary of the event this gallery covers."
              disabled={saving}
              className={`${inputClass()} resize-y py-3 leading-relaxed`}
            />
          </Field>
        </FormSection>

        <GalleryCoverField
          preview={previewUrl}
          fileName={coverFile?.name}
          disabled={saving}
          error={errors.cover_image}
          onSelect={handleCoverSelect}
          onRemove={handleCoverRemove}
        />

        <FormSection title="Visibility">
          <Switch
            label="Published"
            description={
              isPublished
                ? "Gallery will be visible on the public website"
                : "Gallery is saved as an internal working draft"
            }
            checked={isPublished}
            onChange={setIsPublished}
            disabled={saving}
          />
        </FormSection>
      </div>

      <ModalFooter>
        {/* What saving will do */}
        <p className="mr-auto flex items-center gap-2 text-[11px] font-semibold text-muted">
          <span
            className={`h-2 w-2 rounded-full ${
              isPublished ? "bg-brand-gradient" : "bg-amber-400"
            }`}
          />
          {isPublished ? "Will be published" : "Will be a draft"}
        </p>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className={buttonClass("secondary")}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className={buttonClass("primary")}
        >
          {saving ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Check size={16} strokeWidth={2.5} />
          )}
          {saving
            ? "Saving..."
            : isEdit
              ? "Save Changes"
              : "Create Gallery"}
        </button>
      </ModalFooter>
    </form>
  );
}
