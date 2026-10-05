"use client";

import { useState } from "react";
import { Images, RotateCcw, ServerCrash } from "lucide-react";

import DeleteDialog from "@/components/admin/ui/DeleteDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import Modal, {
  ModalFooter,
  ModalHeader,
} from "@/components/admin/ui/Modal";
import { buttonClass } from "@/components/admin/ui/styles";
import type { Gallery, GalleryItem } from "@/lib/api/galleries";

import GalleryMediaGrid from "./GalleryMediaGrid";
import GalleryUploadZone from "./GalleryUploadZone";
import {
  MEDIA_GRID,
  countMedia,
  describeMedia,
  formatEventDate,
} from "./gallery-utils";
import { useGalleryMedia } from "./useGalleryMedia";

interface GalleryMediaManagerProps {
  gallery: Gallery | null;
  onClose: () => void;
  /** Fired once on close if anything changed, so the list can re-fetch. */
  onChanged: () => void;
  onNotifySuccess: (title: string, description?: string) => void;
  onNotifyError: (title: string, description?: string) => void;
}

export default function GalleryMediaManager({
  gallery,
  ...workspace
}: GalleryMediaManagerProps) {
  return (
    // No Esc-to-close: closing has to go through the workspace, which knows
    // whether an upload is still running and whether the list must re-fetch.
    <Modal
      open={gallery !== null}
      closeOnEscape={false}
      onClose={workspace.onClose}
      labelledBy="gallery-media-title"
      size="xl"
    >
      {/* Mounted per gallery, so nothing carries over from the last one. */}
      {gallery && (
        <MediaWorkspace
          key={gallery.id}
          gallery={gallery}
          {...workspace}
        />
      )}
    </Modal>
  );
}

interface MediaWorkspaceProps
  extends Omit<GalleryMediaManagerProps, "gallery"> {
  gallery: Gallery;
}

function MediaWorkspace({
  gallery,
  onClose,
  onChanged,
  onNotifySuccess,
  onNotifyError,
}: MediaWorkspaceProps) {
  const media = useGalleryMedia(
    gallery,
    onNotifySuccess,
    onNotifyError
  );

  const [pendingDelete, setPendingDelete] =
    useState<GalleryItem | null>(null);

  const counts = countMedia(media.items);

  const handleClose = () => {
    if (media.locked) return;

    if (media.hasChanged()) onChanged();

    onClose();
  };

  const handleDeleteConfirmed = async () => {
    if (pendingDelete && (await media.remove(pendingDelete))) {
      setPendingDelete(null);
    }
  };

  return (
    <>
      <ModalHeader
        id="gallery-media-title"
        icon={Images}
        title={gallery.title}
        description={[
          formatEventDate(gallery.event_date) ?? "No event date",
          describeMedia(counts),
          gallery.is_published ? "Published" : "Draft",
        ].join(" · ")}
        onClose={handleClose}
        disabled={media.locked}
      />

      <div className="flex-1 space-y-5 overflow-y-auto bg-page/60 p-4 sm:p-6">
        <GalleryUploadZone
          uploading={media.uploading}
          progress={media.uploadProgress}
          disabled={media.locked}
          onUpload={media.upload}
        />

        {media.loading ? (
          <ul className={MEDIA_GRID}>
            {Array.from({ length: 4 }).map((_, index) => (
              <li
                key={index}
                aria-hidden="true"
                className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border"
              >
                <div className="aspect-[4/3] w-full animate-pulse bg-page" />

                <div className="space-y-2 p-3">
                  <div className="h-2.5 w-3/4 animate-pulse rounded bg-page" />
                  <div className="h-8 w-full animate-pulse rounded-lg bg-page" />
                </div>
              </li>
            ))}
          </ul>
        ) : media.error ? (
          <EmptyState
            compact
            danger
            icon={ServerCrash}
            title="Unable to load media"
            text={media.error}
            action={{
              label: "Retry",
              icon: RotateCcw,
              onClick: media.retry,
            }}
          />
        ) : media.items.length === 0 ? (
          <EmptyState
            compact
            icon={Images}
            title="No media in this gallery"
            text="Upload photos and videos to bring this event gallery to life."
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 px-0.5">
              <p className="text-xs font-semibold text-text">
                Media
                <span className="ml-1.5 font-normal text-muted">
                  ordered as shown on the website
                </span>
              </p>

              <span className="shrink-0 text-[11px] text-muted">
                {describeMedia(counts)}
              </span>
            </div>

            <GalleryMediaGrid
              items={media.items}
              busyItemId={media.busyItemId}
              disabled={media.locked}
              onMove={media.move}
              onAltTextSave={media.saveAltText}
              onReplace={media.replace}
              onDelete={setPendingDelete}
            />
          </>
        )}
      </div>

      <ModalFooter>
        <p className="mr-auto text-[11px] text-muted">
          The first item is used as the gallery cover.
        </p>

        <button
          type="button"
          onClick={handleClose}
          disabled={media.locked}
          className={buttonClass("secondary")}
        >
          Done
        </button>
      </ModalFooter>

      {/* Opens above the manager; its own Esc and Cancel close only it. */}
      <DeleteDialog
        open={pendingDelete !== null}
        id="gallery-media-delete-title"
        title="Delete this media?"
        description="It will be removed from the gallery permanently."
        loading={media.busyItemId !== null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDeleteConfirmed}
      >
        {pendingDelete && (
          <p className="truncate rounded-xl bg-page px-3 py-2 text-xs font-medium text-text ring-1 ring-inset ring-border">
            {pendingDelete.file_name}
          </p>
        )}
      </DeleteDialog>
    </>
  );
}
