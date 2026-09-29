"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
} from "lucide-react";

import {
  Course,
  CourseFormData,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/lib/api/courses";

import {
  CourseBrand,
  getCourseBrands,
} from "@/lib/api/course-brands";

import {
  CourseCategory,
  getCategories,
} from "@/lib/api/course-categories";

import {
  CourseSubcategory,
  getSubcategories,
} from "@/lib/api/course-subcategories";

import CourseModal from "@/components/admin/CourseModal";

export default function CoursesPage() {
  const [brands, setBrands] = useState<CourseBrand[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>(
    []
  );
  const [subcategories, setSubcategories] = useState<
    CourseSubcategory[]
  >([]);

  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedBrandId, setSelectedBrandId] =
    useState("");

  const [selectedCategoryId, setSelectedCategoryId] =
    useState("");

  const [selectedSubcategoryId, setSelectedSubcategoryId] =
    useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] =
    useState(false);
  const [categoriesLoading, setCategoriesLoading] =
    useState(false);
  const [subcategoriesLoading, setSubcategoriesLoading] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] =
    useState<"create" | "edit">("create");

  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  const [activeMenu, setActiveMenu] =
    useState<string | null>(null);

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

  const loadCategoriesForBrand = async (
    brandId: string
  ) => {
    if (!brandId) {
      setCategories([]);
      setSubcategories([]);
      setSelectedCategoryId("");
      setSelectedSubcategoryId("");
      return;
    }

    try {
      setCategoriesLoading(true);

      const data = await getCategories(brandId);

      setCategories(data);

      setSelectedCategoryId("");
      setSelectedSubcategoryId("");
      setSubcategories(data.length ? [] : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories.");
      setCategories([]);
      setSubcategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // --------------------------------------------------
  // Load subcategories when category changes
  // --------------------------------------------------

  const loadSubcategoriesForCategory = async (
    categoryId: string
  ) => {
    if (!categoryId) {
      setSubcategories([]);
      setSelectedSubcategoryId("");
      return;
    }

    try {
      setSubcategoriesLoading(true);

      const data =
        await getSubcategories(categoryId);

      setSubcategories(data);
      setSelectedSubcategoryId("");
    } catch (err) {
      console.error(err);
      setError("Failed to load sub categories.");
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  // --------------------------------------------------
  // Load courses
  // --------------------------------------------------

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      setError(null);

      const data = await getCourses({
        brand_id: selectedBrandId || undefined,
        category_id:
          selectedCategoryId || undefined,
        subcategory_id:
          selectedSubcategoryId || undefined,
        search: search.trim() || undefined,
      });

      setCourses(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses.");
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedBrandId) {
      setCourses([]);
      return;
    }

    loadCourses();
  }, [
    selectedBrandId,
    selectedCategoryId,
    selectedSubcategoryId,
  ]);

  // --------------------------------------------------
  // Brand changed
  // --------------------------------------------------

  const handleBrandChange = async (
    brandId: string
  ) => {
    setSelectedBrandId(brandId);

    await loadCategoriesForBrand(brandId);
  };

  // --------------------------------------------------
  // Category changed
  // --------------------------------------------------

  const handleCategoryChange = async (
    categoryId: string
  ) => {
    setSelectedCategoryId(categoryId);

    await loadSubcategoriesForCategory(
      categoryId
    );
  };

  // --------------------------------------------------
  // Create
  // --------------------------------------------------

  const handleCreate = async () => {
    setSelectedCourse(null);
    setModalMode("create");

    // Make modal use current filter context.
    if (selectedBrandId) {
      await loadCategoriesForBrand(
        selectedBrandId
      );
    }

    if (selectedCategoryId) {
      await loadSubcategoriesForCategory(
        selectedCategoryId
      );
    }

    setModalOpen(true);
  };

  // --------------------------------------------------
  // Edit
  // --------------------------------------------------

  const handleEdit = async (course: Course) => {
    setSelectedCourse(course);
    setModalMode("edit");

    try {
      await loadCategoriesForBrand(
        course.brand_id
      );

      if (course.category_id) {
        await loadSubcategoriesForCategory(
          course.category_id
        );
      }
    } catch (err) {
      console.error(err);
    }

    setModalOpen(true);
    setActiveMenu(null);
  };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const handleSubmit = async (
    data: CourseFormData
  ) => {
    if (modalMode === "create") {
      const created = await createCourse(data);

      if (data.brand_id === selectedBrandId) {
        setCourses((prev) => [
          created,
          ...prev,
        ]);
      } else {
        setSelectedBrandId(data.brand_id);
      }
    } else if (selectedCourse) {
      const updated = await updateCourse(
        selectedCourse.id,
        data
      );

      if (data.brand_id === selectedBrandId) {
        setCourses((prev) =>
          prev.map((course) =>
            course.id === updated.id
              ? updated
              : course
          )
        );
      } else {
        setSelectedBrandId(data.brand_id);
      }
    }

    setModalOpen(false);
    setSelectedCourse(null);
  };

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const handleDelete = async (
    course: Course
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteCourse(course.id);

      setCourses((prev) =>
        prev.filter(
          (item) => item.id !== course.id
        )
      );

      setActiveMenu(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete course.");
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
            <BookOpen className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-sm text-muted">
              Operations
            </p>

            <h1 className="text-2xl font-semibold text-text">
              Courses
            </h1>

            <p className="mt-1 text-sm text-muted">
              Manage courses across all learning brands.
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
          Add Course
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Brand */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Brand
            </label>

            <select
              value={selectedBrandId}
              onChange={(e) =>
                handleBrandChange(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
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
                handleCategoryChange(
                  e.target.value
                )
              }
              disabled={
                categoriesLoading ||
                categories.length === 0
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {categories.length
                  ? "All categories"
                  : "No categories"}
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

          {/* Subcategory */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Sub Category
            </label>

            <select
              value={selectedSubcategoryId}
              onChange={(e) =>
                setSelectedSubcategoryId(
                  e.target.value
                )
              }
              disabled={
                !selectedCategoryId ||
                subcategoriesLoading ||
                subcategories.length === 0
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {subcategories.length
                  ? "All sub categories"
                  : "No sub categories"}
              </option>

              {subcategories.map(
                (subcategory) => (
                  <option
                    key={subcategory.id}
                    value={subcategory.id}
                  >
                    {subcategory.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Search
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    loadCourses();
                  }
                }}
                placeholder="Search courses..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={loadCourses}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-background"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Courses */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">
              Course List
            </h2>

            <p className="text-sm text-muted">
              {courses.length}{" "}
              {courses.length === 1
                ? "course"
                : "courses"}
            </p>
          </div>
        </div>

        {coursesLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border bg-surface">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>

            <h3 className="font-medium text-text">
              No courses found
            </h3>

            <p className="mt-1 max-w-md text-sm text-muted">
              There are no courses matching the current
              filters.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="relative overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-primary/40 hover:shadow-sm"
              >
                {/* Thumbnail */}
                <div className="relative h-44 bg-background">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted" />
                    </div>
                  )}

                  {/* Menu */}
                  <div className="absolute right-3 top-3">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === course.id
                            ? null
                            : course.id
                        )
                      }
                      className="rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenu === course.id && (
                      <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-border bg-surface p-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(course)
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-background"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(course)
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

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-text">
                        {course.name}
                      </h3>

                      <p className="mt-1 text-xs text-muted">
                        {course.course_code}
                      </p>
                    </div>

                    {course.is_active ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                    )}
                  </div>

                  <p className="mt-3 line-clamp-2 min-h-[40px] text-sm text-muted">
                    {course.short_description ||
                      "No description provided."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.duration && (
                      <span className="rounded-full bg-background px-2.5 py-1 text-xs text-muted">
                        {course.duration}
                      </span>
                    )}

                    {course.level && (
                      <span className="rounded-full bg-background px-2.5 py-1 text-xs text-muted">
                        {course.level}
                      </span>
                    )}

                    {course.price !== null &&
                      course.price !== undefined && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          ₹{course.price}
                        </span>
                      )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted">
                    <span>
                      Order:{" "}
                      <span className="font-medium text-text">
                        {course.display_order}
                      </span>
                    </span>

                    <span className="truncate max-w-[150px]">
                      {course.slug}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <CourseModal
        open={modalOpen}
        mode={modalMode}
        course={selectedCourse}
        brands={brands}
        categories={categories}
        subcategories={subcategories}
        onBrandChange={loadCategoriesForBrand}
        onCategoryChange={
          loadSubcategoriesForCategory
        }
        onClose={() => {
          setModalOpen(false);
          setSelectedCourse(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}