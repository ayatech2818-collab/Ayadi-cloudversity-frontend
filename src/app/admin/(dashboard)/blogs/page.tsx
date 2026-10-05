"use client";

import { useCallback, useEffect, useState } from "react";

import BlogCard from "@/components/admin/blogs/BlogCard";
import BlogDeleteDialog from "@/components/admin/blogs/BlogDeleteDialog";
import BlogEmptyState from "@/components/admin/blogs/BlogEmptyState";
import BlogFilters from "@/components/admin/blogs/BlogFilters";
import BlogModal from "@/components/admin/blogs/BlogModal";
import BlogPreviewModal from "@/components/admin/blogs/BlogPreviewModal";
import BlogsHeader from "@/components/admin/blogs/BlogsHeader";
import BlogsSkeleton from "@/components/admin/blogs/BlogsSkeleton";
import {
  BLOGS_GRID,
  type BlogSortOption,
  type BlogStatusFilter,
} from "@/components/admin/blogs/blog-utils";
import { Toaster, useToasts } from "@/components/admin/ui/Toast";

import {
  createBlog,
  deleteBlog,
  getBlogs,
  updateBlog,
  type Blog,
  type BlogFormData,
} from "@/lib/api/blogs";
import { getApiErrorMessage } from "@/lib/api/errors";

const SEARCH_DEBOUNCE_MS = 400;

interface BlogEditor {
  mode: "create" | "edit";
  blog: Blog | null;
}

export default function BlogsPage() {
  const { toasts, toastSuccess, toastError, dismissToast } =
    useToasts();

  // =========================================================
  // DATA
  // =========================================================

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Every blog, ignoring the filters — what the header counts.
  const [allBlogs, setAllBlogs] = useState<Blog[] | null>(null);

  // Bumped after a create / edit / delete to re-run the same queries.
  const [refreshToken, setRefreshToken] = useState(0);

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<BlogStatusFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState<BlogSortOption>("newest");

  // =========================================================
  // UI
  // =========================================================

  const [editor, setEditor] = useState<BlogEditor | null>(null);
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  // =========================================================
  // FETCH
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS
    );

    return () => clearTimeout(timer);
  }, [search]);

  /**
   * Every filter is a query parameter — the backend does the filtering, this
   * page never narrows an already-loaded list.
   */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getBlogs({
          search: debouncedSearch.trim() || undefined,
          status: statusFilter === "All" ? undefined : statusFilter,
          category:
            categoryFilter === "All" ? undefined : categoryFilter,
          sort_by: sortBy,
        });

        // A slower earlier request must not overwrite a newer result.
        if (cancelled) return;

        setBlogs(data);
      } catch (fetchError) {
        if (cancelled) return;

        console.error("Failed to fetch blogs:", fetchError);

        setError(
          getApiErrorMessage(
            fetchError,
            "Something went wrong while fetching the blogs."
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
  }, [
    debouncedSearch,
    statusFilter,
    categoryFilter,
    sortBy,
    refreshToken,
  ]);

  // The header counts need the unfiltered list, so it is fetched on its own.
  useEffect(() => {
    let cancelled = false;

    getBlogs()
      .then((data) => {
        if (!cancelled) setAllBlogs(data);
      })
      .catch((statsError) =>
        console.error("Failed to fetch blog counts:", statsError)
      );

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const refresh = useCallback(
    () => setRefreshToken((token) => token + 1),
    []
  );

  // =========================================================
  // FILTER HELPERS
  // =========================================================

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "All" ||
    categoryFilter !== "All";

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setSortBy("newest");
  };

  // =========================================================
  // CREATE / EDIT
  // =========================================================

  const openCreate = () => setEditor({ mode: "create", blog: null });
  const openEdit = (blog: Blog) => setEditor({ mode: "edit", blog });
  const closeEditor = () => setEditor(null);

  /**
   * Errors are left to throw so the modal can show them inline and keep the
   * form open with the values intact.
   */
  const handleSubmit = async (data: BlogFormData) => {
    const isPublished = data.status === "published";

    if (editor?.mode === "edit" && editor.blog) {
      await updateBlog(editor.blog.id, data);

      toastSuccess(
        "Blog updated",
        `"${data.title}" is saved as ${isPublished ? "published" : "a draft"}.`
      );
    } else {
      await createBlog(data);

      toastSuccess(
        isPublished ? "Blog published" : "Draft saved",
        `"${data.title}" is saved as ${isPublished ? "published" : "a draft"}.`
      );
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

      await deleteBlog(deleteTarget.id);

      toastSuccess(
        "Blog deleted",
        `"${deleteTarget.title}" was removed.`
      );

      setDeleteTarget(null);
      refresh();
    } catch (deleteError) {
      console.error("Failed to delete blog:", deleteError);

      toastError(
        "Could not delete blog",
        getApiErrorMessage(deleteError)
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  // The skeleton is for the first load only; after that the cards stay on
  // screen, dimmed, while a new result is on its way.
  const showSkeleton = loading && blogs.length === 0;

  return (
    <div className="min-h-full pb-16">
      <BlogsHeader blogs={allBlogs} onCreate={openCreate} />

      <BlogFilters
        search={search}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        sortBy={sortBy}
        resultCount={blogs.length}
        hasActiveFilters={hasFilters}
        loading={showSkeleton}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
        onSortChange={setSortBy}
        onReset={resetFilters}
      />

      {/* Grid */}
      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        {showSkeleton ? (
          <BlogsSkeleton />
        ) : !error && blogs.length > 0 ? (
          <div
            aria-busy={loading}
            className={`${BLOGS_GRID} transition-opacity duration-200 ${
              loading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                onPreview={() => setPreviewBlog(blog)}
                onEdit={() => openEdit(blog)}
                onDelete={() => setDeleteTarget(blog)}
              />
            ))}
          </div>
        ) : (
          <BlogEmptyState
            error={error}
            hasFilters={hasFilters}
            onRetry={refresh}
            onResetFilters={resetFilters}
            onCreate={openCreate}
          />
        )}
      </section>

      {/* Create / Edit */}
      <BlogModal
        open={editor !== null}
        mode={editor?.mode ?? "create"}
        blog={editor?.blog ?? null}
        onClose={closeEditor}
        onSubmit={handleSubmit}
      />

      {/* Preview */}
      <BlogPreviewModal
        blog={previewBlog}
        onClose={() => setPreviewBlog(null)}
        onEdit={openEdit}
      />

      {/* Delete */}
      <BlogDeleteDialog
        blog={deleteTarget}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
