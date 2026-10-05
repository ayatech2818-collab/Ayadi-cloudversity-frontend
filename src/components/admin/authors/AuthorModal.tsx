"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CircleAlert,
  Link2,
  LoaderCircle,
  UserRoundPen,
  UserRoundPlus,
} from "lucide-react";

import Field from "@/components/admin/ui/Field";
import Modal, {
  ModalFooter,
  ModalHeader,
} from "@/components/admin/ui/Modal";
import {
  buttonClass,
  inputClass,
} from "@/components/admin/ui/styles";
import type { Author } from "@/lib/api/authors";
import { getApiErrorMessage } from "@/lib/api/errors";

import AuthorPhotoField from "./AuthorPhotoField";
import {
  AUTHOR_PHOTO_LABEL,
  isAllowedAuthorPhoto,
  isValidUrl,
  normalizeUrl,
} from "./author-utils";

type AuthorModalMode = "create" | "edit";

interface AuthorModalProps {
  open: boolean;
  mode: AuthorModalMode;
  author?: Author | null;
  onClose: () => void;
  onSubmit: (
    data: FormData,
    mode: AuthorModalMode,
    authorId?: string
  ) => Promise<void>;
}

export default function AuthorModal({
  open,
  ...form
}: AuthorModalProps) {
  const [saving, setSaving] = useState(false);

  return (
    <Modal
      open={open}
      busy={saving}
      onClose={form.onClose}
      labelledBy="author-modal-title"
    >
      {/* Mounted per open, so the fields always start from this author. */}
      <AuthorForm
        key={`${form.mode}:${form.author?.id ?? "new"}`}
        {...form}
        saving={saving}
        onSavingChange={setSaving}
      />
    </Modal>
  );
}

interface AuthorFormProps extends Omit<AuthorModalProps, "open"> {
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
}

type FieldName = "name" | "designation" | "bio" | "linkedin";

function AuthorForm({
  mode,
  author,
  saving,
  onSavingChange,
  onClose,
  onSubmit,
}: AuthorFormProps) {
  const isEdit = mode === "edit";

  const [values, setValues] = useState<Record<FieldName, string>>({
    name: author?.name ?? "",
    designation: author?.designation ?? "",
    bio: author?.bio ?? "",
    linkedin: author?.linkedin_url ?? "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    null
  );

  const [errors, setErrors] = useState<
    Partial<Record<FieldName | "photo", string>>
  >({});
  const [formError, setFormError] = useState("");

  // Revokes the outgoing object URL whenever the pick changes or the form
  // unmounts — the one place a leak could happen.
  useEffect(() => {
    if (!photoPreview) return;

    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const handleChange =
    (field: FieldName) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    };

  const handlePhotoSelect = (file: File) => {
    if (!isAllowedAuthorPhoto(file)) {
      setErrors((current) => ({
        ...current,
        photo: `The photo must be a ${AUTHOR_PHOTO_LABEL} image.`,
      }));

      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, photo: undefined }));
  };

  const handlePhotoClear = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // Guards against a double submit from a fast second click.
    if (saving) return;

    const name = values.name.trim();
    const designation = values.designation.trim();
    const bio = values.bio.trim();
    const linkedin = normalizeUrl(values.linkedin);

    const nextErrors: typeof errors = {};

    if (!name) {
      nextErrors.name = "Author name is required.";
    }

    if (linkedin && !isValidUrl(linkedin)) {
      nextErrors.linkedin =
        "Enter a valid link, e.g. https://linkedin.com/in/username";
    }

    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData();

    formData.append("name", name);

    if (designation) formData.append("designation", designation);
    if (bio) formData.append("bio", bio);
    if (linkedin) formData.append("linkedin_url", linkedin);
    if (photo) formData.append("profile_image", photo);

    try {
      onSavingChange(true);

      // The page closes the modal once the request succeeds.
      await onSubmit(
        formData,
        mode,
        isEdit ? author?.id : undefined
      );
    } catch (error) {
      console.error("Failed to save author:", error);

      setFormError(
        getApiErrorMessage(
          error,
          "Something went wrong while saving the author."
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
        id="author-modal-title"
        icon={isEdit ? UserRoundPen : UserRoundPlus}
        title={isEdit ? "Edit Author" : "Add Author"}
        description={
          isEdit
            ? "Update this author's profile details."
            : "Add someone who writes for your blog."
        }
        onClose={onClose}
        disabled={saving}
      />

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs font-medium leading-relaxed text-rose-700 ring-1 ring-inset ring-rose-200"
          >
            <CircleAlert
              size={16}
              className="mt-px shrink-0 text-rose-600"
            />
            {formError}
          </div>
        )}

        <AuthorPhotoField
          name={values.name}
          preview={photoPreview ?? author?.profile_image ?? null}
          fileName={photo?.name}
          clearLabel={
            author?.profile_image ? "Keep current photo" : "Remove"
          }
          disabled={saving}
          error={errors.photo}
          onSelect={handlePhotoSelect}
          onClear={handlePhotoClear}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Name"
            htmlFor="author-name"
            required
            error={errors.name}
          >
            <input
              id="author-name"
              type="text"
              autoFocus
              value={values.name}
              onChange={handleChange("name")}
              placeholder="e.g. Adil Shinas"
              disabled={saving}
              aria-invalid={Boolean(errors.name)}
              className={`${inputClass(Boolean(errors.name))} h-11`}
            />
          </Field>

          <Field label="Designation" htmlFor="author-designation">
            <input
              id="author-designation"
              type="text"
              value={values.designation}
              onChange={handleChange("designation")}
              placeholder="e.g. Founder & CEO"
              disabled={saving}
              className={`${inputClass()} h-11`}
            />
          </Field>
        </div>

        <Field
          label="Bio"
          htmlFor="author-bio"
          hint="Two or three sentences work best."
        >
          <textarea
            id="author-bio"
            rows={4}
            value={values.bio}
            onChange={handleChange("bio")}
            placeholder="Write a short author bio..."
            disabled={saving}
            className={`${inputClass()} resize-none py-3 leading-6`}
          />
        </Field>

        <Field
          label="LinkedIn"
          htmlFor="author-linkedin"
          error={errors.linkedin}
        >
          <div className="relative">
            <Link2
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              id="author-linkedin"
              type="url"
              inputMode="url"
              value={values.linkedin}
              onChange={handleChange("linkedin")}
              placeholder="https://linkedin.com/in/username"
              disabled={saving}
              aria-invalid={Boolean(errors.linkedin)}
              className={`${inputClass(Boolean(errors.linkedin))} h-11 pl-10`}
            />
          </div>
        </Field>
      </div>

      <ModalFooter>
        <p className="mr-auto hidden text-[11px] text-muted sm:block">
          <span className="text-rose-500">*</span> Required
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
              : "Add Author"}
        </button>
      </ModalFooter>
    </form>
  );
}
