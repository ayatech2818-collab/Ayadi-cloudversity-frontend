"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  EnquiriesSkeleton,
  EnquiryCard,
  EnquiryDeleteDialog,
  EnquiryDetailModal,
  EnquiryEmptyState,
  EnquiryFilters,
  EnquiryHeader,
} from "@/components/admin/enquiries";
import {
  ENQUIRY_GRID,
  ENQUIRY_STATUS_LABELS,
  countEnquiries,
  getEnquiryName,
  type EnquirySortOption,
  type EnquiryStatusFilter,
  type EnquiryTypeFilter,
} from "@/components/admin/enquiries/enquiry-utils";
import { Toaster, useToasts } from "@/components/admin/ui/Toast";

import {
  deleteEnquiry,
  getEnquiries,
  updateEnquiry,
  type Enquiry,
  type EnquiryStatus,
} from "@/lib/api/enquiry";
import { getApiErrorMessage } from "@/lib/api/errors";

const SEARCH_DEBOUNCE_MS = 400;

export default function EnquiryPage() {
  const { toasts, toastSuccess, toastError, dismissToast } =
    useToasts();

  // =========================================================
  // DATA
  // =========================================================

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Every enquiry, ignoring the filters. It is only ever counted — for the
  // header and the status tabs — and never listed.
  const [allEnquiries, setAllEnquiries] = useState<Enquiry[] | null>(
    null
  );

  // Bumped by "Refresh" and after a status change or delete to ask again.
  const [refreshToken, setRefreshToken] = useState(0);

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState<EnquiryTypeFilter>("All");
  const [statusFilter, setStatusFilter] =
    useState<EnquiryStatusFilter>("All");
  const [sortBy, setSortBy] = useState<EnquirySortOption>("newest");

  // =========================================================
  // UI
  // =========================================================

  const [selectedEnquiry, setSelectedEnquiry] =
    useState<Enquiry | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(
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
   * Every filter is a query parameter — the backend does the searching,
   * filtering and sorting, and this page never narrows a loaded list.
   */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getEnquiries({
          search: debouncedSearch.trim() || undefined,
          type: typeFilter === "All" ? undefined : typeFilter,
          status: statusFilter === "All" ? undefined : statusFilter,
          sort_by: sortBy,
        });

        // A slower earlier request must not overwrite a newer result.
        if (cancelled) return;

        setEnquiries(data);
      } catch (fetchError) {
        if (cancelled) return;

        console.error("Failed to fetch enquiries:", fetchError);

        setError(
          getApiErrorMessage(
            fetchError,
            "Something went wrong while fetching enquiries."
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
  }, [debouncedSearch, typeFilter, statusFilter, sortBy, refreshToken]);

  // The counts need the unfiltered list, so it is fetched on its own.
  useEffect(() => {
    let cancelled = false;

    getEnquiries()
      .then((data) => {
        if (!cancelled) setAllEnquiries(data);
      })
      .catch((statsError) =>
        console.error("Failed to fetch enquiry counts:", statsError)
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
  // COUNTS
  // =========================================================

  const counts = useMemo(
    () => allEnquiries && countEnquiries(allEnquiries),
    [allEnquiries]
  );

  // The status tabs count within the chosen type, so they match the grid.
  const statusCounts = useMemo(
    () =>
      allEnquiries &&
      countEnquiries(
        allEnquiries,
        typeFilter === "All" ? undefined : typeFilter
      ),
    [allEnquiries, typeFilter]
  );

  // =========================================================
  // FILTER HELPERS
  // =========================================================

  const hasFilters =
    search.trim() !== "" ||
    typeFilter !== "All" ||
    statusFilter !== "All";

  const changeSearch = (value: string) => {
    setSearch(value);

    // Clearing the box takes effect at once instead of after the pause.
    if (!value) setDebouncedSearch("");
  };

  const resetFilters = () => {
    changeSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
    setSortBy("newest");
  };

  // =========================================================
  // STATUS
  // =========================================================

  /**
   * Errors are left to throw so the dialog can show them next to the status
   * it failed to save.
   */
  const handleStatusChange = async (status: EnquiryStatus) => {
    if (!selectedEnquiry) return;

    const updated = await updateEnquiry(selectedEnquiry.id, { status });

    // The dialog shows the saved enquiry — unless it was closed meanwhile.
    setSelectedEnquiry((current) =>
      current?.id === updated.id ? updated : current
    );

    toastSuccess(
      "Status updated",
      `${getEnquiryName(updated)} is now marked ${ENQUIRY_STATUS_LABELS[
        updated.status
      ].toLowerCase()}.`
    );

    refresh();
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    try {
      setDeleting(true);

      await deleteEnquiry(deleteTarget.id);

      toastSuccess(
        "Enquiry deleted",
        `The enquiry from ${getEnquiryName(deleteTarget)} was removed.`
      );

      setDeleteTarget(null);
      setSelectedEnquiry(null);
      refresh();
    } catch (deleteError) {
      console.error("Failed to delete enquiry:", deleteError);

      toastError(
        "Could not delete enquiry",
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
  const showSkeleton = loading && enquiries.length === 0;

  return (
    <div className="min-h-full pb-16">
      <EnquiryHeader
        counts={counts}
        refreshing={loading}
        onRefresh={refresh}
      />

      <EnquiryFilters
        search={search}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        sortBy={sortBy}
        statusCounts={statusCounts}
        resultCount={enquiries.length}
        hasActiveFilters={hasFilters}
        loading={showSkeleton}
        onSearchChange={changeSearch}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
        onSortChange={setSortBy}
        onReset={resetFilters}
      />

      {/* Grid */}
      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        {showSkeleton ? (
          <EnquiriesSkeleton />
        ) : !error && enquiries.length > 0 ? (
          <div
            aria-busy={loading}
            className={`${ENQUIRY_GRID} transition-opacity duration-200 ${
              loading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {enquiries.map((enquiry) => (
              <EnquiryCard
                key={enquiry.id}
                enquiry={enquiry}
                onView={() => setSelectedEnquiry(enquiry)}
                onDelete={() => setDeleteTarget(enquiry)}
              />
            ))}
          </div>
        ) : (
          <EnquiryEmptyState
            error={error}
            hasFilters={hasFilters}
            onRetry={refresh}
            onResetFilters={resetFilters}
          />
        )}
      </section>

      {/* View */}
      <EnquiryDetailModal
        enquiry={selectedEnquiry}
        locked={deleteTarget !== null}
        onClose={() => setSelectedEnquiry(null)}
        onStatusChange={handleStatusChange}
        onDelete={() => setDeleteTarget(selectedEnquiry)}
      />

      {/* Delete */}
      <EnquiryDeleteDialog
        enquiry={deleteTarget}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
