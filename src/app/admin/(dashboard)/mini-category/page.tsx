"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";

import CategoriesSkeleton from "@/components/admin/categories/CategoriesSkeleton";
import CategoryCard from "@/components/admin/categories/CategoryCard";
import CategoryDeleteDialog from "@/components/admin/categories/CategoryDeleteDialog";
import {
  CATEGORIES_GRID,
  filterCategories,
  sortCategories,
} from "@/components/admin/categories/category-utils";
import MiniCategoriesEmptyState from "@/components/admin/minicategories/MiniCategoriesEmptyState";
import MiniCategoriesHeader from "@/components/admin/minicategories/MiniCategoriesHeader";
import MiniCategoryFilters from "@/components/admin/minicategories/MiniCategoryFilters";
import MiniCategoryModal from "@/components/admin/minicategories/MiniCategoryModal";
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
  getSubcategories,
  type CourseSubcategory,
} from "@/lib/api/course-subcategories";
import {
  createMiniCategory,
  deleteMiniCategory,
  getMiniCategories,
  updateMiniCategory,
  type CourseMiniCategory,
  type CourseMiniCategoryFormData,
} from "@/lib/api/course-mini-categories";
import { getApiErrorMessage } from "@/lib/api/errors";

interface MiniCategoryEditor {
  mode: "create" | "edit";
  miniCategory: CourseMiniCategory | null;
}

export default function MiniCategoryPage() {
  const router = useRouter();

  const { toasts, toastSuccess, toastError, dismissToast } =
    useToasts();

  // =========================================================
  // DATA
  //
  // Everything is loaded once: the brand tabs and parent pickers
  // choose which part of the tree is displayed.
  // =========================================================

  const [brands, setBrands] = useState<CourseBrand[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [subcategories, setSubcategories] = useState<
    CourseSubcategory[]
  >([]);
  const [miniCategories, setMiniCategories] = useState<
    CourseMiniCategory[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bumped by "Retry" to run the requests again.
  const [reloadToken, setReloadToken] = useState(0);

  // =========================================================
  // FILTERS
  // =========================================================

  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");

  const [search, setSearch] = useState("");

  // =========================================================
  // UI
  // =========================================================

  const [editor, setEditor] = useState<MiniCategoryEditor | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] =
    useState<CourseMiniCategory | null>(null);
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

        const allMiniCategories = (
          await Promise.all(
            allSubcategories.map((subcategory) =>
              getMiniCategories(subcategory.id)
            )
          )
        ).flat();

        if (cancelled) return;

        setBrands(activeBrands);
        setCategories(allCategories);
        setSubcategories(allSubcategories);
        setMiniCategories(allMiniCategories);
        setError(null);
      } catch (loadError) {
        if (cancelled) return;

        console.error("Failed to fetch mini categories:", loadError);

        setError(
          getApiErrorMessage(
            loadError,
            "Something went wrong while fetching the mini categories."
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

  const categorySubcategories = useMemo(
    () =>
      sortCategories(
        subcategories.filter(
          (item) => item.category_id === category?.id
        )
      ),
    [subcategories, category?.id]
  );

  const subcategory =
    categorySubcategories.find(
      (item) => item.id === selectedSubcategoryId
    ) ?? categorySubcategories[0];

  const visibleMiniCategories = useMemo(
    () =>
      filterCategories(
        sortCategories(
          miniCategories.filter(
            (item) => item.subcategory_id === subcategory?.id
          )
        ),
        search
      ),
    [miniCategories, subcategory?.id, search]
  );

  /** How many mini categories each sub category has. */
  const countBySubcategory = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of miniCategories) {
      counts.set(
        item.subcategory_id,
        (counts.get(item.subcategory_id) ?? 0) + 1
      );
    }

    return counts;
  }, [miniCategories]);

  /** How many mini categories each main category has across its sub categories. */
  const countByCategory = useMemo(() => {
    const counts = new Map<string, number>();

    for (const sub of subcategories) {
      const subCount = countBySubcategory.get(sub.id) ?? 0;
      counts.set(
        sub.category_id,
        (counts.get(sub.category_id) ?? 0) + subCount
      );
    }

    return counts;
  }, [subcategories, countBySubcategory]);

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

  const categoryOptions = useMemo(
    () =>
      brandCategories.map((item) => ({
        value: item.id,
        label: item.name,
        count: countByCategory.get(item.id) ?? 0,
      })),
    [brandCategories, countByCategory]
  );

  const subcategoryOptions = useMemo(
    () =>
      categorySubcategories.map((item) => ({
        value: item.id,
        label: item.name,
        count: countBySubcategory.get(item.id) ?? 0,
      })),
    [categorySubcategories, countBySubcategory]
  );

  // =========================================================
  // CREATE / EDIT
  // =========================================================

  const openCreate = () =>
    setEditor({ mode: "create", miniCategory: null });

  const closeEditor = () => setEditor(null);

  const handleSubmit = async (data: CourseMiniCategoryFormData) => {
    if (editor?.mode === "edit" && editor.miniCategory) {
      const updated = await updateMiniCategory(
        editor.miniCategory.id,
        data
      );

      setMiniCategories((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      toastSuccess(
        "Mini category updated",
        `"${updated.name}" has been saved.`
      );
    } else {
      const created = await createMiniCategory(data);

      setMiniCategories((current) => [...current, created]);

      toastSuccess(
        "Mini category created",
        `"${created.name}" was added.`
      );
    }

    setSelectedSubcategoryId(data.subcategory_id);
    closeEditor();
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    try {
      setDeleting(true);

      await deleteMiniCategory(deleteTarget.id);

      setMiniCategories((current) =>
        current.filter((item) => item.id !== deleteTarget.id)
      );

      toastSuccess(
        "Mini category deleted",
        `"${deleteTarget.name}" was removed.`
      );

      setDeleteTarget(null);
    } catch (deleteError) {
      console.error("Failed to delete mini category:", deleteError);

      toastError(
        "Could not delete mini category",
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
      <MiniCategoriesHeader
        subcategories={subcategories}
        miniCategories={miniCategories}
        loading={loading}
        canCreate={Boolean(subcategory)}
        onCreate={openCreate}
      />

      <MiniCategoryFilters
        brandOptions={brandOptions}
        selectedBrandId={brand?.id ?? ""}
        categoryOptions={categoryOptions}
        selectedCategoryId={category?.id ?? ""}
        subcategoryOptions={subcategoryOptions}
        selectedSubcategoryId={subcategory?.id ?? ""}
        search={search}
        resultCount={visibleMiniCategories.length}
        loading={loading}
        onBrandChange={setSelectedBrandId}
        onCategoryChange={setSelectedCategoryId}
        onSubcategoryChange={setSelectedSubcategoryId}
        onSearchChange={setSearch}
      />

      {/* Grid */}
      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        {loading ? (
          <CategoriesSkeleton />
        ) : !error && visibleMiniCategories.length > 0 ? (
          <div className={CATEGORIES_GRID}>
            {visibleMiniCategories.map((miniCategory) => (
              <CategoryCard
                key={miniCategory.id}
                category={miniCategory}
                icon={Layers}
                onEdit={() =>
                  setEditor({ mode: "edit", miniCategory })
                }
                onDelete={() => setDeleteTarget(miniCategory)}
              />
            ))}
          </div>
        ) : (
          <MiniCategoriesEmptyState
            error={error}
            brandName={brand?.name}
            categoryName={category?.name}
            subcategoryName={subcategory?.name}
            hasSearch={search.trim() !== ""}
            onRetry={retry}
            onClearSearch={() => setSearch("")}
            onCreate={openCreate}
            onGoToCategories={() =>
              router.push("/admin/main-category")
            }
            onGoToSubcategories={() =>
              router.push("/admin/sub-category")
            }
          />
        )}
      </section>

      {/* Create / Edit */}
      <MiniCategoryModal
        open={editor !== null}
        mode={editor?.mode ?? "create"}
        miniCategory={editor?.miniCategory ?? null}
        subcategories={categorySubcategories}
        defaultSubcategoryId={subcategory?.id ?? ""}
        onClose={closeEditor}
        onSubmit={handleSubmit}
      />

      {/* Delete */}
      <CategoryDeleteDialog
        category={deleteTarget}
        noun="mini category"
        parent="sub category"
        icon={Layers}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
