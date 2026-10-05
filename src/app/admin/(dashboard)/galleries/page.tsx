"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import GalleriesHeader from "@/components/admin/galleries/GalleriesHeader";
import GalleryCard from "@/components/admin/galleries/GalleryCard";
import GalleryDeleteDialog from "@/components/admin/galleries/GalleryDeleteDialog";
import GalleryEmptyState from "@/components/admin/galleries/GalleryEmptyState";
import GalleryFilters from "@/components/admin/galleries/GalleryFilters";
import GalleryMediaManager from "@/components/admin/galleries/GalleryMediaManager";
import GalleryModal from "@/components/admin/galleries/GalleryModal";
import GallerySkeleton from "@/components/admin/galleries/GallerySkeleton";
import {
  GALLERIES_GRID,
  type GalleryStatusFilter,
} from "@/components/admin/galleries/gallery-utils";
import { Toaster, useToasts } from "@/components/admin/ui/Toast";

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

  // Every gallery, ignoring the filters — what the header counts.
  const [allGalleries, setAllGalleries] = useState<
    Gallery[] | null
  >(null);

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<GalleryStatusFilter>("All");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Bumped after a create / edit / delete to re-run the same queries.
  const [refreshToken, setRefreshToken] = useState(0);

  // =========================================================
  // UI
  // =========================================================

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [selectedGallery, setSelectedGallery] =
    useState<Gallery | null>(null);

  const [mediaGallery, setMediaGallery] = useState<Gallery | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = useState<Gallery | null>(
    null
  );
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

        console.error("Failed to fetch galleries:", fetchError);

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
  }, [debouncedSearch, statusFilter, dateFrom, dateTo, refreshToken]);

  // The header counts need the unfiltered list, so it is fetched on its own.
  useEffect(() => {
    let cancelled = false;

    getGalleries()
      .then((data) => {
        if (!cancelled) setAllGalleries(data);
      })
      .catch((statsError) =>
        console.error("Failed to fetch gallery counts:", statsError)
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
      data.description !== (selectedGallery.description ?? null)
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

    if (data.is_published !== selectedGallery.is_published) {
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
      console.error("Failed to delete gallery:", deleteError);

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

  // The skeleton is for the first load only; after that the cards stay on
  // screen, dimmed, while a new result is on its way.
  const showSkeleton = loading && galleries.length === 0;

  return (
    <div className="min-h-full pb-16">
      <GalleriesHeader
        galleries={allGalleries}
        onCreate={handleCreate}
      />

      <GalleryFilters
        search={search}
        statusFilter={statusFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        resultCount={galleries.length}
        hasActiveFilters={hasFilters}
        loading={showSkeleton}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onReset={resetFilters}
      />

      {/* Grid */}
      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        {showSkeleton ? (
          <GallerySkeleton />
        ) : !error && galleries.length > 0 ? (
          <div
            aria-busy={loading}
            className={`${GALLERIES_GRID} transition-opacity duration-200 ${
              loading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {galleries.map((gallery) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                onEdit={() => handleEdit(gallery)}
                onManageMedia={() => setMediaGallery(gallery)}
                onDelete={() => setDeleteTarget(gallery)}
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
