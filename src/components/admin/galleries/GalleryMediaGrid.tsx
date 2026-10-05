"use client";

import type { GalleryItem } from "@/lib/api/galleries";

import GalleryMediaTile, {
  type GalleryMediaActions,
} from "./GalleryMediaTile";
import { MEDIA_GRID } from "./gallery-utils";

interface GalleryMediaGridProps extends GalleryMediaActions {
  items: GalleryItem[];
  /** The single item currently being mutated, if any. */
  busyItemId: string | null;
  /** Locks the whole grid while an upload or reorder is in flight. */
  disabled: boolean;
}

export default function GalleryMediaGrid({
  items,
  busyItemId,
  disabled,
  ...actions
}: GalleryMediaGridProps) {
  return (
    <ul className={MEDIA_GRID}>
      {items.map((item, index) => (
        <GalleryMediaTile
          key={item.id}
          item={item}
          index={index}
          total={items.length}
          busy={busyItemId === item.id}
          /* One mutation at a time keeps display_order deterministic. */
          disabled={disabled}
          {...actions}
        />
      ))}
    </ul>
  );
}
