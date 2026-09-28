import { api } from "./client";

export type GalleryMediaType = "image" | "video";

export interface GalleryItem {
  id: string;
  gallery_id: string;
  file_name: string;
  file_url: string;
  media_type: GalleryMediaType;
  mime_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_date: string | null;
  is_published: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  items: GalleryItem[];

  /**
   * RESERVED — the backend does not return a gallery cover yet, so this is
   * always undefined today. Declared optional so `resolveGalleryCover` can
   * prefer it the moment the field ships, with no change anywhere else.
   *
   * `GalleryFormData` deliberately does NOT carry a cover: nothing is sent
   * until there is an endpoint to send it to.
   */
  cover_image_url?: string | null;
}

export interface GalleryFilters {
  search?: string;
  is_published?: boolean;
  event_date_from?: string;
  event_date_to?: string;
}

export interface GalleryFormData {
  title: string;
  slug: string;
  description: string | null;
  event_date: string | null;
  is_published: boolean;
}

/**
 * Data used when updating an existing gallery item.
 *
 * The backend PATCH endpoint accepts:
 * - file
 * - alt_text
 * - display_order
 */
export interface GalleryItemUpdateData {
  file?: File | null;
  alt_text?: string | null;
  display_order?: number;
}

export interface GalleryItemFormData {
  file?: File | null;
  alt_text?: string | null;
  display_order?: number;
}

/**
 * Build multipart/form-data for updating an existing gallery item.
 */
const buildGalleryItemUpdateFormData = (
  data: GalleryItemUpdateData
): FormData => {
  const formData = new FormData();

  if (data.file) {
    formData.append("file", data.file);
  }

  if (data.alt_text !== undefined) {
    formData.append("alt_text", data.alt_text ?? "");
  }

  if (data.display_order !== undefined) {
    formData.append(
      "display_order",
      String(data.display_order)
    );
  }

  return formData;
};

// =========================================================
// GALLERIES
// =========================================================

export const getGalleries = async (
  filters?: GalleryFilters
): Promise<Gallery[]> => {
  const response = await api.get<Gallery[]>("/galleries", {
    params: filters,
  });

  return response.data;
};

export const getGallery = async (
  galleryId: string
): Promise<Gallery> => {
  const response = await api.get<Gallery>(
    `/galleries/${galleryId}`
  );

  return response.data;
};

export const createGallery = async (
  data: GalleryFormData
): Promise<Gallery> => {
  const response = await api.post<Gallery>(
    "/galleries",
    data
  );

  return response.data;
};

/**
 * Partial update by design.
 */
export const updateGallery = async (
  galleryId: string,
  data: Partial<GalleryFormData>
): Promise<Gallery> => {
  const response = await api.patch<Gallery>(
    `/galleries/${galleryId}`,
    data
  );

  return response.data;
};

export const deleteGallery = async (
  galleryId: string
): Promise<void> => {
  await api.delete(`/galleries/${galleryId}`);
};

// =========================================================
// GALLERY ITEMS
// =========================================================


export const getGalleryItems = async (
  galleryId: string
): Promise<GalleryItem[]> => {
  const response = await api.get<GalleryItem[]>(
    `/galleries/${galleryId}/items`
  );

  return response.data;
};

export const getGalleryItem = async (
  galleryId: string,
  itemId: string
): Promise<GalleryItem> => {
  const response = await api.get<GalleryItem>(
    `/galleries/${galleryId}/items/${itemId}`
  );

  return response.data;
};

/**
 * Upload gallery media.
 *
 * Backend expects:
 * files: list[UploadFile]
 *
 * Multiple files are sent using the same "files" field.
 */
export const createGalleryItem = async (
  galleryId: string,
  data: GalleryItemFormData
): Promise<GalleryItem> => {
  const formData = new FormData();

  if (data.file) {
    formData.append("files", data.file);
  }

  const response = await api.post<GalleryItem[]>(
    `/galleries/${galleryId}/items`,
    formData
  );

  const createdItem = response.data[0];

  if (!createdItem) {
    throw new Error("Gallery media upload returned no item.");
  }

  return createdItem;
};
/**
 * Update an existing gallery item.
 *
 * Backend PATCH accepts:
 * - file
 * - alt_text
 * - display_order
 */
export const updateGalleryItem = async (
  galleryId: string,
  itemId: string,
  data: {
    file?: File | null;
    alt_text?: string | null;
    display_order?: number;
  }
): Promise<GalleryItem> => {
  const url = `/galleries/${galleryId}/items/${itemId}`;

  // File replacement
  if (data.file) {
    const formData = new FormData();

    formData.append("file", data.file);

    if (data.alt_text !== undefined) {
      formData.append(
        "alt_text",
        data.alt_text ?? ""
      );
    }

    if (data.display_order !== undefined) {
      formData.append(
        "display_order",
        String(data.display_order)
      );
    }

    const response = await api.patch<GalleryItem>(
      url,
      formData
    );

    return response.data;
  }

  // Metadata-only update
  const payload: Record<string, string | number | null> = {};

  if (data.alt_text !== undefined) {
    payload.alt_text = data.alt_text;
  }

  if (data.display_order !== undefined) {
    payload.display_order = data.display_order;
  }

  const response = await api.patch<GalleryItem>(
    url,
    payload
  );

  return response.data;
};

export const deleteGalleryItem = async (
  galleryId: string,
  itemId: string
): Promise<void> => {
  await api.delete(
    `/galleries/${galleryId}/items/${itemId}`
  );
};