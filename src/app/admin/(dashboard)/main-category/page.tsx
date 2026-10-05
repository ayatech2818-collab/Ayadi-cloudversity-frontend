"use client";

import { useEffect, useMemo, useState } from "react";

import CategoriesEmptyState from "@/components/admin/categories/CategoriesEmptyState";
import CategoriesHeader from "@/components/admin/categories/CategoriesHeader";
import CategoriesSkeleton from "@/components/admin/categories/CategoriesSkeleton";
import CategoryCard from "@/components/admin/categories/CategoryCard";
import CategoryDeleteDialog from "@/components/admin/categories/CategoryDeleteDialog";
import CategoryFilters from "@/components/admin/categories/CategoryFilters";
import CategoryModal from "@/components/admin/categories/CategoryModal";
import {
  CATEGORIES_GRID,
  filterCategories,
  sortCategories,
} from "@/components/admin/categories/category-utils";
import { Toaster, useToasts } from "@/components/admin/ui/Toast";

import {
  getCourseBrands,
  type CourseBrand,
} from "@/lib/api/course-brands";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type CourseCategory,
  type CourseCategoryFormData,
} from "@/lib/api/course-categories";
import { getApiErrorMessage } from "@/lib/api/errors";

interface CategoryEditor {
  mode: "create" | "edit";
  category: CourseCategory | null;
}

export default function MainCategoryPage() {
  const { toasts, toastSuccess, toastError, dismissToast } =
    useToasts();

  // =========================================================
  // DATA
  // =========================================================

  const [brands, setBrands] = useState<CourseBrand[]>([]);

  // Every active brand's categories; the brand tabs only choose what to show.
  const [categories, setCategories] = useState<CourseCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bumped by "Retry" to run the same requests again.
  const [reloadToken, setReloadToken] = useState(0);

  // =========================================================
  // FILTERS
  // =========================================================

  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [search, setSearch] = useState("");

  // =========================================================
  // UI
  // =========================================================

  const [editor, setEditor] = useState<CategoryEditor | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<CourseCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  // =========================================================
  // FETCH
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const activeBrands = (await getCourseBrands()).filter(
          (brand) => brand.is_active
        );

        // One request per brand, the way the rest of the app asks for
        // categories. Having them all is what lets the header count across
        // brands and makes switching brand instant.
        const lists = await Promise.all(
          activeBrands.map((brand) => getCategories(brand.id))
        );

        if (cancelled) return;

        setBrands(activeBrands);
        setCategories(lists.flat());
        setError(null);

        // Keeps the brand being viewed across a retry; otherwise the first.
        setSelectedBrandId((current) =>
          activeBrands.some((brand) => brand.id === current)
            ? current
            : (activeBrands[0]?.id ?? "")
        );
      } catch (loadError) {
        if (cancelled) return;

        console.error("Failed to fetch categories:", loadError);

        setError(
          getApiErrorMessage(
            loadError,
            "Something went wrong while fetching the categories."
          )
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const retry = () => {
    setLoading(true);
    setReloadToken((token) => token + 1);
  };

  // =========================================================
  // WHAT IS ON SCREEN
  // =========================================================

  const selectedBrand = brands.find(
    (brand) => brand.id === selectedBrandId
  );

  const brandOptions = useMemo(
    () =>
      brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
        count: categories.filter(
          (category) => category.brand_id === brand.id
        ).length,
      })),
    [brands, categories]
  );

  const visibleCategories = useMemo(
    () =>
      filterCategories(
        sortCategories(
          categories.filter(
            (category) => category.brand_id === selectedBrandId
          )
        ),
        search
      ),
    [categories, selectedBrandId, search]
  );

  // =========================================================
  // CREATE / EDIT
  // =========================================================

  const openCreate = () =>
    setEditor({ mode: "create", category: null });

  const closeEditor = () => setEditor(null);

  /**
   * Errors are left to throw so the modal can show them inline and keep the
   * form open with the values intact.
   */
  const handleSubmit = async (data: CourseCategoryFormData) => {
    if (editor?.mode === "edit" && editor.category) {
      const updated = await updateCategory(editor.category.id, data);

      setCategories((current) =>
        current.map((category) =>
          category.id === updated.id ? updated : category
        )
      );

      toastSuccess(
        "Category updated",
        `"${updated.name}" has been saved.`
      );
    } else {
      const created = await createCategory(data);

      setCategories((current) => [...current, created]);

      toastSuccess(
        "Category created",
        `"${created.name}" was added.`
      );
    }

    // Follows the category to the brand it was saved under.
    setSelectedBrandId(data.brand_id);
    closeEditor();
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    try {
      setDeleting(true);

      await deleteCategory(deleteTarget.id);

      setCategories((current) =>
        current.filter((category) => category.id !== deleteTarget.id)
      );

      toastSuccess(
        "Category deleted",
        `"${deleteTarget.name}" was removed.`
      );

      setDeleteTarget(null);
    } catch (deleteError) {
      console.error("Failed to delete category:", deleteError);

      toastError(
        "Could not delete category",
        getApiErrorMessage(deleteError)
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-full pb-16">
      <CategoriesHeader
        brands={brands}
        categories={categories}
        loading={loading}
        onCreate={openCreate}
      />

      <CategoryFilters
        brandOptions={brandOptions}
        selectedBrandId={selectedBrandId}
        search={search}
        resultCount={visibleCategories.length}
        loading={loading}
        onBrandChange={setSelectedBrandId}
        onSearchChange={setSearch}
      />

      {/* Grid */}
      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        {loading ? (
          <CategoriesSkeleton />
        ) : !error && visibleCategories.length > 0 ? (
          <div className={CATEGORIES_GRID}>
            {visibleCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => setEditor({ mode: "edit", category })}
                onDelete={() => setDeleteTarget(category)}
              />
            ))}
          </div>
        ) : (
          <CategoriesEmptyState
            error={error}
            brandName={selectedBrand?.name}
            hasSearch={search.trim() !== ""}
            onRetry={retry}
            onClearSearch={() => setSearch("")}
            onCreate={openCreate}
          />
        )}
      </section>

      {/* Create / Edit */}
      <CategoryModal
        open={editor !== null}
        mode={editor?.mode ?? "create"}
        category={editor?.category ?? null}
        brands={brands}
        defaultBrandId={selectedBrandId}
        onClose={closeEditor}
        onSubmit={handleSubmit}
      />

      {/* Delete */}
      <CategoryDeleteDialog
        category={deleteTarget}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
