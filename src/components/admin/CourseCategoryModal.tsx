"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type {
  CourseCategory,
  CourseCategoryFormData,
} from "@/lib/api/course-categories";

interface Brand {
  id: string;
  name: string;
}

interface CourseCategoryModalProps {
  open: boolean;
  mode: "create" | "edit";
  category: CourseCategory | null;
  brands: Brand[];
  onClose: () => void;
  onSubmit: (data: CourseCategoryFormData) => Promise<void>;
}

export default function CourseCategoryModal({
  open,
  mode,
  category,
  brands,
  onClose,
  onSubmit,
}: CourseCategoryModalProps) {
  const [brandId, setBrandId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [slugManuallyEdited, setSlugManuallyEdited] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    setError("");

    if (mode === "edit" && category) {
      setBrandId(category.brand_id);
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description ?? "");
      setIsActive(category.is_active);
      setDisplayOrder(category.display_order);
      setSlugManuallyEdited(true);
    } else {
      setBrandId(brands[0]?.id ?? "");
      setName("");
      setSlug("");
      setDescription("");
      setIsActive(true);
      setDisplayOrder(0);
      setSlugManuallyEdited(false);
    }
  }, [open, mode, category, brands]);

  if (!open) return null;

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (value: string) => {
    setName(value);

    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(generateSlug(value));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!brandId) {
      setError("Please select a brand.");
      return;
    }

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        brand_id: brandId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        is_active: isActive,
        display_order: displayOrder,
      });
    } catch (error) {
      console.error(
        "Failed to save category:",
        error
      );

      setError(
        "Failed to save category. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text">
              {mode === "create"
                ? "Add Category"
                : "Edit Category"}
            </h2>

            <p className="mt-0.5 text-xs text-muted">
              {mode === "create"
                ? "Create a new course category."
                : "Update this course category."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-text disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Brand */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Brand
            </label>

            <select
              value={brandId}
              onChange={(event) =>
                setBrandId(event.target.value)
              }
              disabled={loading}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text outline-none transition focus:border-primary disabled:opacity-60"
            >
              <option value="">
                Select brand
              </option>

              {brands.map((brand) => (
                <option
                  key={brand.id}
                  value={brand.id}
                >
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Category Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                handleNameChange(event.target.value)
              }
              placeholder="Academic Learning Pathways"
              disabled={loading}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text outline-none transition placeholder:text-muted/60 focus:border-primary disabled:opacity-60"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Slug
            </label>

            <input
              type="text"
              value={slug}
              onChange={(event) =>
                handleSlugChange(event.target.value)
              }
              placeholder="academic-learning-pathways"
              disabled={loading}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text outline-none transition placeholder:text-muted/60 focus:border-primary disabled:opacity-60"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe this category..."
              rows={3}
              disabled={loading}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none transition placeholder:text-muted/60 focus:border-primary disabled:opacity-60"
            />
          </div>

          {/* Display order + active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Display Order
              </label>

              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(event) =>
                  setDisplayOrder(
                    Number(event.target.value)
                  )
                }
                disabled={loading}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text outline-none transition focus:border-primary disabled:opacity-60"
              />
            </div>

            <div className="flex items-end">
              <label className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) =>
                    setIsActive(event.target.checked)
                  }
                  disabled={loading}
                  className="h-4 w-4 accent-primary"
                />

                <span className="text-sm font-medium text-text">
                  Active
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-text transition hover:bg-background disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create Category"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}