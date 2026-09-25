"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  CalendarDays,
  Clock3,
  FileText,
  X,
  AlertTriangle,
  ChevronDown,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import BlogModal from "@/components/admin/BlogModal";
import {
  type Blog,
  type BlogFormData,
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "@/lib/api/blogs";

const INITIAL_BLOGS: Blog[] = [
  {
    id: "1",
    title: "The Future of Technology in Modern Education",
    slug: "future-of-technology-in-modern-education",
    excerpt:
      "Discover how emerging technologies are transforming the way students learn and interact with education.",
    content:
      "Technology is reshaping the educational landscape at an unprecedented pace. From AI-driven adaptive learning systems to virtual laboratories, modern education is evolving beyond the confines of traditional classrooms.",
    category: "Technology",
    date: "Sep 24, 2026",
    readTime: "5 min read",
    status: "published",
    is_featured: true,
    cover_image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    tags: ["EdTech", "Innovation", "Cloud"],
    author: "Ayadi Cloudversity",
  },
  {
    id: "2",
    title: "Why Continuous Learning Matters in Tech",
    slug: "why-continuous-learning-matters",
    excerpt:
      "Learning doesn't stop after graduation. Explore why continuous learning has become essential for career longevity.",
    content:
      "In the fast-moving digital economy, technical skills have a shorter half-life than ever before. Cultivating a continuous learning mindset is the single most valuable career investment.",
    category: "Education",
    date: "Sep 20, 2026",
    readTime: "4 min read",
    status: "published",
    is_featured: false,
    cover_image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    tags: ["Career", "Skills"],
    author: "Ayadi Cloudversity",
  },
  {
    id: "3",
    title: "Artificial Intelligence and the Next Generation",
    slug: "artificial-intelligence-and-next-generation",
    excerpt:
      "Understanding the growing role of AI and how students can prepare for an AI-driven future in engineering.",
    content:
      "Artificial intelligence is no longer speculative—it is an active partner in code generation, analysis, and discovery. Here is how students can prepare.",
    category: "AI",
    date: "Sep 17, 2026",
    readTime: "6 min read",
    status: "draft",
    is_featured: false,
    cover_image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
    tags: ["AI", "MachineLearning"],
    author: "Ayadi Cloudversity",
  },
  {
    id: "4",
    title: "Building Skills for a Digital Career",
    slug: "building-skills-for-a-digital-career",
    excerpt:
      "The most important skills students should develop to build successful careers in the global digital economy.",
    content:
      "From cloud fluency to communicative clarity, modern engineering demands a blend of deep domain proficiency and agile collaboration.",
    category: "Career",
    date: "Sep 12, 2026",
    readTime: "7 min read",
    status: "published",
    is_featured: false,
    cover_image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
    tags: ["Careers", "Cloud"],
    author: "Ayadi Cloudversity",
  },
  {
    id: "5",
    title: "From Classroom to Real-World Projects",
    slug: "from-classroom-to-real-world-projects",
    excerpt:
      "How practical projects help students turn theoretical knowledge into meaningful industry experience.",
    content:
      "Theory gives the map, but hands-on projects give the compass. Learn how building production-ready architectures cements conceptual understanding.",
    category: "Learning",
    date: "Sep 08, 2026",
    readTime: "5 min read",
    status: "draft",
    is_featured: false,
    cover_image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    tags: ["Projects", "HandsOn"],
    author: "Ayadi Cloudversity",
  },
  {
    id: "6",
    title: "The Importance of Industry-Ready Education",
    slug: "importance-of-industry-ready-education",
    excerpt:
      "What makes an educational curriculum truly useful for today's rapidly changing cloud ecosystem.",
    content:
      "Bridging the academia-industry gap requires live curriculum updates, hands-on cloud labs, and active mentorship from seasoned practitioners.",
    category: "Education",
    date: "Sep 04, 2026",
    readTime: "4 min read",
    status: "published",
    is_featured: false,
    cover_image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
    tags: ["Industry", "Curriculum"],
    author: "Ayadi Cloudversity",
  },
];

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";

export default function BlogsPage() {
  const [blogsList, setBlogsList] = useState<Blog[]>(INITIAL_BLOGS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "published" | "draft">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [activeMenu, setActiveMenu] = useState<string | number | null>(null);

  // Unified BlogModal state (Supports both Create and Edit)
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [blogModalMode, setBlogModalMode] = useState<"create" | "edit">("create");
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  // Delete & Preview state
  const [deleteTargetBlog, setDeleteTargetBlog] = useState<Blog | null>(null);
  const [previewTargetBlog, setPreviewTargetBlog] = useState<Blog | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Try fetching blogs from backend API on mount
  useEffect(() => {
    let isMounted = true;
    getBlogs()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setBlogsList(data);
        }
      })
      .catch(() => {
        // Fallback to initial mock data when backend endpoint is not active
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Close card action menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }

    if (activeMenu !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [activeMenu]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    blogsList.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ["All", ...Array.from(set)];
  }, [blogsList]);

  // Filtered & Sorted list
  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = blogsList.filter((blog) => {
      const matchesSearch =
        !query ||
        blog.title.toLowerCase().includes(query) ||
        (blog.category && blog.category.toLowerCase().includes(query)) ||
        blog.excerpt.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || blog.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" || blog.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "title-desc") {
        return b.title.localeCompare(a.title);
      }
      if (sortBy === "oldest") {
        return String(a.id).localeCompare(String(b.id));
      }
      return String(b.id).localeCompare(String(a.id));
    });
  }, [blogsList, search, statusFilter, categoryFilter, sortBy]);

  // CREATE ACTION HANDLER
  const handleCreateBlog = () => {
    setSelectedBlog(null);
    setBlogModalMode("create");
    setBlogModalOpen(true);
  };

  // EDIT ACTION HANDLER
  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setBlogModalMode("edit");
    setBlogModalOpen(true);
    setActiveMenu(null);
  };

  // SUBMIT HANDLER (Handles both Create and Edit)
  const handleBlogSubmit = async (
    formData: BlogFormData,
    action: "draft" | "publish"
  ): Promise<void> => {
    if (blogModalMode === "create") {
      try {
        const created = await createBlog(formData);
        setBlogsList((prev) => [created, ...prev]);
      } catch (err) {
        console.warn("API create call failed, saving locally:", err);
        const newBlog: Blog = {
          id: String(Date.now()),
          ...formData,
          date: "Sep 25, 2026",
          readTime: "5 min read",
          image: formData.cover_image || undefined,
        };
        setBlogsList((prev) => [newBlog, ...prev]);
      }
    } else if (selectedBlog) {
      try {
        const updated = await updateBlog(selectedBlog.id, formData);
        setBlogsList((prev) =>
          prev.map((b) => (b.id === selectedBlog.id ? updated : b))
        );
      } catch (err) {
        console.warn("API update call failed, saving locally:", err);
        setBlogsList((prev) =>
          prev.map((b) =>
            b.id === selectedBlog.id
              ? {
                  ...b,
                  ...formData,
                  image: formData.cover_image || b.image,
                }
              : b
          )
        );
      }
    }
  };

  // DELETE HANDLER
  const handleConfirmDelete = async () => {
    if (!deleteTargetBlog) return;

    try {
      await deleteBlog(deleteTargetBlog.id);
    } catch (err) {
      console.warn("API delete call failed, removing locally:", err);
    }

    setBlogsList((prev) => prev.filter((b) => b.id !== deleteTargetBlog.id));
    setDeleteTargetBlog(null);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setSortBy("newest");
  };

  const hasActiveFilters =
    search.trim() !== "" || statusFilter !== "All" || categoryFilter !== "All";

  return (
    <div className="min-h-full pb-16">
      {/* ================================================= */}
      {/* 1. PAGE HEADER */}
      {/* ================================================= */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Header copy */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText size={12} strokeWidth={2.4} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  Content
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
                Blogs
              </h1>

              <p className="mt-1 text-sm text-muted">
                Create, manage and publish your latest content.
              </p>
            </div>

            {/* Primary CTA button */}
            <div>
              <button
                type="button"
                onClick={handleCreateBlog}
                className="
                  inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2
                  rounded-xl bg-primary px-4.5
                  text-sm font-semibold text-white
                  shadow-sm transition-all duration-200
                  hover:bg-primary-hover hover:shadow-md
                  active:scale-[0.98]
                "
              >
                <Plus size={16} strokeWidth={2.4} />
                <span>Create Blog</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* 2. SEARCH & FILTER TOOLBAR */}
      {/* ================================================= */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Search input */}
          <div className="relative w-full sm:max-w-xs md:max-w-sm">
            <Search
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blogs..."
              className="
                h-10 w-full
                rounded-xl
                border border-border
                bg-page/50
                pl-10 pr-9
                text-sm text-text
                placeholder:text-muted/60
                outline-none
                transition-all duration-200
                focus:border-primary
                focus:bg-surface
                focus:ring-4 focus:ring-primary/10
              "
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right: Filters & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status filter */}
            <div className="relative">
              <select
                aria-label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "All" | "published" | "draft")}
                className="
                  h-10 cursor-pointer appearance-none
                  rounded-xl
                  border border-border
                  bg-surface
                  pl-3.5 pr-8
                  text-xs font-semibold text-text
                  outline-none
                  transition-colors hover:border-border/80
                  focus:border-primary focus:ring-2 focus:ring-primary/15
                "
              >
                <option value="All">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>

            {/* Category filter */}
            <div className="relative">
              <select
                aria-label="Filter by Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="
                  h-10 cursor-pointer appearance-none
                  rounded-xl
                  border border-border
                  bg-surface
                  pl-3.5 pr-8
                  text-xs font-semibold text-text
                  outline-none
                  transition-colors hover:border-border/80
                  focus:border-primary focus:ring-2 focus:ring-primary/15
                "
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>

            {/* Sort control */}
            <div className="relative">
              <select
                aria-label="Sort blogs"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="
                  h-10 cursor-pointer appearance-none
                  rounded-xl
                  border border-border
                  bg-surface
                  pl-8 pr-8
                  text-xs font-semibold text-text
                  outline-none
                  transition-colors hover:border-border/80
                  focus:border-primary focus:ring-2 focus:ring-primary/15
                "
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title-asc">Title: A to Z</option>
                <option value="title-desc">Title: Z to A</option>
              </select>
              <ArrowUpDown
                size={13}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>

            {/* Reset filters shortcut */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset filters"
                className="
                  flex h-10 items-center gap-1.5
                  rounded-xl border border-border
                  bg-page
                  px-3
                  text-xs font-medium text-text
                  transition-colors hover:bg-page/80
                "
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Count summary bar */}
        <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted">
          <div>
            Showing <span className="font-semibold text-text">{filteredBlogs.length}</span>{" "}
            {filteredBlogs.length === 1 ? "article" : "articles"}
            {hasActiveFilters && " (filtered)"}
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-primary hover:underline font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </section>

      {/* ================================================= */}
      {/* 3. BLOG GRID */}
      {/* ================================================= */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredBlogs.map((blog) => {
              const isMenuOpen = activeMenu === blog.id;
              const displayImage = blog.cover_image || blog.image;
              const isPublished = blog.status === "published";

              return (
                <article
                  key={blog.id}
                  className="
                    group relative flex flex-col overflow-hidden
                    rounded-2xl
                    border border-border
                    bg-surface
                    shadow-[0_2px_8px_rgba(15,23,42,0.03)]
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-border/80
                    hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]
                  "
                >
                  {/* Image (16:9 Aspect Ratio) */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-page">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={blog.cover_image_alt || blog.title}
                        loading="lazy"
                        className="
                          h-full w-full object-cover
                          transition-transform duration-500 ease-out
                          group-hover:scale-[1.03]
                        "
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <FileText size={24} className="opacity-40" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/15 opacity-60" />

                    {/* Status Badge */}
                    <div className="absolute left-3.5 top-3.5 z-10 flex items-center gap-1.5">
                      <span
                        className={`
                          inline-flex items-center gap-1.5
                          rounded-full
                          px-2.5 py-1
                          text-[11px] font-semibold tracking-wide
                          backdrop-blur-md
                          shadow-sm
                          border
                          ${
                            isPublished
                              ? "border-emerald-300/30 bg-emerald-600/90 text-white"
                              : "border-white/20 bg-slate-900/65 text-slate-100"
                          }
                        `}
                      >
                        <span
                          className={`
                            h-1.5 w-1.5 rounded-full
                            ${isPublished ? "bg-white" : "bg-amber-400"}
                          `}
                        />
                        {isPublished ? "Published" : "Draft"}
                      </span>

                      {blog.is_featured && (
                        <span className="rounded-full border border-amber-300/30 bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md shadow-sm">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Action Menu Button & Dropdown */}
                    <div className="absolute right-3.5 top-3.5 z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(isMenuOpen ? null : blog.id);
                        }}
                        aria-label="Blog options"
                        className="
                          flex h-8 w-8
                          items-center justify-center
                          rounded-lg
                          border border-white/25
                          bg-black/35
                          text-white
                          shadow-sm
                          backdrop-blur-md
                          transition-all duration-200
                          hover:bg-black/60
                          active:scale-95
                        "
                      >
                        <MoreHorizontal size={16} strokeWidth={2.2} />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="
                            absolute right-0 top-10 z-30
                            w-36
                            overflow-hidden
                            rounded-xl
                            border border-border
                            bg-surface
                            p-1
                            shadow-[0_12px_30px_rgba(15,23,42,0.12)]
                            animate-in fade-in zoom-in-95 duration-150
                          "
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewTargetBlog(blog);
                              setActiveMenu(null);
                            }}
                            className="
                              flex w-full items-center gap-2.5
                              rounded-lg px-3 py-2
                              text-left text-xs font-medium
                              text-text
                              transition-colors
                              hover:bg-page
                            "
                          >
                            <Eye size={14} className="text-muted" />
                            <span>Preview</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditBlog(blog)}
                            className="
                              flex w-full items-center gap-2.5
                              rounded-lg px-3 py-2
                              text-left text-xs font-medium
                              text-text
                              transition-colors
                              hover:bg-page
                            "
                          >
                            <Pencil size={14} className="text-muted" />
                            <span>Edit</span>
                          </button>

                          <div className="my-1 border-t border-border" />

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTargetBlog(blog);
                              setActiveMenu(null);
                            }}
                            className="
                              flex w-full items-center gap-2.5
                              rounded-lg px-3 py-2
                              text-left text-xs font-medium
                              text-rose-600
                              transition-colors
                              hover:bg-rose-50
                            "
                          >
                            <Trash2 size={14} className="text-rose-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. CARD CONTENT */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Category */}
                    <div className="mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                        {blog.category || "General"}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      title={blog.title}
                      className="
                        line-clamp-2
                        min-h-[48px]
                        text-[16px]
                        font-semibold
                        leading-snug
                        tracking-[-0.01em]
                        text-text
                        transition-colors duration-200
                        group-hover:text-primary
                      "
                    >
                      {blog.title}
                    </h2>

                    {/* Excerpt */}
                    <p
                      title={blog.excerpt}
                      className="
                        mt-2
                        line-clamp-2
                        min-h-[40px]
                        text-[13px]
                        leading-relaxed
                        text-muted
                      "
                    >
                      {blog.excerpt}
                    </p>

                    {/* Bottom Metadata */}
                    <div className="mt-auto border-t border-border/80 pt-4">
                      <div className="flex items-center justify-between text-xs text-muted">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={13.5} className="text-muted" />
                          <span>{blog.date || "Sep 2026"}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock3 size={13.5} className="text-muted" />
                          <span>
                            {blog.readTime ||
                              `${blog.reading_time_minutes || 5} min read`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div
            className="
              flex min-h-[380px]
              flex-col items-center justify-center
              rounded-2xl
              border border-dashed border-border
              bg-surface
              px-6 py-12
              text-center
              shadow-sm
            "
          >
            <div
              className="
                mb-4 flex h-14 w-14
                items-center justify-center
                rounded-2xl
                bg-primary/10
                text-primary
              "
            >
              <FileText size={24} strokeWidth={2} />
            </div>

            <h3 className="text-base font-semibold text-text">
              No blogs found
            </h3>

            <p className="mt-1.5 max-w-sm text-sm text-muted">
              {hasActiveFilters
                ? "No articles match your active filters or search terms."
                : "Start creating content for your website."}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="
                    inline-flex items-center gap-2
                    rounded-xl border border-border
                    bg-surface px-4 py-2.5
                    text-xs font-semibold text-text
                    shadow-sm transition-all
                    hover:bg-page
                  "
                >
                  <RotateCcw size={14} />
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateBlog}
                  className="
                    inline-flex items-center gap-2
                    rounded-xl bg-primary px-4 py-2.5
                    text-xs font-semibold text-white
                    shadow-sm transition-all
                    hover:bg-primary-hover
                    active:scale-95
                  "
                >
                  <Plus size={15} strokeWidth={2.4} />
                  Create your first blog
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ================================================= */}
      {/* 4. UNIFIED BLOG MODAL (CREATE / EDIT) */}
      {/* ================================================= */}
      <BlogModal
        open={blogModalOpen}
        mode={blogModalMode}
        blog={selectedBlog}
        onClose={() => {
          setBlogModalOpen(false);
          setSelectedBlog(null);
        }}
        onSubmit={handleBlogSubmit}
      />

      {/* ================================================= */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ================================================= */}
      {deleteTargetBlog && (
        <div
          role="dialog"
          aria-modal="true"
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/45 p-4
            backdrop-blur-sm
            animate-in fade-in duration-150
          "
        >
          <div
            className="
              w-full max-w-md
              overflow-hidden
              rounded-2xl
              border border-border
              bg-surface
              p-6
              shadow-2xl
              animate-in zoom-in-95 duration-150
            "
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle size={20} strokeWidth={2.2} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-text">
                  Delete blog?
                </h3>
                <p className="mt-1.5 text-sm text-muted">
                  Are you sure you want to delete this blog? This action cannot be
                  undone.
                </p>

                <div className="mt-3 rounded-xl border border-border bg-page p-2.5 text-xs font-medium text-text">
                  "{deleteTargetBlog.title}"
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetBlog(null)}
                className="
                  rounded-xl
                  border border-border
                  bg-surface
                  px-4 py-2
                  text-xs font-semibold text-text
                  transition-colors hover:bg-page
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="
                  rounded-xl
                  bg-rose-600
                  px-4 py-2
                  text-xs font-semibold text-white
                  shadow-sm
                  transition-all hover:bg-rose-700
                  active:scale-95
                "
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* QUICK PREVIEW MODAL */}
      {/* ================================================= */}
      {previewTargetBlog && (
        <div
          role="dialog"
          aria-modal="true"
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/45 p-4
            backdrop-blur-sm
            animate-in fade-in duration-150
          "
        >
          <div
            className="
              relative w-full max-w-2xl
              overflow-hidden
              rounded-2xl
              border border-border
              bg-surface
              shadow-2xl
              animate-in zoom-in-95 duration-150
            "
          >
            {/* Header image preview */}
            <div className="relative aspect-[21/9] w-full bg-page">
              {previewTargetBlog.cover_image || previewTargetBlog.image ? (
                <img
                  src={previewTargetBlog.cover_image || previewTargetBlog.image}
                  alt={previewTargetBlog.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted">
                  <FileText size={32} className="opacity-30" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setPreviewTargetBlog(null)}
                className="
                  absolute right-3.5 top-3.5
                  flex h-8 w-8 items-center justify-center
                  rounded-full bg-black/50 text-white backdrop-blur-md
                  transition hover:bg-black/75
                "
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  {previewTargetBlog.category || "General"}
                </span>
                <span className="text-muted">•</span>
                <span
                  className={`
                    inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold
                    ${
                      previewTargetBlog.status === "published"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/15 text-muted"
                    }
                  `}
                >
                  {previewTargetBlog.status}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-text">
                {previewTargetBlog.title}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-muted">
                {previewTargetBlog.excerpt}
              </p>

              {previewTargetBlog.content && (
                <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-border bg-page p-3 text-xs leading-relaxed text-text">
                  {previewTargetBlog.content}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  <span>{previewTargetBlog.date || "Sep 2026"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock3 size={14} />
                  <span>
                    {previewTargetBlog.readTime ||
                      `${previewTargetBlog.reading_time_minutes || 5} min read`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t border-border bg-page/50 px-6 py-3.5">
              <button
                type="button"
                onClick={() => {
                  const b = previewTargetBlog;
                  setPreviewTargetBlog(null);
                  handleEditBlog(b);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Pencil size={13} />
                <span>Open in Editor</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTargetBlog(null)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text transition hover:bg-page"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}