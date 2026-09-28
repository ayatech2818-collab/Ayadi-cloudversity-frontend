"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CloudUpload,
  Images,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";

import {
  createGalleryItem,
  deleteGalleryItem,
  getGalleryItems,
  updateGalleryItem,
  type Gallery,
  type GalleryItem,
} from "@/lib/api/galleries";
import { getApiErrorMessage } from "@/lib/api/errors";

import GalleryMediaGrid from "./GalleryMediaGrid";
import {
  countMedia,
  describeMedia,
  formatEventDate,
  sortByDisplayOrder,
} from "./gallery-utils";

interface GalleryMediaManagerProps {
  gallery: Gallery | null;
  onClose: () => void;
  /** Fired once on close if anything changed, so the list can re-fetch. */
  onChanged: () => void;
  onNotifySuccess: (
    title: string,
    description?: string
  ) => void;
  onNotifyError: (
    title: string,
    description?: string
  ) => void;
}

const ACCEPTED = "image/*,video/*";

export default function GalleryMediaManager({
  gallery,
  onClose,
  onChanged,
  onNotifySuccess,
  onNotifyError,
}: GalleryMediaManagerProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    done: 0,
    total: 0,
  });

  const [busyItemId, setBusyItemId] = useState<
    string | null
  >(null);

  const [dragActive, setDragActive] = useState(false);

  const [pendingDelete, setPendingDelete] =
    useState<GalleryItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tracked so the list only re-fetches when something actually moved.
  const dirtyRef = useRef(false);

  const galleryId = gallery?.id ?? null;

  // Bumped by Retry to re-run the fetch for the same gallery.
  const [reloadToken, setReloadToken] = useState(0);

  const [syncedGalleryId, setSyncedGalleryId] = useState<
    string | null
  >(null);

  // Opening a different gallery resets the panel during render rather than in
  // an effect, so the first paint never shows the previous gallery media.
  if (syncedGalleryId !== galleryId) {
    setSyncedGalleryId(galleryId);

    setItems([]);
    setError(null);
    // Pre-armed so the skeleton shows on the first paint, not after the fetch
    // effect has had a chance to run.
    setLoading(galleryId !== null);
    setPendingDelete(null);
    setBusyItemId(null);
    setUploading(false);
    setUploadProgress({ done: 0, total: 0 });
  }

  useEffect(() => {
    dirtyRef.current = false;
  }, [galleryId]);

  useEffect(() => {
    if (!galleryId) return;

    let cancelled = false;

    const run = async () => {
      try {
        const data = await getGalleryItems(galleryId);

        if (cancelled) return;

        setItems(sortByDisplayOrder(data));
      } catch (loadError) {
        if (cancelled) return;

        console.error(
          "Failed to fetch gallery items:",
          loadError
        );

        setError(
          getApiErrorMessage(
            loadError,
            "Something went wrong while fetching this gallery media."
          )
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [galleryId, reloadToken]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  };

  const handleClose = () => {
    if (uploading || busyItemId) return;

    if (dirtyRef.current) {
      onChanged();
    }

    onClose();
  };

  // =========================================================
  // UPLOAD
  // =========================================================

  const handleUpload = async (files: FileList | File[]) => {
    if (!galleryId) return;

    const list = Array.from(files).filter((file) =>
      /^(image|video)\//.test(file.type)
    );

    if (list.length === 0) {
      onNotifyError(
        "Unsupported file",
        "Only images and videos can be added to a gallery."
      );
      return;
    }

    setUploading(true);
    setUploadProgress({ done: 0, total: list.length });

    const nextOrderStart = items.reduce(
      (highest, item) =>
        Math.max(highest, item.display_order + 1),
      0
    );

    const uploaded: GalleryItem[] = [];

    try {
      // Sequential: the backend assigns ordering per request, and a burst of
      // parallel uploads would race for the same display_order.
      for (let index = 0; index < list.length; index += 1) {
        const created = await createGalleryItem(galleryId, {
          file: list[index],
          display_order: nextOrderStart + index,
        });

        uploaded.push(created);

        setUploadProgress({
          done: index + 1,
          total: list.length,
        });
      }

      dirtyRef.current = true;

      setItems((current) =>
        sortByDisplayOrder([...current, ...uploaded])
      );

      onNotifySuccess(
        uploaded.length === 1
          ? "Media uploaded"
          : `${uploaded.length} files uploaded`,
        `Added to ${gallery?.title ?? "the gallery"}.`
      );
    } catch (uploadError) {
      console.error(
        "Failed to upload gallery media:",
        uploadError
      );

      if (uploaded.length > 0) {
        dirtyRef.current = true;

        setItems((current) =>
          sortByDisplayOrder([...current, ...uploaded])
        );
      }

      onNotifyError(
        "Upload failed",
        getApiErrorMessage(uploadError)
      );
    } finally {
      setUploading(false);
      setUploadProgress({ done: 0, total: 0 });
    }
  };

  // =========================================================
  // REORDER
  // =========================================================

  const handleMove = async (
    item: GalleryItem,
    direction: -1 | 1
  ) => {
    if (!galleryId) return;

    const currentIndex = items.findIndex(
      (candidate) => candidate.id === item.id
    );

    const targetIndex = currentIndex + direction;

    if (
      currentIndex === -1 ||
      targetIndex < 0 ||
      targetIndex >= items.length
    ) {
      return;
    }

    const previous = items;

    const reordered = [...items];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    // Normalising to 0..n-1 also repairs galleries whose items were all
    // stored with the same display_order.
    const normalised = reordered.map((entry, index) => ({
      ...entry,
      display_order: index,
    }));

    const changed = normalised.filter((entry, index) => {
      const original = previous.find(
        (candidate) => candidate.id === entry.id
      );

      return original?.display_order !== index;
    });

    setItems(normalised);
    setBusyItemId(item.id);

    try {
      await Promise.all(
        changed.map((entry) =>
          updateGalleryItem(galleryId, entry.id, {
            display_order: entry.display_order,
          })
        )
      );

      dirtyRef.current = true;
    } catch (moveError) {
      console.error(
        "Failed to reorder gallery media:",
        moveError
      );

      setItems(previous);

      onNotifyError(
        "Could not reorder media",
        getApiErrorMessage(moveError)
      );
    } finally {
      setBusyItemId(null);
    }
  };

  // =========================================================
  // ALT TEXT
  // =========================================================

  const handleAltTextSave = async (
    item: GalleryItem,
    altText: string
  ) => {
    if (!galleryId) return;

    setBusyItemId(item.id);

    try {
      const updated = await updateGalleryItem(
        galleryId,
        item.id,
        { alt_text: altText || null }
      );

      dirtyRef.current = true;

      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id ? updated : candidate
        )
      );

      onNotifySuccess("Alt text saved");
    } catch (altError) {
      console.error(
        "Failed to update alt text:",
        altError
      );

      onNotifyError(
        "Could not save alt text",
        getApiErrorMessage(altError)
      );
    } finally {
      setBusyItemId(null);
    }
  };

  // =========================================================
  // REPLACE
  // =========================================================

  const handleReplace = async (
    item: GalleryItem,
    file: File
  ) => {
    if (!galleryId) return;

    if (!/^(image|video)\//.test(file.type)) {
      onNotifyError(
        "Unsupported file",
        "Only images and videos can be added to a gallery."
      );
      return;
    }

    setBusyItemId(item.id);

    try {
      const updated = await updateGalleryItem(
        galleryId,
        item.id,
        { file }
      );

      dirtyRef.current = true;

      setItems((current) =>
        sortByDisplayOrder(
          current.map((candidate) =>
            candidate.id === item.id ? updated : candidate
          )
        )
      );

      onNotifySuccess("Media replaced");
    } catch (replaceError) {
      console.error(
        "Failed to replace gallery media:",
        replaceError
      );

      onNotifyError(
        "Could not replace media",
        getApiErrorMessage(replaceError)
      );
    } finally {
      setBusyItemId(null);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteConfirmed = async () => {
    if (!galleryId || !pendingDelete) return;

    setBusyItemId(pendingDelete.id);

    try {
      await deleteGalleryItem(
        galleryId,
        pendingDelete.id
      );

      dirtyRef.current = true;

      setItems((current) =>
        current.filter(
          (candidate) => candidate.id !== pendingDelete.id
        )
      );

      setPendingDelete(null);

      onNotifySuccess("Media deleted");
    } catch (deleteError) {
      console.error(
        "Failed to delete gallery media:",
        deleteError
      );

      onNotifyError(
        "Could not delete media",
        getApiErrorMessage(deleteError)
      );
    } finally {
      setBusyItemId(null);
    }
  };

  if (!gallery) return null;

  const counts = countMedia(items);
  const eventDate = formatEventDate(gallery.event_date);
  const locked = uploading || busyItemId !== null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-media-title"
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50 p-3 backdrop-blur-sm sm:p-5 md:p-6
      "
    >
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-surface text-text shadow-2xl">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-surface px-6 py-4.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Images size={20} strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <h2
                id="gallery-media-title"
                className="truncate text-lg font-semibold tracking-tight text-text"
              >
                {gallery.title}
              </h2>

              <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={12} />
                  {eventDate ?? "No event date"}
                </span>

                <span className="text-border">|</span>

                <span>{describeMedia(counts)}</span>

                <span
                  className={`
                    rounded-full px-2 py-0.5 text-[10px] font-semibold
                    ${
                      gallery.is_published
                        ? "bg-primary/10 text-primary"
                        : "bg-page text-muted"
                    }
                  `}
                >
                  {gallery.is_published
                    ? "Published"
                    : "Draft"}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={locked}
            aria-label="Close"
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-xl border border-border text-muted
              transition-colors hover:bg-page hover:text-text
              disabled:opacity-50
            "
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* ================================================= */}
        {/* BODY */}
        {/* ================================================= */}

        <div className="flex-1 space-y-5 overflow-y-auto p-6 sm:p-7">
          {/* Upload */}
          <div
            onDragOver={(event) => {
              event.preventDefault();

              if (!locked) setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);

              if (locked) return;

              if (event.dataTransfer.files?.length) {
                handleUpload(event.dataTransfer.files);
              }
            }}
            className={`
              flex flex-col items-center justify-center gap-2
              rounded-2xl border-2 border-dashed px-6 py-8 text-center
              transition-colors
              ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-page/40"
              }
            `}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {uploading ? (
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              ) : (
                <CloudUpload size={20} />
              )}
            </span>

            {uploading ? (
              <>
                <p className="text-sm font-semibold text-text">
                  Uploading {uploadProgress.done} of{" "}
                  {uploadProgress.total}
                </p>

                <div className="mt-1 h-1.5 w-56 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{
                      width: `${
                        uploadProgress.total === 0
                          ? 0
                          : (uploadProgress.done /
                              uploadProgress.total) *
                            100
                      }%`,
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-text">
                  Drop photos or videos here
                </p>

                <p className="text-xs text-muted">
                  Images and videos, several at a time.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED}
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files?.length) {
                      handleUpload(event.target.files);
                    }

                    event.target.value = "";
                  }}
                />

                <button
                  type="button"
                  disabled={locked}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="
                    mt-2 inline-flex items-center gap-2
                    rounded-xl bg-primary px-4 py-2.5
                    text-xs font-semibold text-white
                    transition-colors hover:bg-primary-hover
                    disabled:cursor-not-allowed disabled:opacity-50
                  "
                >
                  <CloudUpload size={14} />
                  Select files
                </button>
              </>
            )}
          </div>

          {/* Media */}
          {loading ? (
            <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <li
                  key={index}
                  aria-hidden="true"
                  className="overflow-hidden rounded-xl border border-border bg-surface"
                >
                  <div className="aspect-[4/3] w-full animate-pulse bg-page" />

                  <div className="space-y-2 p-3">
                    <div className="h-2.5 w-3/4 animate-pulse rounded bg-page" />
                    <div className="h-8 w-full animate-pulse rounded-lg bg-page" />
                  </div>
                </li>
              ))}
            </ul>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle size={20} />
              </div>

              <h3 className="text-sm font-semibold text-text">
                Unable to load media.
              </h3>

              <p className="mt-1 max-w-sm text-xs text-muted">
                {error}
              </p>

              <button
                type="button"
                onClick={handleRetry}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                <RotateCcw size={13} />
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Images size={20} />
              </div>

              <h3 className="text-sm font-semibold text-text">
                No media in this gallery
              </h3>

              <p className="mt-1 max-w-sm text-xs text-muted">
                Upload photos and videos to bring this event
                gallery to life.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-0.5">
                <p className="text-xs font-semibold text-text">
                  Media
                  <span className="ml-1.5 font-normal text-muted">
                    ordered as shown on the website
                  </span>
                </p>

                <span className="text-[11px] text-muted">
                  {describeMedia(counts)}
                </span>
              </div>

              <GalleryMediaGrid
                items={items}
                busyItemId={busyItemId}
                disabled={locked}
                onMove={handleMove}
                onAltTextSave={handleAltTextSave}
                onReplace={handleReplace}
                onDelete={(item) => setPendingDelete(item)}
              />
            </>
          )}
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-page/40 px-6 py-4">
          <p className="text-[11px] text-muted">
            The first item is used as the gallery cover.
          </p>

          <button
            type="button"
            onClick={handleClose}
            disabled={locked}
            className="
              rounded-xl border border-border bg-surface
              px-4 py-2.5 text-xs font-semibold text-text
              transition-colors hover:bg-page
              disabled:opacity-50
            "
          >
            Done
          </button>
        </div>

        {/* ================================================= */}
        {/* DELETE MEDIA CONFIRMATION */}
        {/* ================================================= */}

        {pendingDelete && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <AlertTriangle size={18} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text">
                    Delete this media?
                  </h3>

                  <p className="mt-1 text-xs text-muted">
                    It will be removed from the gallery
                    permanently.
                  </p>

                  <p className="mt-2 truncate rounded-lg border border-border bg-page px-2.5 py-1.5 text-[11px] font-medium text-text">
                    {pendingDelete.file_name}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  disabled={busyItemId !== null}
                  className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text hover:bg-page disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirmed}
                  disabled={busyItemId !== null}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyItemId !== null && (
                    <Loader2
                      size={12}
                      className="animate-spin"
                    />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
