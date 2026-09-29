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
  getCategories,
} from "@/lib/api/course-categories";

import {
  CourseSubcategory,
  CourseSubcategoryFormData,
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "@/lib/api/course-subcategories";

import {
  CourseBrand,
  getCourseBrands,
} from "@/lib/api/course-brands";

import CourseSubCategoryModal from "@/components/admin/CourseSubCategoryModal";

export default function SubCategoryPage() {
  const [brands, setBrands] = useState<CourseBrand[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>(
    []
  );
  const [subcategories, setSubcategories] = useState<
    CourseSubcategory[]
  >([]);

  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(false);
  const [subcategoriesLoading, setSubcategoriesLoading] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] =
    useState<"create" | "edit">("create");

  const [selectedSubcategory, setSelectedSubcategory] =
    useState<CourseSubcategory | null>(null);

  const [activeMenu, setActiveMenu] = useState<string | null>(
    null
  );

  // --------------------------------------------------
  // Load brands
  // --------------------------------------------------

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getCourseBrands();

        const activeBrands = data.filter(
          (brand) => brand.is_active
        );

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
      setSelectedCategoryId("");
      return;
    }

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        setError(null);

        const data = await getCategories(selectedBrandId);

        setCategories(data);

        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        } else {
          setSelectedCategoryId("");
        }
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
  // Load subcategories when category changes
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedCategoryId) {
      setSubcategories([]);
      return;
    }

    const loadSubcategories = async () => {
      try {
        setSubcategoriesLoading(true);
        setError(null);

        const data = await getSubcategories(
          selectedCategoryId
        );

        setSubcategories(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load sub categories.");
      } finally {
        setSubcategoriesLoading(false);
      }
    };

    loadSubcategories();
  }, [selectedCategoryId]);

  // --------------------------------------------------
  // Create
  // --------------------------------------------------

  const handleCreate = () => {
    setSelectedSubcategory(null);
    setModalMode("create");
    setModalOpen(true);
  };

  // --------------------------------------------------
  // Edit
  // --------------------------------------------------

  const handleEdit = (
    subcategory: CourseSubcategory
  ) => {
    setSelectedSubcategory(subcategory);
    setModalMode("edit");
    setModalOpen(true);
    setActiveMenu(null);
  };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const handleSubmit = async (
    data: CourseSubcategoryFormData
  ) => {
    if (modalMode === "create") {
      const created = await createSubcategory(data);

      // If the modal allows another category to be selected,
      // switch to that category first.
      if (data.category_id !== selectedCategoryId) {
        setSelectedCategoryId(data.category_id);
      } else {
        setSubcategories((prev) => [...prev, created]);
      }
    } else if (selectedSubcategory) {
      const updated = await updateSubcategory(
        selectedSubcategory.id,
        data
      );

      // If category changed while editing,
      // reload the selected category's list.
      if (
        data.category_id !== selectedCategoryId
      ) {
        setSelectedCategoryId(data.category_id);
      } else {
        setSubcategories((prev) =>
          prev.map((item) =>
            item.id === updated.id
              ? updated
              : item
          )
        );
      }
    }

    setModalOpen(false);
    setSelectedSubcategory(null);
  };

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const handleDelete = async (
    subcategory: CourseSubcategory
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subcategory.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteSubcategory(subcategory.id);

      setSubcategories((prev) =>
        prev.filter(
          (item) => item.id !== subcategory.id
        )
      );

      setActiveMenu(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete sub category.");
    }
  };

  // --------------------------------------------------
  // Initial loading
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
              Sub Category
            </h1>

            <p className="mt-1 text-sm text-muted">
              Manage sub categories under each main category.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={!selectedCategoryId}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Sub Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Brand */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Brand
            </label>

            <select
              value={selectedBrandId}
              onChange={(e) =>
                setSelectedBrandId(e.target.value)
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none transition focus:border-primary"
            >
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
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Main Category
            </label>

            <select
              value={selectedCategoryId}
              onChange={(e) =>
                setSelectedCategoryId(e.target.value)
              }
              disabled={
                categoriesLoading ||
                categories.length === 0
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {categories.length === 0 ? (
                <option value="">
                  No categories available
                </option>
              ) : (
                categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Subcategories */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">
              Sub Categories
            </h2>

            <p className="text-sm text-muted">
              {subcategories.length}{" "}
              {subcategories.length === 1
                ? "sub category"
                : "sub categories"}
            </p>
          </div>
        </div>

        {subcategoriesLoading ? (
          <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-border bg-surface">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !selectedCategoryId ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 text-center">
            <FolderTree className="mb-4 h-10 w-10 text-muted" />

            <h3 className="font-medium text-text">
              No main category selected
            </h3>

            <p className="mt-1 text-sm text-muted">
              Select a brand with categories to manage
              sub categories.
            </p>
          </div>
        ) : subcategories.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FolderTree className="h-5 w-5 text-primary" />
            </div>

            <h3 className="font-medium text-text">
              No sub categories found
            </h3>

            <p className="mt-1 max-w-md text-sm text-muted">
              This category does not have any sub
              categories yet.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Add Sub Category
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subcategories.map((subcategory) => (
              <div
                key={subcategory.id}
                className="relative rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/40 hover:shadow-sm"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <FolderTree className="h-5 w-5 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-text">
                        {subcategory.name}
                      </h3>

                      <p className="truncate text-xs text-muted">
                        {subcategory.slug}
                      </p>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === subcategory.id
                            ? null
                            : subcategory.id
                        )
                      }
                      className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-text"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenu ===
                      subcategory.id && (
                      <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-border bg-surface p-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(subcategory)
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-background"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(subcategory)
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
                  {subcategory.description ||
                    "No description provided."}
                </p>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>Order</span>

                    <span className="font-medium text-text">
                      {subcategory.display_order}
                    </span>
                  </div>

                  {subcategory.is_active ? (
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
      <CourseSubCategoryModal
        open={modalOpen}
        mode={modalMode}
        subcategory={selectedSubcategory}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onClose={() => {
          setModalOpen(false);
          setSelectedSubcategory(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}