"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";

import {
  Course,
  CourseFormData,
} from "@/lib/api/courses";

import {
  CourseBrand,
} from "@/lib/api/course-brands";

import {
  CourseCategory,
} from "@/lib/api/course-categories";

import {
  CourseSubcategory,
} from "@/lib/api/course-subcategories";

interface CourseModalProps {
  open: boolean;
  mode: "create" | "edit";
  course: Course | null;

  brands: CourseBrand[];
  categories: CourseCategory[];
  subcategories: CourseSubcategory[];

  onBrandChange: (brandId: string) => Promise<void>;
  onCategoryChange: (categoryId: string) => Promise<void>;

  onClose: () => void;
  onSubmit: (data: CourseFormData) => Promise<void>;
}

export default function CourseModal({
  open,
  mode,
  course,
  brands,
  categories,
  subcategories,
  onBrandChange,
  onCategoryChange,
  onClose,
  onSubmit,
}: CourseModalProps) {
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] =
    useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [courseCode, setCourseCode] = useState("");

  const [shortDescription, setShortDescription] =
    useState("");
  const [description, setDescription] = useState("");

  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");

  const [price, setPrice] = useState("");

  const [displayOrder, setDisplayOrder] =
    useState(0);

  const [isActive, setIsActive] =
    useState(true);

  const [thumbnail, setThumbnail] =
    useState<File | null>(null);

  const [thumbnailPreview, setThumbnailPreview] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingBrand, setLoadingBrand] =
    useState(false);
  const [loadingCategory, setLoadingCategory] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [slugManuallyEdited, setSlugManuallyEdited] =
    useState(false);

  // --------------------------------------------------
  // Populate form
  // --------------------------------------------------

  useEffect(() => {
    if (!open) return;

    setError(null);

    if (mode === "edit" && course) {
      setBrandId(course.brand_id);
      setCategoryId(course.category_id ?? "");
      setSubcategoryId(
        course.subcategory_id ?? ""
      );

      setName(course.name);
      setSlug(course.slug);
      setCourseCode(course.course_code);

      setShortDescription(
        course.short_description ?? ""
      );

      setDescription(course.description ?? "");

      setDuration(course.duration ?? "");
      setLevel(course.level ?? "");

      setPrice(
        course.price !== null &&
          course.price !== undefined
          ? String(course.price)
          : ""
      );

      setDisplayOrder(course.display_order);
      setIsActive(course.is_active);

      setThumbnail(null);
      setThumbnailPreview(
        course.thumbnail_url ?? null
      );

      setSlugManuallyEdited(true);
    } else {
      setBrandId(brands[0]?.id ?? "");
      setCategoryId("");
      setSubcategoryId("");

      setName("");
      setSlug("");
      setCourseCode("");

      setShortDescription("");
      setDescription("");

      setDuration("");
      setLevel("");

      setPrice("");

      setDisplayOrder(0);
      setIsActive(true);

      setThumbnail(null);
      setThumbnailPreview(null);

      setSlugManuallyEdited(false);
    }
  }, [
    open,
    mode,
    course,
    brands,
  ]);

  // --------------------------------------------------
  // Slug
  // --------------------------------------------------

  const handleNameChange = (
    value: string
  ) => {
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

  // --------------------------------------------------
  // Brand
  // --------------------------------------------------

  const handleBrandChange = async (
    value: string
  ) => {
    setBrandId(value);

    setCategoryId("");
    setSubcategoryId("");

    try {
      setLoadingBrand(true);
      await onBrandChange(value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBrand(false);
    }
  };

  // --------------------------------------------------
  // Category
  // --------------------------------------------------

  const handleCategoryChange = async (
    value: string
  ) => {
    setCategoryId(value);
    setSubcategoryId("");

    if (!value) return;

    try {
      setLoadingCategory(true);
      await onCategoryChange(value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCategory(false);
    }
  };

  // --------------------------------------------------
  // Thumbnail
  // --------------------------------------------------

  const handleThumbnailChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setThumbnail(file);

    const previewUrl =
      URL.createObjectURL(file);

    setThumbnailPreview(previewUrl);
  };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!brandId) {
      setError("Please select a brand.");
      return;
    }

    if (!name.trim()) {
      setError("Course name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }

    if (!courseCode.trim()) {
      setError("Course code is required.");
      return;
    }

    /*
     * If the selected brand has categories,
     * category is required.
     */
    if (
      categories.length > 0 &&
      !categoryId
    ) {
      setError("Please select a main category.");
      return;
    }

    /*
     * If the selected category has subcategories,
     * subcategory is required.
     */
    if (
      categoryId &&
      subcategories.length > 0 &&
      !subcategoryId
    ) {
      setError("Please select a sub category.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onSubmit({
        brand_id: brandId,

        category_id:
          categoryId || null,

        subcategory_id:
          subcategoryId || null,

        name: name.trim(),
        slug: slug.trim(),
        course_code: courseCode.trim(),

        short_description:
          shortDescription.trim() || null,

        description:
          description.trim() || null,

        duration:
          duration.trim() || null,

        level:
          level.trim() || null,

        price:
          price.trim()
            ? Number(price)
            : null,

        is_active: isActive,

        display_order: displayOrder,

        thumbnail,
      });
    } catch (err) {
      console.error(err);

      setError(
        "Failed to save course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text">
              {mode === "create"
                ? "Add Course"
                : "Edit Course"}
            </h2>

            <p className="mt-1 text-sm text-muted">
              {mode === "create"
                ? "Create a new course."
                : "Update course details."}
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

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {/* ---------------------------------------- */}
          {/* Structure */}
          {/* ---------------------------------------- */}

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              Course Structure
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Brand */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Brand
                </label>

                <select
                  value={brandId}
                  onChange={(e) =>
                    handleBrandChange(
                      e.target.value
                    )
                  }
                  disabled={loadingBrand}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary disabled:opacity-50"
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

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">
                    Main Category
                  </label>

                  <select
                    value={categoryId}
                    onChange={(e) =>
                      handleCategoryChange(
                        e.target.value
                      )
                    }
                    disabled={
                      loadingCategory
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {/* Subcategory */}
              {categoryId &&
                subcategories.length > 0 && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Sub Category
                    </label>

                    <select
                      value={subcategoryId}
                      onChange={(e) =>
                        setSubcategoryId(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
                    >
                      <option value="">
                        Select sub category
                      </option>

                      {subcategories.map(
                        (subcategory) => (
                          <option
                            key={
                              subcategory.id
                            }
                            value={
                              subcategory.id
                            }
                          >
                            {subcategory.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}
            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* Basic Information */}
          {/* ---------------------------------------- */}

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              Basic Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-text">
                  Course Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    handleNameChange(
                      e.target.value
                    )
                  }
                  placeholder="Enter course name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
                />
              </div>

              {/* Course Code */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Course Code
                </label>

                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) =>
                    setCourseCode(
                      e.target.value
                    )
                  }
                  placeholder="e.g. AC-PY-001"
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
                    setSlugManuallyEdited(
                      true
                    );
                  }}
                  placeholder="course-slug"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
                />
              </div>

              {/* Short Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-text">
                  Short Description
                </label>

                <textarea
                  value={shortDescription}
                  onChange={(e) =>
                    setShortDescription(
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Short course description"
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-text">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={6}
                  placeholder="Full course description"
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* Course Details */}
          {/* ---------------------------------------- */}

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              Course Details
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Duration */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Duration
                </label>

                <input
                  type="text"
                  value={duration}
                  onChange={(e) =>
                    setDuration(
                      e.target.value
                    )
                  }
                  placeholder="e.g. 6 Months"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
                />
              </div>

              {/* Level */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Level
                </label>

                <select
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value)
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
                >
                  <option value="">
                    Select level
                  </option>
                  <option value="Beginner">
                    Beginner
                  </option>
                  <option value="Intermediate">
                    Intermediate
                  </option>
                  <option value="Advanced">
                    Advanced
                  </option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Price
                </label>

                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                  placeholder="0"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* Thumbnail */}
          {/* ---------------------------------------- */}

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              Course Thumbnail
            </h3>

            <label className="block cursor-pointer">
              <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-background">
                {thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Course thumbnail preview"
                      className="h-48 w-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                      <span className="flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-black">
                        <Upload className="h-4 w-4" />
                        Change Image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <ImageIcon className="mb-3 h-8 w-8 text-muted" />

                    <p className="text-sm font-medium text-text">
                      Upload course thumbnail
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      PNG, JPG or WebP
                    </p>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleThumbnailChange
                }
                className="hidden"
              />
            </label>
          </div>

          {/* ---------------------------------------- */}
          {/* Settings */}
          {/* ---------------------------------------- */}

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              Settings
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
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

              <label className="flex cursor-pointer items-center gap-3 self-end pb-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) =>
                    setIsActive(
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-border accent-primary"
                />

                <span className="text-sm text-text">
                  Active
                </span>
              </label>
            </div>
          </div>

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
                  ? "Create Course"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}