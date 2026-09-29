"use client";

import { useEffect, useState } from "react";
import {
  FolderTree,
  Plus,
  Pencil,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

import {
  CourseCategory,
  CourseCategoryFormData,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/course-categories";

import {
  CourseBrand,
  getCourseBrands,
} from "@/lib/api/course-brands";

import CourseCategoryModal from "@/components/admin/CourseCategoryModal";

export default function MainCategoryPage() {
  const [brands, setBrands] = useState<CourseBrand[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);

  const [selectedBrandId, setSelectedBrandId] = useState("");

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] =
    useState<"create" | "edit">("create");

  const [selectedCategory, setSelectedCategory] =
    useState<CourseCategory | null>(null);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // --------------------------------------------------
  // Load brands
  // --------------------------------------------------

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getCourseBrands();

        const activeBrands = data.filter((brand) => brand.is_active);

        setBrands(activeBrands);

        if (activeBrands.length > 0) {
          setSelectedBrandId(activeBrands[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load course brands.");
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  // --------------------------------------------------
  // Load categories when brand changes
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedBrandId) {
      setCategories([]);
      return;
    }

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        setError(null);

        const data = await getCategories(selectedBrandId);

        setCategories(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load categories.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [selectedBrandId]);

  // --------------------------------------------------
  // Create
  // --------------------------------------------------

  const handleCreate = () => {
    setSelectedCategory(null);
    setModalMode("create");
    setModalOpen(true);
  };

  // --------------------------------------------------
  // Edit
  // --------------------------------------------------

  const handleEdit = (category: CourseCategory) => {
    setSelectedCategory(category);
    setModalMode("edit");
    setModalOpen(true);
    setActiveMenu(null);
  };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const handleSubmit = async (
    data: CourseCategoryFormData
  ) => {
    if (modalMode === "create") {
      const created = await createCategory(data);

      setCategories((prev) => [...prev, created]);

      setSelectedBrandId(data.brand_id);
    } else if (selectedCategory) {
      const updated = await updateCategory(
        selectedCategory.id,
        data
      );

      setCategories((prev) =>
        prev.map((category) =>
          category.id === updated.id
            ? updated
            : category
        )
      );
    }

    setModalOpen(false);
    setSelectedCategory(null);
  };

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const handleDelete = async (
    category: CourseCategory
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteCategory(category.id);

      setCategories((prev) =>
        prev.filter((item) => item.id !== category.id)
      );

      setActiveMenu(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete category.");
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <FolderTree className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-sm text-muted">
              Operations
            </p>

            <h1 className="text-2xl font-semibold text-text">
              Main Category
            </h1>

            <p className="mt-1 text-sm text-muted">
              Manage course categories for each brand.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={brands.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Brand selector */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium text-text">
              Select Brand
            </h2>

            <p className="mt-1 text-sm text-muted">
              Choose a brand to manage its main categories.
            </p>
          </div>

          <select
            value={selectedBrandId}
            onChange={(e) =>
              setSelectedBrandId(e.target.value)
            }
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none transition focus:border-primary sm:w-72"
          >
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">
              Categories
            </h2>

            <p className="text-sm text-muted">
              {categories.length}{" "}
              {categories.length === 1
                ? "category"
                : "categories"}
            </p>
          </div>
        </div>

        {categoriesLoading ? (
          <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-border bg-surface">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FolderTree className="h-5 w-5 text-primary" />
            </div>

            <h3 className="font-medium text-text">
              No categories found
            </h3>

            <p className="mt-1 max-w-md text-sm text-muted">
              This brand does not have any categories yet.
              Create the first category to get started.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group relative rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/40 hover:shadow-sm"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <FolderTree className="h-5 w-5 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-text">
                        {category.name}
                      </h3>

                      <p className="truncate text-xs text-muted">
                        {category.slug}
                      </p>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === category.id
                            ? null
                            : category.id
                        )
                      }
                      className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-text"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenu === category.id && (
                      <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-border bg-surface p-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(category)
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-background"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(category)
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10"
                        >
                          <XCircle className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="mt-4 min-h-[40px] text-sm leading-5 text-muted">
                  {category.description ||
                    "No description provided."}
                </p>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>Order</span>
                    <span className="font-medium text-text">
                      {category.display_order}
                    </span>
                  </div>

                  {category.is_active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-500">
                      <XCircle className="h-3.5 w-3.5" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <CourseCategoryModal
        open={modalOpen}
        mode={modalMode}
        category={selectedCategory}
        brands={brands}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}