"use client";

import { useEffect, useMemo, useState } from "react";

import CourseCard from "@/components/admin/courses/CourseCard";
import CourseDeleteDialog from "@/components/admin/courses/CourseDeleteDialog";
import CourseFilters from "@/components/admin/courses/CourseFilters";
import CourseModal from "@/components/admin/courses/CourseModal";
import CoursesEmptyState from "@/components/admin/courses/CoursesEmptyState";
import CoursesHeader from "@/components/admin/courses/CoursesHeader";
import CoursesSkeleton from "@/components/admin/courses/CoursesSkeleton";
import {
  COURSES_GRID,
  countCourses,
  coursePlacement,
  type CourseStatusFilter,
} from "@/components/admin/courses/course-utils";
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
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
  type Course,
  type CourseFilters as CourseQuery,
  type CourseFormData,
} from "@/lib/api/courses";
import { getApiErrorMessage } from "@/lib/api/errors";

const SEARCH_DEBOUNCE_MS = 400;

interface CourseEditor {
  mode: "create" | "edit";
  course: Course | null;
}

/** One answer from the backend, tagged with the request it answers. */
interface CourseResult {
  key: string;
  courses: Course[];
  error: string | null;
}

export default function CoursesPage() {
  const { toasts, toastSuccess, toastError, dismissToast } =
    useToasts();

  // =========================================================
  // LOOKUPS
  //
  // What the tabs, the dropdowns, the card labels and the form are built
  // from: the brands and every main and sub category. `allCourses` is the
  // unfiltered list and is only ever counted — the grid never shows it.
  // =========================================================

  const [brands, setBrands] = useState<CourseBrand[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [subcategories, setSubcategories] = useState<
    CourseSubcategory[]
  >([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bumped by "Retry" and after a create / edit / delete to ask again.
  const [refreshToken, setRefreshToken] = useState(0);

  // =========================================================
  // FILTERS
  // =========================================================

  // The brand last picked; empty until one is, so the page works from
  // `brand` below, which falls back to the first one.
  const [selectedBrandId, setSelectedBrandId] = useState("");

  // Empty means "all of them".
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] =
    useState("");

  const [status, setStatus] = useState<CourseStatusFilter>("all");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // =========================================================
  // COURSES
  // =========================================================

  // The backend's answer to the current filters — what the grid shows.
  const [result, setResult] = useState<CourseResult | null>(null);

  // =========================================================
  // UI
  // =========================================================

  const [editor, setEditor] = useState<CourseEditor | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Course | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  // =========================================================
  // FETCH — LOOKUPS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getCourseBrands(),
      getCategories(),
      getSubcategories(),
      getCourses(),
    ])
      .then(
        ([allBrands, allCategories, allSubcategories, everyCourse]) => {
          if (cancelled) return;

          setBrands(allBrands.filter((item) => item.is_active));
          setCategories(allCategories);
          setSubcategories(allSubcategories);
          setAllCourses(everyCourse);
          setError(null);
        }
      )
      .catch((loadError) => {
        if (cancelled) return;

        console.error("Failed to load the course lookups:", loadError);

        setError(
          getApiErrorMessage(
            loadError,
            "Something went wrong while fetching the courses."
          )
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  // =========================================================
  // SELECTION
  // =========================================================

  const brand =
    brands.find((item) => item.id === selectedBrandId) ?? brands[0];

  const brandCategories = useMemo(
    () => categories.filter((item) => item.brand_id === brand?.id),
    [categories, brand?.id]
  );

  // `undefined` while the filter is on "all".
  const category = brandCategories.find(
    (item) => item.id === selectedCategoryId
  );

  const categorySubcategories = useMemo(
    () =>
      subcategories.filter(
        (item) => category && item.category_id === category.id
      ),
    [subcategories, category]
  );

  const subcategory = categorySubcategories.find(
    (item) => item.id === selectedSubcategoryId
  );

  const brandId = brand?.id;
  const categoryId = category?.id;
  const subcategoryId = subcategory?.id;

  // =========================================================
  // FETCH — COURSES
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS
    );

    return () => clearTimeout(timer);
  }, [search]);

  /**
   * Every filter is a query parameter — the backend does the filtering and
   * the searching, and this page never narrows a list of courses itself.
   * `null` until there is a brand to ask about.
   */
  const query = useMemo<CourseQuery | null>(
    () =>
      brandId
        ? {
            brand_id: brandId,
            category_id: categoryId,
            subcategory_id: subcategoryId,
            search: debouncedSearch.trim() || undefined,
            is_published:
              status === "all" ? undefined : status === "published",
          }
        : null,
    [brandId, categoryId, subcategoryId, debouncedSearch, status]
  );

  // Names one request, so an answer is only shown for the filters it is for.
  const requestKey = `${JSON.stringify(query)}:${refreshToken}`;

  useEffect(() => {
    if (!query) return;

    let cancelled = false;

    getCourses(query)
      .then((courses) => {
        // A slower earlier request must not overwrite a newer result.
        if (cancelled) return;

        setResult({ key: requestKey, courses, error: null });
      })
      .catch((fetchError) => {
        if (cancelled) return;

        console.error("Failed to fetch courses:", fetchError);

        setResult({
          key: requestKey,
          courses: [],
          error: getApiErrorMessage(
            fetchError,
            "Something went wrong while fetching the courses."
          ),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [query, requestKey]);

  const courses = result?.courses ?? [];

  // True while the answer on screen belongs to earlier filters.
  const stale = query !== null && result?.key !== requestKey;

  // The skeleton is for when there is nothing to show yet; otherwise the
  // cards stay on screen, dimmed, while a new result is on its way.
  const showSkeleton = loading || (stale && courses.length === 0);

  const shownError = error ?? (stale ? null : result?.error) ?? null;

  const refresh = () => setRefreshToken((token) => token + 1);

  const retry = () => {
    setLoading(true);
    refresh();
  };

  // =========================================================
  // FILTER HELPERS
  // =========================================================

  const hasActiveFilters = Boolean(
    category || subcategory || status !== "all" || search.trim()
  );

  const selectBrand = (id: string) => {
    setSelectedBrandId(id);
    setSelectedCategoryId("");
    setSelectedSubcategoryId("");
  };

  const selectCategory = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId("");
  };

  const changeSearch = (value: string) => {
    setSearch(value);

    // Clearing the box takes effect at once instead of after the pause.
    if (!value) setDebouncedSearch("");
  };

  const resetFilters = () => {
    selectCategory("");
    setStatus("all");
    changeSearch("");
  };

  // =========================================================
  // COUNTS AND LABELS
  // =========================================================

  const counts = useMemo(
    () =>
      countCourses(
        allCourses,
        new Set(brands.map((item) => item.id))
      ),
    [allCourses, brands]
  );

  /** A tab or a dropdown entry, with how many courses it holds. */
  const toOption = (item: { id: string; name: string }) => ({
    value: item.id,
    label: item.name,
    count: counts.byParent.get(item.id) ?? 0,
  });

  /** The name of every main and sub category, for the cards. */
  const names = useMemo(
    () =>
      new Map(
        [...categories, ...subcategories].map((item) => [
          item.id,
          item.name,
        ])
      ),
    [categories, subcategories]
  );

  // =========================================================
  // CREATE / EDIT
  // =========================================================

  const openCreate = () => setEditor({ mode: "create", course: null });

  const closeEditor = () => setEditor(null);

  /**
   * Errors are left to throw so the modal can show them inline and keep the
   * form open with the values intact.
   */
  const handleSubmit = async (data: CourseFormData) => {
    const editing = editor?.mode === "edit" ? editor.course : null;

    const saved = editing
      ? await updateCourse(editing.id, data)
      : await createCourse(data);

    toastSuccess(
      editing ? "Course updated" : "Course created",
      editing
        ? `"${saved.title}" has been saved.`
        : `"${saved.title}" was added.`
    );

    // Keeps the saved course on screen: follows it to its brand, and drops
    // a category filter it does not fall under.
    if (saved.brand_id !== brandId) {
      selectBrand(saved.brand_id);
    } else if (category && saved.category_id !== category.id) {
      selectCategory("");
    } else if (
      subcategory &&
      saved.subcategory_id !== subcategory.id
    ) {
      setSelectedSubcategoryId("");
    }

    closeEditor();
    refresh();
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    try {
      setDeleting(true);

      await deleteCourse(deleteTarget.id);

      toastSuccess(
        "Course deleted",
        `"${deleteTarget.title}" was removed.`
      );

      setDeleteTarget(null);
      refresh();
    } catch (deleteError) {
      console.error("Failed to delete course:", deleteError);

      toastError(
        "Could not delete course",
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
      <CoursesHeader
        brandCount={brands.length}
        counts={counts}
        loading={loading}
        onCreate={openCreate}
      />

      <CourseFilters
        brandOptions={brands.map(toOption)}
        selectedBrandId={brandId ?? ""}
        categoryOptions={brandCategories.map(toOption)}
        selectedCategoryId={categoryId ?? ""}
        subcategoryOptions={categorySubcategories.map(toOption)}
        selectedSubcategoryId={subcategoryId ?? ""}
        status={status}
        search={search}
        resultCount={courses.length}
        hasActiveFilters={hasActiveFilters}
        loading={showSkeleton}
        onBrandChange={selectBrand}
        onCategoryChange={selectCategory}
        onSubcategoryChange={setSelectedSubcategoryId}
        onStatusChange={setStatus}
        onSearchChange={changeSearch}
        onReset={resetFilters}
      />

      {/* Grid */}
      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        {showSkeleton ? (
          <CoursesSkeleton />
        ) : !shownError && courses.length > 0 ? (
          <div
            aria-busy={stale}
            className={`${COURSES_GRID} transition-opacity duration-200 ${
              stale ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                placement={coursePlacement(course, names)}
                onEdit={() => setEditor({ mode: "edit", course })}
                onDelete={() => setDeleteTarget(course)}
              />
            ))}
          </div>
        ) : (
          <CoursesEmptyState
            error={shownError}
            brandName={brand?.name}
            hasActiveFilters={hasActiveFilters}
            onRetry={retry}
            onResetFilters={resetFilters}
            onCreate={openCreate}
          />
        )}
      </section>

      {/* Create / Edit */}
      <CourseModal
        open={editor !== null}
        mode={editor?.mode ?? "create"}
        course={editor?.course ?? null}
        brands={brands}
        categories={categories}
        subcategories={subcategories}
        defaults={{
          brandId: brandId ?? "",
          categoryId: categoryId ?? "",
          subcategoryId: subcategoryId ?? "",
        }}
        onClose={closeEditor}
        onSubmit={handleSubmit}
      />

      {/* Delete */}
      <CourseDeleteDialog
        course={deleteTarget}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
