"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Images, Plus } from "lucide-react";

import GalleryCard from "@/components/admin/galleries/GalleryCard";
import GalleryDeleteDialog from "@/components/admin/galleries/GalleryDeleteDialog";
import GalleryEmptyState from "@/components/admin/galleries/GalleryEmptyState";
import GalleryFilters, {
  type GalleryStatusFilter,
} from "@/components/admin/galleries/GalleryFilters";
import GalleryMediaManager from "@/components/admin/galleries/GalleryMediaManager";
import GalleryModal from "@/components/admin/galleries/GalleryModal";
import GallerySkeleton from "@/components/admin/galleries/GallerySkeleton";
import {
  Toaster,
  useToasts,
} from "@/components/admin/ui/Toast";

import {
  createGallery,
  deleteGallery,
  getGalleries,
  updateGallery,
  type Gallery,
  type GalleryFilters as GalleryQuery,
  type GalleryFormData,
} from "@/lib/api/galleries";
import { getApiErrorMessage } from "@/lib/api/errors";

const SEARCH_DEBOUNCE_MS = 400;

export default function GalleriesPage() {
  const { toasts, toastSuccess, toastError, dismissToast } =
    useToasts();

  // =========================================================
  // DATA
  // =========================================================

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<GalleryStatusFilter>("All");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Bumped after a create / edit / delete to re-run the same query.
  const [refreshToken, setRefreshToken] = useState(0);

  // =========================================================
  // UI
  // =========================================================

  const [activeMenu, setActiveMenu] = useState<
    string | null
  >(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "create" | "edit"
  >("create");
  const [selectedGallery, setSelectedGallery] =
    useState<Gallery | null>(null);

  const [mediaGallery, setMediaGallery] =
    useState<Gallery | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Gallery | null>(null);
  const [deleting, setDeleting] = useState(false);

  // =========================================================
  // SEARCH DEBOUNCE
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS
    );

    return () => clearTimeout(timer);
  }, [search]);

  // =========================================================
  // FETCH
  // =========================================================

  /**
   * Every filter is a query parameter — the backend does the filtering, this
   * page never narrows an already-loaded list.
   */
  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    const params: GalleryQuery = {
      search: debouncedSearch.trim() || undefined,

      is_published:
        statusFilter === "All"
          ? undefined
          : statusFilter === "published",

      event_date_from: dateFrom || undefined,
      event_date_to: dateTo || undefined,
    };

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getGalleries(params);

        // A slower earlier request must not overwrite a newer result.
        if (requestRef.current !== requestId) return;

        setGalleries(data);
      } catch (fetchError) {
        if (requestRef.current !== requestId) return;

        console.error(
          "Failed to fetch galleries:",
          fetchError
        );

        setError(
          getApiErrorMessage(
            fetchError,
            "Something went wrong while fetching the gallery data."
          )
        );
      } finally {
        if (requestRef.current === requestId) {
          setLoading(false);
        }
      }
    };

    run();
  }, [
    debouncedSearch,
    statusFilter,
    dateFrom,
    dateTo,
    refreshToken,
  ]);

  const refresh = useCallback(
    () => setRefreshToken((token) => token + 1),
    []
  );

  // =========================================================
  // MENU
  // =========================================================

  useEffect(() => {
    if (!activeMenu) return;

    const close = () => setActiveMenu(null);

    document.addEventListener("click", close);

    return () => document.removeEventListener("click", close);
  }, [activeMenu]);

  // =========================================================
  // FILTER HELPERS
  // =========================================================

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "All" ||
    dateFrom !== "" ||
    dateTo !== "";

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setDateFrom("");
    setDateTo("");
  };

  // =========================================================
  // CREATE / EDIT
  // =========================================================

  const handleCreate = () => {
    setSelectedGallery(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEdit = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setModalMode("edit");
    setModalOpen(true);
    setActiveMenu(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedGallery(null);
  };

  /**
   * Errors are re-thrown so the modal can render them inline and keep the
   * form open with the values intact.
   */
  const handleSubmit = async (data: GalleryFormData) => {
    if (modalMode === "create") {
      await createGallery(data);

      closeModal();
      refresh();

      toastSuccess(
        "Gallery created",
        `"${data.title}" is ready for media.`
      );

      return;
    }

    if (!selectedGallery) return;

    // PATCH carries only what actually changed.
    const changes: Partial<GalleryFormData> = {};

    if (data.title !== selectedGallery.title) {
      changes.title = data.title;
    }

    if (data.slug !== selectedGallery.slug) {
      changes.slug = data.slug;
    }

    if (
      data.description !==
      (selectedGallery.description ?? null)
    ) {
      changes.description = data.description;
    }

    if (
      data.event_date !==
      (selectedGallery.event_date
        ? selectedGallery.event_date.slice(0, 10)
        : null)
    ) {
      changes.event_date = data.event_date;
    }

    if (
      data.is_published !== selectedGallery.is_published
    ) {
      changes.is_published = data.is_published;
    }

    if (Object.keys(changes).length === 0) {
      closeModal();
      return;
    }

    await updateGallery(selectedGallery.id, changes);

    closeModal();
    refresh();

    toastSuccess(
      "Gallery updated",
      `"${data.title}" has been saved.`
    );
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    try {
      setDeleting(true);

      await deleteGallery(deleteTarget.id);

      const title = deleteTarget.title;

      setDeleteTarget(null);
      refresh();

      toastSuccess(
        "Gallery deleted",
        `"${title}" and its media were removed.`
      );
    } catch (deleteError) {
      console.error(
        "Failed to delete gallery:",
        deleteError
      );

      toastError(
        "Could not delete gallery",
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
      {/* Header */}
      <section className="border-b border-border bg-surface">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Images size={12} />
                </span>

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  Content
                </span>
              </div>

              <h1 className="text-2xl font-bold text-text sm:text-3xl">
                Media Gallery
              </h1>

              <p className="mt-1 text-sm text-muted">
                Manage event galleries and their photos and
                videos.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Plus size={16} />
              Add Gallery
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <GalleryFilters
        search={search}
        statusFilter={statusFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        resultCount={galleries.length}
        hasActiveFilters={hasFilters}
        loading={loading}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onReset={resetFilters}
      />

      {/* Grid */}
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        {loading ? (
          <GallerySkeleton />
        ) : !error && galleries.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {galleries.map((gallery) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                isMenuOpen={activeMenu === gallery.id}
                onMenuToggle={() =>
                  setActiveMenu(
                    activeMenu === gallery.id
                      ? null
                      : gallery.id
                  )
                }
                onEdit={() => handleEdit(gallery)}
                onManageMedia={() => {
                  setMediaGallery(gallery);
                  setActiveMenu(null);
                }}
                onDelete={() => {
                  setDeleteTarget(gallery);
                  setActiveMenu(null);
                }}
              />
            ))}
          </div>
        ) : (
          <GalleryEmptyState
            error={error}
            hasFilters={hasFilters}
            onRetry={refresh}
            onResetFilters={resetFilters}
            onCreate={handleCreate}
          />
        )}
      </section>

      {/* Create / Edit */}
      <GalleryModal
        open={modalOpen}
        mode={modalMode}
        gallery={selectedGallery}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {/* Media */}
      <GalleryMediaManager
        gallery={mediaGallery}
        onClose={() => setMediaGallery(null)}
        onChanged={refresh}
        onNotifySuccess={toastSuccess}
        onNotifyError={toastError}
      />

      {/* Delete */}
      <GalleryDeleteDialog
        gallery={deleteTarget}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
