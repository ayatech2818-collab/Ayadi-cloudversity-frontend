import Image from 'next/image';

import styles from './ecosystem.module.css';
import { PHOTOS, type PhotoId } from './photos';

/*
 * A small photograph standing in the 3D scene — one flat leaf, so the frame,
 * the image and the placeholder all tilt together. Decorative: the chapter
 * text beside the scene carries the meaning, so the image has no alt text.
 *
 * Until the file exists it shows a tinted block with the subject's icon; in
 * development it also prints the path the photo is expected at.
 */
export function PhotoPanel({ id, available }: { id: PhotoId; available: boolean }) {
  const photo = PHOTOS[id];
  const Icon = photo.icon;

  return (
    <div className={styles.photo}>
      <div className={styles.photoInner}>
        {available ? (
          <Image src={photo.src} alt="" fill sizes="180px" className="object-cover" />
        ) : (
          <div className={styles.photoPlaceholder}>
            <span className={styles.photoIcon}>
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            </span>
            {process.env.NODE_ENV === 'development' ? (
              <span className={styles.photoHint}>public{photo.src}</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
