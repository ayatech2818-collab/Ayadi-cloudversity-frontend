"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Plus } from "lucide-react";

import BlogModal from "@/components/admin/BlogModal";
import BlogCard from "@/components/admin/blogs/BlogCard";
import BlogFilters, {
  type SortOption,
} from "@/components/admin/blogs/BlogFilters";
import BlogPreviewModal from "@/components/admin/blogs/BlogPreviewModal";
import DeleteBlogModal from "@/components/admin/blogs/DeleteBlogModal";
import BlogEmptyState from "@/components/admin/blogs/BlogEmptyState";

import {
  createBlog,
  deleteBlog,
  getBlogs,
  updateBlog,
  type Blog,
  type BlogFormData,
} from "@/lib/api/blogs";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "published" | "draft"
  >("All");
  const [categoryFilter, setCategoryFilter] =
    useState("All");
  const [sortBy, setSortBy] =
    useState<SortOption>("newest");

  const [activeMenu, setActiveMenu] =
    useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] =
    useState<"create" | "edit">("create");
  const [selectedBlog, setSelectedBlog] =
    useState<Blog | null>(null);

  const [previewBlog, setPreviewBlog] =
    useState<Blog | null>(null);

  const [deleteBlogTarget, setDeleteBlogTarget] =
    useState<Blog | null>(null);

  const [deleting, setDeleting] = useState(false);

  // GET
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getBlogs();
      setBlogs(data);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      setError("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Categories
  const categories = useMemo(() => {
    const values = new Set<string>();

    blogs.forEach((blog) => {
      if (blog.category) {
        values.add(blog.category);
      }
    });

    return ["All", ...Array.from(values).sort()];
  }, [blogs]);

  // Search + filters + sorting
  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = blogs.filter((blog) => {
      const matchesSearch =
        !query ||
        blog.title.toLowerCase().includes(query) ||
        blog.excerpt.toLowerCase().includes(query) ||
        blog.category?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        blog.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        blog.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "title-desc") {
        return b.title.localeCompare(a.title);
      }

      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return sortBy === "oldest"
        ? dateA - dateB
        : dateB - dateA;
    });
  }, [
    blogs,
    search,
    statusFilter,
    categoryFilter,
    sortBy,
  ]);

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "All" ||
    categoryFilter !== "All";

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setSortBy("newest");
  };

  // Create
  const handleCreate = () => {
    setSelectedBlog(null);
    setModalMode("create");
    setModalOpen(true);
  };

  // Edit
  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setModalMode("edit");
    setModalOpen(true);
    setActiveMenu(null);
  };

  // Create / Update
  const handleSubmit = async (
    data: BlogFormData,
    action: "draft" | "publish"
  ) => {
    const payload: BlogFormData = {
      ...data,
      status:
        action === "publish"
          ? "published"
          : "draft",
    };

    if (modalMode === "create") {
      const created = await createBlog(payload);

      setBlogs((current) => [
        created,
        ...current,
      ]);
    } else if (selectedBlog) {
      const updated = await updateBlog(
        selectedBlog.id,
        payload
      );

      setBlogs((current) =>
        current.map((blog) =>
          blog.id === selectedBlog.id
            ? updated
            : blog
        )
      );
    }

    setModalOpen(false);
    setSelectedBlog(null);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteBlogTarget) return;

    try {
      setDeleting(true);

      await deleteBlog(deleteBlogTarget.id);

      setBlogs((current) =>
        current.filter(
          (blog) =>
            blog.id !== deleteBlogTarget.id
        )
      );

      setDeleteBlogTarget(null);
    } catch (error) {
      console.error(
        "Failed to delete blog:",
        error
      );

      alert("Failed to delete blog.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-full pb-16">
      {/* Header */}
      <section className="border-b border-border bg-surface">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText size={12} />
                </span>

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  Content
                </span>
              </div>

              <h1 className="text-2xl font-bold text-text sm:text-3xl">
                Blogs
              </h1>

              <p className="mt-1 text-sm text-muted">
                Create, manage and publish your latest
                content.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Plus size={16} />
              Create Blog
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <BlogFilters
        search={search}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        sortBy={sortBy}
        categories={categories}
        resultCount={filteredBlogs.length}
        hasActiveFilters={hasFilters}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
        onSortChange={setSortBy}
        onReset={resetFilters}
      />

      {/* Grid */}
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        {!loading &&
        !error &&
        filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                isMenuOpen={
                  activeMenu === blog.id
                }
                onMenuToggle={() =>
                  setActiveMenu(
                    activeMenu === blog.id
                      ? null
                      : blog.id
                  )
                }
                onPreview={() => {
                  setPreviewBlog(blog);
                  setActiveMenu(null);
                }}
                onEdit={() =>
                  handleEdit(blog)
                }
                onDelete={() => {
                  setDeleteBlogTarget(blog);
                  setActiveMenu(null);
                }}
              />
            ))}
          </div>
        ) : (
          <BlogEmptyState
            loading={loading}
            error={error}
            hasFilters={hasFilters}
            onRetry={fetchBlogs}
            onResetFilters={resetFilters}
            onCreate={handleCreate}
          />
        )}
      </section>

      {/* Create / Edit */}
      <BlogModal
        open={modalOpen}
        mode={modalMode}
        blog={selectedBlog}
        onClose={() => {
          setModalOpen(false);
          setSelectedBlog(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* Preview */}
      <BlogPreviewModal
        blog={previewBlog}
        onClose={() => setPreviewBlog(null)}
        onEdit={handleEdit}
      />

      {/* Delete */}
      <DeleteBlogModal
        blog={deleteBlogTarget}
        loading={deleting}
        onCancel={() =>
          setDeleteBlogTarget(null)
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}