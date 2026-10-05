"use client";

import {
  CircleCheck,
  Image as ImageIcon,
  Images,
  Plus,
  Video,
} from "lucide-react";

import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonClass } from "@/components/admin/ui/styles";
import type { Gallery } from "@/lib/api/galleries";

import { countMedia } from "./gallery-utils";

interface GalleriesHeaderProps {
  /** Every gallery, ignoring the filters. `null` until it has loaded. */
  galleries: Gallery[] | null;
  onCreate: () => void;
}

export default function GalleriesHeader({
  galleries,
  onCreate,
}: GalleriesHeaderProps) {
  // Counted from the full list, so the numbers do not shrink with the filters.
  const media = galleries
    ? countMedia(galleries.flatMap((gallery) => gallery.items ?? []))
    : null;

  return (
    <PageHeader
      eyebrow="Content"
      title="Media"
      highlight="Gallery"
      description="Manage event galleries and their photos and videos."
      stats={[
        {
          label: "Galleries",
          icon: Images,
          value: galleries?.length ?? null,
        },
        {
          label: "Published",
          icon: CircleCheck,
          value:
            galleries?.filter((gallery) => gallery.is_published)
              .length ?? null,
        },
        {
          label: "Photos",
          icon: ImageIcon,
          value: media?.images ?? null,
        },
        {
          label: "Videos",
          icon: Video,
          value: media?.videos ?? null,
        },
      ]}
    >
      <button
        type="button"
        onClick={onCreate}
        className={buttonClass("primary")}
      >
        <Plus size={17} strokeWidth={2.4} />
        Add Gallery
      </button>
    </PageHeader>
  );
}
