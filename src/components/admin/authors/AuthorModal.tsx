"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Link2,
  LoaderCircle,
  UserRoundPen,
  UserRoundPlus,
} from "lucide-react";

import Alert from "@/components/admin/ui/Alert";
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

      <div className="flex-1 space-y-3.5 overflow-y-auto p-3.5 min-[360px]:space-y-4 min-[360px]:p-4 sm:space-y-5 sm:p-6">
        {formError && <Alert>{formError}</Alert>}

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

        <div className="grid gap-3.5 min-[360px]:gap-4 sm:gap-5 sm:grid-cols-2">
          <Field
            label="Name"
            htmlFor="author-name"
            required
            error={errors.name}
          >
            <input
              id="author-name"
              type="text"
              data-autofocus
              value={values.name}
              onChange={handleChange("name")}
              placeholder="e.g. Adil Shinas"
              disabled={saving}
              aria-invalid={Boolean(errors.name)}
              className={`${inputClass(Boolean(errors.name))} h-9 text-xs min-[360px]:h-9.5 sm:h-11 sm:text-sm`}
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
              className={`${inputClass()} h-9 text-xs min-[360px]:h-9.5 sm:h-11 sm:text-sm`}
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
            rows={3}
            value={values.bio}
            onChange={handleChange("bio")}
            placeholder="Write a short author bio..."
            disabled={saving}
            className={`${inputClass()} resize-none py-2 text-xs leading-5 min-[360px]:py-2.5 sm:rows-4 sm:py-3 sm:text-sm sm:leading-6`}
          />
        </Field>

        <Field
          label="LinkedIn"
          htmlFor="author-linkedin"
          error={errors.linkedin}
        >
          <div className="relative">
            <Link2
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted h-3.5 w-3.5 min-[360px]:left-3.5 min-[360px]:h-4 min-[360px]:w-4"
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
              className={`${inputClass(Boolean(errors.linkedin))} h-9 pl-8.5 text-xs min-[360px]:h-9.5 min-[360px]:pl-9 sm:h-11 sm:pl-10 sm:text-sm`}
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
          className={`${buttonClass("secondary", "sm")} h-8.5 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm`}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className={`${buttonClass("primary", "sm")} h-8.5 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm`}
        >
          {saving ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
          ) : (
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
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
