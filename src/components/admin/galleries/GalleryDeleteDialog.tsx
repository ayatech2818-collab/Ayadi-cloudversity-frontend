"use client";

import { Images } from "lucide-react";

import CoverImage from "@/components/admin/ui/CoverImage";
import DeleteDialog from "@/components/admin/ui/DeleteDialog";
import type { Gallery } from "@/lib/api/galleries";

import {
  countMedia,
  describeMedia,
  resolveGalleryCover,
} from "./gallery-utils";

interface GalleryDeleteDialogProps {
  gallery: Gallery | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function GalleryDeleteDialog({
  gallery,
  loading = false,
  onCancel,
  onConfirm,
}: GalleryDeleteDialogProps) {
  return (
    <DeleteDialog
      open={gallery !== null}
      id="gallery-delete-title"
      title="Delete this gallery?"
      description="This will permanently delete the gallery and all of its media."
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {gallery && (
        <div className="flex items-center gap-3 rounded-2xl bg-page/70 p-3 ring-1 ring-inset ring-border">
          <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg">
            <CoverImage
              src={resolveGalleryCover(gallery)?.url}
              icon={Images}
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-accent">
              {gallery.title}
            </p>

            <p className="truncate text-xs text-muted">
              {describeMedia(countMedia(gallery.items ?? []))}
            </p>
          </div>
        </div>
      )}
    </DeleteDialog>
  );
}
