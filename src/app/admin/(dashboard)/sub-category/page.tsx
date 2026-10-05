"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";

import CategoriesSkeleton from "@/components/admin/categories/CategoriesSkeleton";
import CategoryCard from "@/components/admin/categories/CategoryCard";
import CategoryDeleteDialog from "@/components/admin/categories/CategoryDeleteDialog";
import {
  CATEGORIES_GRID,
  filterCategories,
  sortCategories,
} from "@/components/admin/categories/category-utils";
import SubcategoriesEmptyState from "@/components/admin/subcategories/SubcategoriesEmptyState";
import SubcategoriesHeader from "@/components/admin/subcategories/SubcategoriesHeader";
import SubcategoryFilters from "@/components/admin/subcategories/SubcategoryFilters";
import SubcategoryModal from "@/components/admin/subcategories/SubcategoryModal";
import { Toaster, useToasts } from "@/components/admin/ui/Toast";

import {
  getCourseBrands,
  type CourseBrand,
} from "@/lib/api/course-brands";
import {
  getCategories,
  type CourseCategory,
} from "@/lib/api/course-categories";
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  updateSubcategory,
  type CourseSubcategory,
  type CourseSubcategoryFormData,
} from "@/lib/api/course-subcategories";
import { getApiErrorMessage } from "@/lib/api/errors";

interface SubcategoryEditor {
  mode: "create" | "edit";
  subcategory: CourseSubcategory | null;
}

export default function SubCategoryPage() {
  const router = useRouter();

  const { toasts, toastSuccess, toastError, dismissToast } =
    useToasts();

  // =========================================================
  // DATA
  //
  // Everything is loaded once: the brand tabs and the main category picker
  // only choose which part of it is on screen.
  // =========================================================

  const [brands, setBrands] = useState<CourseBrand[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [subcategories, setSubcategories] = useState<
    CourseSubcategory[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bumped by "Retry" to run the same requests again.
  const [reloadToken, setReloadToken] = useState(0);

  // =========================================================
  // FILTERS
  // =========================================================

  // What the admin last picked. Either can point at something that is not
  // there (nothing picked yet, or a main category of another brand), so the
  // page works from `brand` and `category` below, which fall back to the
  // first one available.
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [search, setSearch] = useState("");

  // =========================================================
  // UI
  // =========================================================

  const [editor, setEditor] = useState<SubcategoryEditor | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] =
    useState<CourseSubcategory | null>(null);
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

        // One request per brand, then one per main category — the way the
        // rest of the app asks for them. Having it all is what lets the
        // header count across brands and makes switching instant.
        const allCategories = (
          await Promise.all(
            activeBrands.map((brand) => getCategories(brand.id))
          )
        ).flat();

        const allSubcategories = (
          await Promise.all(
            allCategories.map((category) =>
              getSubcategories(category.id)
            )
          )
        ).flat();

        if (cancelled) return;

        setBrands(activeBrands);
        setCategories(allCategories);
        setSubcategories(allSubcategories);
        setError(null);
      } catch (loadError) {
        if (cancelled) return;

        console.error("Failed to fetch sub categories:", loadError);

        setError(
          getApiErrorMessage(
            loadError,
            "Something went wrong while fetching the sub categories."
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

  const brand =
    brands.find((item) => item.id === selectedBrandId) ?? brands[0];

  const brandCategories = useMemo(
    () =>
      sortCategories(
        categories.filter((item) => item.brand_id === brand?.id)
      ),
    [categories, brand?.id]
  );

  const category =
    brandCategories.find((item) => item.id === selectedCategoryId) ??
    brandCategories[0];

  const visibleSubcategories = useMemo(
    () =>
      filterCategories(
        sortCategories(
          subcategories.filter(
            (item) => item.category_id === category?.id
          )
        ),
        search
      ),
    [subcategories, category?.id, search]
  );

  /** How many sub categories each main category has. */
  const countByCategory = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of subcategories) {
      counts.set(
        item.category_id,
        (counts.get(item.category_id) ?? 0) + 1
      );
    }

    return counts;
  }, [subcategories]);

  const brandOptions = useMemo(
    () =>
      brands.map((item) => ({
        value: item.id,
        label: item.name,
        count: categories
          .filter((entry) => entry.brand_id === item.id)
          .reduce(
            (total, entry) =>
              total + (countByCategory.get(entry.id) ?? 0),
            0
          ),
      })),
    [brands, categories, countByCategory]
  );

  const categoryOptions = brandCategories.map((item) => ({
    value: item.id,
    label: item.name,
    count: countByCategory.get(item.id) ?? 0,
  }));

  // =========================================================
  // CREATE / EDIT
  // =========================================================

  const openCreate = () =>
    setEditor({ mode: "create", subcategory: null });

  const closeEditor = () => setEditor(null);

  /**
   * Errors are left to throw so the modal can show them inline and keep the
   * form open with the values intact.
   */
  const handleSubmit = async (data: CourseSubcategoryFormData) => {
    if (editor?.mode === "edit" && editor.subcategory) {
      const updated = await updateSubcategory(
        editor.subcategory.id,
        data
      );

      setSubcategories((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      toastSuccess(
        "Sub category updated",
        `"${updated.name}" has been saved.`
      );
    } else {
      const created = await createSubcategory(data);

      setSubcategories((current) => [...current, created]);

      toastSuccess(
        "Sub category created",
        `"${created.name}" was added.`
      );
    }

    // Follows it to the main category it was saved under.
    setSelectedCategoryId(data.category_id);
    closeEditor();
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    try {
      setDeleting(true);

      await deleteSubcategory(deleteTarget.id);

      setSubcategories((current) =>
        current.filter((item) => item.id !== deleteTarget.id)
      );

      toastSuccess(
        "Sub category deleted",
        `"${deleteTarget.name}" was removed.`
      );

      setDeleteTarget(null);
    } catch (deleteError) {
      console.error("Failed to delete sub category:", deleteError);

      toastError(
        "Could not delete sub category",
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
      <SubcategoriesHeader
        categories={categories}
        subcategories={subcategories}
        loading={loading}
        canCreate={Boolean(category)}
        onCreate={openCreate}
      />

      <SubcategoryFilters
        brandOptions={brandOptions}
        selectedBrandId={brand?.id ?? ""}
        categoryOptions={categoryOptions}
        selectedCategoryId={category?.id ?? ""}
        search={search}
        resultCount={visibleSubcategories.length}
        loading={loading}
        onBrandChange={setSelectedBrandId}
        onCategoryChange={setSelectedCategoryId}
        onSearchChange={setSearch}
      />

      {/* Grid */}
      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        {loading ? (
          <CategoriesSkeleton />
        ) : !error && visibleSubcategories.length > 0 ? (
          <div className={CATEGORIES_GRID}>
            {visibleSubcategories.map((subcategory) => (
              <CategoryCard
                key={subcategory.id}
                category={subcategory}
                icon={Folder}
                onEdit={() =>
                  setEditor({ mode: "edit", subcategory })
                }
                onDelete={() => setDeleteTarget(subcategory)}
              />
            ))}
          </div>
        ) : (
          <SubcategoriesEmptyState
            error={error}
            brandName={brand?.name}
            categoryName={category?.name}
            hasSearch={search.trim() !== ""}
            onRetry={retry}
            onClearSearch={() => setSearch("")}
            onCreate={openCreate}
            onGoToCategories={() =>
              router.push("/admin/main-category")
            }
          />
        )}
      </section>

      {/* Create / Edit */}
      <SubcategoryModal
        open={editor !== null}
        mode={editor?.mode ?? "create"}
        subcategory={editor?.subcategory ?? null}
        categories={brandCategories}
        defaultCategoryId={category?.id ?? ""}
        onClose={closeEditor}
        onSubmit={handleSubmit}
      />

      {/* Delete */}
      <CategoryDeleteDialog
        category={deleteTarget}
        noun="sub category"
        parent="main category"
        icon={Folder}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
