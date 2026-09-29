"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import {
  CourseSubcategory,
  CourseSubcategoryFormData,
} from "@/lib/api/course-subcategories";

interface Category {
  id: string;
  brand_id: string;
  name: string;
}

interface CourseSubCategoryModalProps {
  open: boolean;
  mode: "create" | "edit";
  subcategory: CourseSubcategory | null;
  categories: Category[];
  selectedCategoryId?: string;
  onClose: () => void;
  onSubmit: (
    data: CourseSubcategoryFormData
  ) => Promise<void>;
}

export default function CourseSubCategoryModal({
  open,
  mode,
  subcategory,
  categories,
  selectedCategoryId,
  onClose,
  onSubmit,
}: CourseSubCategoryModalProps) {
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    setError(null);

    if (mode === "edit" && subcategory) {
      setCategoryId(subcategory.category_id);
      setName(subcategory.name);
      setSlug(subcategory.slug);
      setDescription(subcategory.description ?? "");
      setIsActive(subcategory.is_active);
      setDisplayOrder(subcategory.display_order);
      setSlugManuallyEdited(true);
    } else {
      setCategoryId(
        selectedCategoryId ||
          categories[0]?.id ||
          ""
      );
      setName("");
      setSlug("");
      setDescription("");
      setIsActive(true);
      setDisplayOrder(0);
      setSlugManuallyEdited(false);
    }
  }, [
    open,
    mode,
    subcategory,
    categories,
    selectedCategoryId,
  ]);

  const handleNameChange = (value: string) => {
    setName(value);

    if (!slugManuallyEdited) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!categoryId) {
      setError("Please select a category.");
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
      setError(null);

      await onSubmit({
        category_id: categoryId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        is_active: isActive,
        display_order: displayOrder,
      });
    } catch (err) {
      console.error(err);
      setError(
        "Failed to save sub category. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text">
              {mode === "create"
                ? "Add Sub Category"
                : "Edit Sub Category"}
            </h2>

            <p className="mt-1 text-sm text-muted">
              {mode === "create"
                ? "Create a new course sub category."
                : "Update the sub category details."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Main Category
            </label>

            <select
              value={categoryId}
              onChange={(e) =>
                setCategoryId(e.target.value)
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">
                Select category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Sub Category Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                handleNameChange(e.target.value)
              }
              placeholder="Enter sub category name"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Slug
            </label>

            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              placeholder="sub-category-slug"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={3}
              placeholder="Enter description"
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
            />
          </div>

          {/* Display order */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Display Order
            </label>

            <input
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) =>
                setDisplayOrder(
                  Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          {/* Active */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                setIsActive(e.target.checked)
              }
              className="h-4 w-4 rounded border-border accent-primary"
            />

            <span className="text-sm text-text">
              Active
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text transition hover:bg-background disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create Sub Category"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}