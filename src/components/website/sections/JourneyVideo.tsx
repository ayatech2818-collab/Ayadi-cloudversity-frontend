'use client';

import { motionValue, useMotionValueEvent, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { glowStyle } from './JourneyAmbient';

type OnScreen = 'hidden' | 'visible';

/* useMotionValueEvent needs a value to subscribe to even when there is none. */
const FALLBACK = motionValue<OnScreen>('hidden');

/*
 * A How It Works step's video: muted, looping, no controls.
 *
 * With `onScreen` (the cinematic journey), it plays only while its step is
 * visible and pauses the moment the step fades out, so six videos never decode
 * at once. Without it (reduced motion), it never plays.
 *
 * Under it, the step's own colours as a slowly drifting blur. That is all the
 * card shows until the first frame arrives — a slow network, autoplay refused,
 * no file yet — and the video fades in over it once it has one.
 */
export function JourneyVideo({
  src,
  glow,
  onScreen,
  onVideoElement,
}: {
  src: string;
  glow: [string, string];
  /** The step's `visibility` — 'visible' while it is on the stage. */
  onScreen?: MotionValue<OnScreen>;
  /** Hands the <video> out — the ambient backdrop paints from the same one. */
  onVideoElement?: (video: HTMLVideoElement | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  /* React does not write `muted` into the server HTML, and mobile browsers
     only let a muted video play without a tap — so set it on the element too. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    // A cached file can have its first frame — or a missing one its error —
    // before hydration, and so before React was listening for either.
    if (video.error) setFailed(true);
    else if (video.readyState >= 2) setReady(true);
  }, []);

  const sync = (state: OnScreen) => {
    const video = videoRef.current;
    if (!video || failed) return;

    if (state === 'visible') {
      // A rejected play (data saver, low power mode) just leaves the colour up.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  useEffect(() => {
    if (onScreen) sync(onScreen.get());
    // Only on mount: after that the change event below drives it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(onScreen ?? FALLBACK, 'change', (state) => {
    if (onScreen) sync(state);
  });

  return (
    <>
      {/* Oversized so the drift never shows an edge; transform only. */}
      <div
        aria-hidden="true"
        style={glowStyle(glow, true)}
        className="absolute -inset-[20%] motion-safe:animate-[ambient-drift_18s_ease-in-out_infinite]"
      />

      {!failed && (
        <video
          ref={(video) => {
            videoRef.current = video;
            onVideoElement?.(video);
          }}
          src={src}
          muted
          loop
          playsInline
          disablePictureInPicture
          preload="metadata"
          onLoadedData={() => setReady(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </>
  );
}
