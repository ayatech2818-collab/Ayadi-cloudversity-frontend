"use client";

import { useState } from "react";
import {
  Check,
  FolderPen,
  FolderPlus,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import Alert from "@/components/admin/ui/Alert";
import Field from "@/components/admin/ui/Field";
import Modal, {
  ModalFooter,
  ModalHeader,
} from "@/components/admin/ui/Modal";
import Select from "@/components/admin/ui/Select";
import SlugInput, {
  generateSlug,
} from "@/components/admin/ui/SlugInput";
import Switch from "@/components/admin/ui/Switch";
import {
  buttonClass,
  inputClass,
} from "@/components/admin/ui/styles";
import { getApiErrorMessage } from "@/lib/api/errors";

import { cleanSlug } from "./category-utils";

/** What the form hands back. `parentId` is the brand, or the main category. */
export interface CategoryFormValues {
  parentId: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

interface CategoryFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  /** What is being saved, as shown in titles: "Category", "Sub Category". */
  noun: string;
  /** The level it sits under, as a field label: "Brand", "Main category". */
  parentLabel: string;
  parents: { id: string; name: string }[];
  /** The values being edited; `null` for a new one. */
  initial: (CategoryFormValues & { id: string }) | null;
  /** The parent a new one starts under — the one being viewed. */
  defaultParentId: string;
  namePlaceholder: string;
  slugPlaceholder: string;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

/**
 * The add / edit form shared by main categories and sub categories: they have
 * the same fields and differ only in what they belong to. `CategoryModal` and
 * `SubcategoryModal` are the two thin wrappers the pages actually use.
 */
export default function CategoryFormModal({
  open,
  ...form
}: CategoryFormModalProps) {
  const [saving, setSaving] = useState(false);

  return (
    <Modal
      open={open}
      busy={saving}
      onClose={form.onClose}
      labelledBy="category-modal-title"
    >
      {/* Mounted per open, so the fields always start from these values. */}
      <CategoryForm
        key={`${form.mode}:${form.initial?.id ?? "new"}`}
        {...form}
        saving={saving}
        onSavingChange={setSaving}
      />
    </Modal>
  );
}

interface CategoryFormProps
  extends Omit<CategoryFormModalProps, "open"> {
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
}

type FieldName = "parent" | "name" | "slug" | "order";

function CategoryForm({
  mode,
  noun,
  parentLabel,
  parents,
  initial,
  defaultParentId,
  namePlaceholder,
  slugPlaceholder,
  saving,
  onSavingChange,
  onClose,
  onSubmit,
}: CategoryFormProps) {
  const isEdit = mode === "edit";
  const nounLower = noun.toLowerCase();

  const [parentId, setParentId] = useState(
    initial?.parentId ?? defaultParentId
  );
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");

  // A new one takes its slug from the name until the slug is typed by hand.
  const [slugEdited, setSlugEdited] = useState(isEdit);

  const [description, setDescription] = useState(
    initial?.description ?? ""
  );

  // Kept as text so the box can be cleared while typing a new number.
  const [displayOrder, setDisplayOrder] = useState(
    String(initial?.display_order ?? 0)
  );
  const [isActive, setIsActive] = useState(
    initial?.is_active ?? true
  );

  const [errors, setErrors] = useState<
    Partial<Record<FieldName, string>>
  >({});
  const [formError, setFormError] = useState("");

  const clearError = (field: FieldName) =>
    setErrors((current) => ({ ...current, [field]: undefined }));

  const handleNameChange = (value: string) => {
    setName(value);
    clearError("name");

    if (!slugEdited) {
      setSlug(generateSlug(value));
      clearError("slug");
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setSlug(cleanSlug(value));
    clearError("slug");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // Guards against a double submit from a fast second click.
    if (saving) return;

    const order = Number(displayOrder || 0);

    const nextErrors: typeof errors = {};

    if (!parentId) {
      nextErrors.parent = `Please select a ${parentLabel.toLowerCase()}.`;
    }

    if (!name.trim()) {
      nextErrors.name = `${noun} name is required.`;
    }

    if (!slug.trim()) {
      nextErrors.slug = "Slug is required.";
    }

    if (!Number.isInteger(order) || order < 0) {
      nextErrors.order = "Use a whole number, 0 or more.";
    }

    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) return;

    try {
      onSavingChange(true);

      // The page closes the modal once the request succeeds.
      await onSubmit({
        parentId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        is_active: isActive,
        display_order: order,
      });
    } catch (error) {
      console.error(`Failed to save ${nounLower}:`, error);

      setFormError(
        getApiErrorMessage(
          error,
          `Failed to save ${nounLower}. Please try again.`
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
        id="category-modal-title"
        icon={isEdit ? FolderPen : FolderPlus}
        title={`${isEdit ? "Edit" : "Add"} ${noun}`}
        description={
          isEdit
            ? `Update this course ${nounLower}.`
            : `Create a new course ${nounLower}.`
        }
        onClose={onClose}
        disabled={saving}
      />

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {formError && <Alert>{formError}</Alert>}

        <Field
          label={parentLabel}
          htmlFor="category-parent"
          required
          error={errors.parent}
        >
          <Select
            id="category-parent"
            value={parentId}
            disabled={saving}
            onChange={(event) => {
              setParentId(event.target.value);
              clearError("parent");
            }}
          >
            <option value="">
              Select {parentLabel.toLowerCase()}
            </option>

            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={`${noun} name`}
          htmlFor="category-name"
          required
          error={errors.name}
        >
          <input
            id="category-name"
            type="text"
            data-autofocus
            value={name}
            onChange={(event) =>
              handleNameChange(event.target.value)
            }
            placeholder={namePlaceholder}
            disabled={saving}
            aria-invalid={Boolean(errors.name)}
            className={`${inputClass(Boolean(errors.name))} h-11`}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="category-slug"
          required
          aside={
            !slugEdited && (
              <span className="inline-flex items-center gap-1 font-medium text-primary">
                <Sparkles size={11} />
                Auto-generating
              </span>
            )
          }
          error={errors.slug}
        >
          <SlugInput
            id="category-slug"
            value={slug}
            onChange={handleSlugChange}
            placeholder={slugPlaceholder}
            invalid={Boolean(errors.slug)}
            disabled={saving}
          />
        </Field>

        <Field label="Description" htmlFor="category-description">
          <textarea
            id="category-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={`Describe this ${nounLower}...`}
            disabled={saving}
            className={`${inputClass()} resize-none py-3 leading-6`}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Display order"
            htmlFor="category-order"
            error={errors.order}
          >
            <input
              id="category-order"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={displayOrder}
              onChange={(event) => {
                setDisplayOrder(event.target.value);
                clearError("order");
              }}
              disabled={saving}
              aria-invalid={Boolean(errors.order)}
              className={`${inputClass(Boolean(errors.order))} h-11`}
            />
          </Field>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-text">
              Status
            </p>

            <Switch
              label="Active"
              checked={isActive}
              onChange={setIsActive}
              disabled={saving}
            />
          </div>
        </div>
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
              : `Create ${noun}`}
        </button>
      </ModalFooter>
    </form>
  );
}
