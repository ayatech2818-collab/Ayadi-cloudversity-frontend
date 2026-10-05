import { useEffect, useRef, useState } from "react";

import {
  createGalleryItem,
  deleteGalleryItem,
  getGalleryItems,
  updateGalleryItem,
  type Gallery,
  type GalleryItem,
} from "@/lib/api/galleries";
import { getApiErrorMessage } from "@/lib/api/errors";

import {
  isGalleryMedia,
  sortByDisplayOrder,
} from "./gallery-utils";

type Notify = (title: string, description?: string) => void;

/**
 * Everything the media manager does to one gallery's items: load them, upload
 * new ones, reorder, edit alt text, replace a file and delete. The component
 * that calls it only has to draw the result.
 */
export function useGalleryMedia(
  gallery: Gallery,
  notifySuccess: Notify,
  notifyError: Notify
) {
  const galleryId = gallery.id;

  const [items, setItems] = useState<GalleryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bumped by Retry to re-run the fetch.
  const [reloadToken, setReloadToken] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    done: 0,
    total: 0,
  });

  /** The single item currently being mutated, if any. */
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  // Tracked so the gallery list only re-fetches when something actually moved.
  const dirtyRef = useRef(false);

  // =========================================================
  // LOAD
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const data = await getGalleryItems(galleryId);

        if (cancelled) return;

        setItems(sortByDisplayOrder(data));
      } catch (loadError) {
        if (cancelled) return;

        console.error("Failed to fetch gallery items:", loadError);

        setError(
          getApiErrorMessage(
            loadError,
            "Something went wrong while fetching this gallery media."
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
  }, [galleryId, reloadToken]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  };

  // =========================================================
  // UPLOAD
  // =========================================================

  const upload = async (files: File[]) => {
    const list = files.filter(isGalleryMedia);

    if (list.length === 0) {
      notifyError(
        "Unsupported file",
        "Only images and videos can be added to a gallery."
      );
      return;
    }

    setUploading(true);
    setUploadProgress({ done: 0, total: list.length });

    const nextOrderStart = items.reduce(
      (highest, item) => Math.max(highest, item.display_order + 1),
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

        setUploadProgress({ done: index + 1, total: list.length });
      }

      dirtyRef.current = true;

      setItems((current) =>
        sortByDisplayOrder([...current, ...uploaded])
      );

      notifySuccess(
        uploaded.length === 1
          ? "Media uploaded"
          : `${uploaded.length} files uploaded`,
        `Added to ${gallery.title}.`
      );
    } catch (uploadError) {
      console.error("Failed to upload gallery media:", uploadError);

      // Whatever made it up before the failure is kept.
      if (uploaded.length > 0) {
        dirtyRef.current = true;

        setItems((current) =>
          sortByDisplayOrder([...current, ...uploaded])
        );
      }

      notifyError("Upload failed", getApiErrorMessage(uploadError));
    } finally {
      setUploading(false);
      setUploadProgress({ done: 0, total: 0 });
    }
  };

  // =========================================================
  // REORDER
  // =========================================================

  const move = async (item: GalleryItem, direction: -1 | 1) => {
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
      console.error("Failed to reorder gallery media:", moveError);

      setItems(previous);

      notifyError(
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

  const saveAltText = async (item: GalleryItem, altText: string) => {
    setBusyItemId(item.id);

    try {
      const updated = await updateGalleryItem(galleryId, item.id, {
        alt_text: altText || null,
      });

      dirtyRef.current = true;

      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id ? updated : candidate
        )
      );

      notifySuccess("Alt text saved");
    } catch (altError) {
      console.error("Failed to update alt text:", altError);

      notifyError(
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

  const replace = async (item: GalleryItem, file: File) => {
    if (!isGalleryMedia(file)) {
      notifyError(
        "Unsupported file",
        "Only images and videos can be added to a gallery."
      );
      return;
    }

    setBusyItemId(item.id);

    try {
      const updated = await updateGalleryItem(galleryId, item.id, {
        file,
      });

      dirtyRef.current = true;

      setItems((current) =>
        sortByDisplayOrder(
          current.map((candidate) =>
            candidate.id === item.id ? updated : candidate
          )
        )
      );

      notifySuccess("Media replaced");
    } catch (replaceError) {
      console.error("Failed to replace gallery media:", replaceError);

      notifyError(
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

  /** Resolves to true once the item is gone, false if the request failed. */
  const remove = async (item: GalleryItem): Promise<boolean> => {
    setBusyItemId(item.id);

    try {
      await deleteGalleryItem(galleryId, item.id);

      dirtyRef.current = true;

      setItems((current) =>
        current.filter((candidate) => candidate.id !== item.id)
      );

      notifySuccess("Media deleted");

      return true;
    } catch (deleteError) {
      console.error("Failed to delete gallery media:", deleteError);

      notifyError(
        "Could not delete media",
        getApiErrorMessage(deleteError)
      );

      return false;
    } finally {
      setBusyItemId(null);
    }
  };

  return {
    items,
    loading,
    error,
    uploading,
    uploadProgress,
    busyItemId,

    /** One mutation at a time keeps display_order deterministic. */
    locked: uploading || busyItemId !== null,

    /** True once anything was uploaded, changed or deleted. */
    hasChanged: () => dirtyRef.current,

    retry,
    upload,
    move,
    saveAltText,
    replace,
    remove,
  };
}
