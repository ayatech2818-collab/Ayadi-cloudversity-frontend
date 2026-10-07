/*
 * The Media page's view of the Gallery API.
 *
 * A Gallery is an album — one event holding photos and films — and the page
 * shows albums first. Nothing here is hardcoded: every album, cover, reel frame
 * and hero card is derived from the published galleries the API returns.
 */

import type { Gallery, GalleryItem, GalleryMediaType } from '@/lib/api/galleries';

export type MediaType = GalleryMediaType;

/* One photo or film. A gallery item has no title, date or description of its
   own, so it carries its album's. */
export type MediaEntry = {
  id: string;
  albumId: string;
  type: MediaType;
  /** The file itself — an image URL, or a video URL when `type` is 'video'. */
  src: string;
  alt: string;
  title: string;
  /** The eyebrow over the title. The Gallery API has no category field, so
      this is the kind of media — never an invented category. */
  label: string;
  /** ISO, for <time dateTime>. */
  date: string;
  displayDate: string;
  description: string;
};

export type Album = {
  id: string;
  title: string;
  description: string;
  /** ISO, for <time dateTime>. */
  date: string;
  displayDate: string;
  /** In display_order, and never empty — see toAlbums. */
  entries: MediaEntry[];
  cover: MediaEntry;
  photoCount: number;
  filmCount: number;
};

/** The pinned filmstrip never runs longer than this. */
export const REEL_LIMIT = 6;

/* How many of those frames go to films when the archive has photos to fill the
   rest — enough to read as a mix without the reel turning into a showreel. */
const REEL_FILM_SLOTS = 2;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* `event_date` is a bare YYYY-MM-DD. Read as a Date it becomes UTC midnight and
   shows as the previous day west of Greenwich, so the parts are used directly. */
const formatDate = (iso: string) => {
  const [year, month, day] = iso.split('-');
  const name = MONTHS[Number(month) - 1];

  return name ? `${day} ${name} ${year}` : '';
};

/* next/image throws on a src it cannot parse, so one malformed row would take
   the whole page down with it. */
const hasUsableUrl = (item: GalleryItem) => {
  try {
    return /^https?:$/.test(new URL(item.file_url).protocol);
  } catch {
    return false;
  }
};

const byDisplayOrder = (a: GalleryItem, b: GalleryItem) =>
  a.display_order - b.display_order || a.created_at.localeCompare(b.created_at);

export function toAlbums(galleries: Gallery[]): Album[] {
  return galleries.flatMap((gallery) => {
    /* The request already asks for published galleries only; this keeps a
       draft off the public page even if that filter were ever dropped. */
    if (!gallery.is_published) return [];

    const date = (gallery.event_date ?? gallery.created_at).slice(0, 10);
    const displayDate = formatDate(date);

    const entries = (gallery.items ?? [])
      .filter(hasUsableUrl)
      .sort(byDisplayOrder)
      .map(
        (item): MediaEntry => ({
          id: item.id,
          albumId: gallery.id,
          type: item.media_type,
          src: item.file_url,
          alt: item.alt_text || gallery.title,
          title: gallery.title,
          label: item.media_type === 'video' ? 'Film' : 'Photo',
          date,
          displayDate,
          description: gallery.description || item.alt_text || '',
        }),
      );

    /* An album with nothing in it has no cover to show and nothing to open. */
    if (entries.length === 0) return [];

    const filmCount = entries.filter((entry) => entry.type === 'video').length;

    return [
      {
        id: gallery.id,
        title: gallery.title,
        description: gallery.description ?? '',
        date,
        displayDate,
        entries,
        /* The API returns no cover, so it is the first photo — or the first
           film, for an album that holds no photos at all. */
        cover: entries.find((entry) => entry.type === 'image') ?? entries[0],
        photoCount: entries.length - filmCount,
        filmCount,
      },
    ];
  });
}

const count = (total: number, noun: string) => `${total} ${noun}${total === 1 ? '' : 's'}`;

/** "6 photos · 2 films" */
export const describeAlbum = (album: Album) =>
  [album.photoCount ? count(album.photoCount, 'photo') : '', album.filmCount ? count(album.filmCount, 'film') : '']
    .filter(Boolean)
    .join(' · ');

function shuffle<T>(list: readonly T[], random: () => number): T[] {
  const result = [...list];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }

  return result;
}

/*
 * Draws the reel: at most REEL_LIMIT frames from across the published albums.
 *
 * The albums are shuffled, each album's media is shuffled, and the two are
 * dealt out one album at a time — so a single large album cannot crowd out the
 * rest, and the frames arrive already mixed.
 *
 * `random` is passed in rather than called here so the draw happens once, when
 * the data loads. Calling this during render would reshuffle the reel on every
 * re-render.
 */
export function pickReel(albums: Album[], random: () => number): MediaEntry[] {
  const hands = shuffle(albums, random).map((album) => shuffle(album.entries, random));
  const longest = Math.max(0, ...hands.map((hand) => hand.length));

  const pool: MediaEntry[] = [];

  for (let round = 0; round < longest; round += 1) {
    for (const hand of hands) {
      if (round < hand.length) pool.push(hand[round]);
    }
  }

  if (pool.length <= REEL_LIMIT) return pool;

  const films = pool.filter((entry) => entry.type === 'video');
  const photos = pool.filter((entry) => entry.type === 'image');

  /* A few films among the photos when there are both; whichever kind there is
     more of makes up the difference when the other runs short. */
  const filmSlots = Math.max(Math.min(films.length, REEL_FILM_SLOTS), REEL_LIMIT - photos.length);

  const picked = new Set([...films.slice(0, filmSlots), ...photos.slice(0, REEL_LIMIT - filmSlots)]);

  return pool.filter((entry) => picked.has(entry));
}

/* The hero's floating cards: one cover per album, newest first, topped up from
   inside the albums when there are fewer albums than cards. */
export function pickHero(albums: Album[], limit: number): MediaEntry[] {
  const covers = albums.map((album) => album.cover);
  const rest = albums.flatMap((album) => album.entries.filter((entry) => entry !== album.cover));

  return [...covers, ...rest].slice(0, limit);
}
