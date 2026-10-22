'use client';

import { Star, Quote } from 'lucide-react';
import { memo } from 'react';

import { CardDecor, handleSpotlight } from '@/components/website/ui/card-chrome';
import type { Feedback } from '@/lib/api/feedback';

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDisplayDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

interface FeedbackCardProps {
  feedback: Feedback;
}

export const FeedbackCard = memo(function FeedbackCard({
  feedback,
}: FeedbackCardProps) {
  const initials = getInitials(feedback.name);
  const formattedDate = formatDisplayDate(feedback.created_at);

  return (
    <article
      onPointerMove={handleSpotlight}
      className="group relative isolate flex w-[290px] sm:w-[340px] md:w-[360px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl bg-surface p-4 sm:p-5 ring-1 ring-inset ring-border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:ring-primary/30 hover:shadow-md hover:shadow-primary/5 select-none"
    >
      <CardDecor />

      <div>
        {/* Header: User Avatar, Name, Rating & Quote */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white shadow-xs ring-2 ring-white/30"
            >
              {initials}
            </span>

            <div className="min-w-0">
              <h3
                title={feedback.name}
                className="truncate text-sm font-bold text-accent sm:text-[15px]"
              >
                {feedback.name}
              </h3>

              {formattedDate && (
                <time
                  dateTime={feedback.created_at}
                  className="block text-[11px] text-muted/80"
                >
                  {formattedDate}
                </time>
              )}
            </div>
          </div>

          {/* Decorative subtle quote mark */}
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary/40 ring-1 ring-inset ring-primary/10"
          >
            <Quote size={13} className="rotate-180" />
          </span>
        </div>

        {/* Stars */}
        <div
          className="mt-3 flex items-center gap-1"
          role="img"
          aria-label={`${feedback.rating} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, index) => {
            const isFilled = index < feedback.rating;
            return (
              <Star
                key={index}
                size={14}
                className={
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted/15 text-muted/25'
                }
              />
            );
          })}

          <span className="ml-1.5 text-xs font-bold tabular-nums text-accent">
            {feedback.rating.toFixed(1)}
          </span>
        </div>

        {/* Feedback Message */}
        <p className="mt-3 text-xs leading-relaxed text-muted line-clamp-4 sm:text-[13px]">
          &ldquo;{feedback.message}&rdquo;
        </p>
      </div>

      {/* Subtle Verified Student Tag */}
      <div className="mt-4 flex items-center gap-1.5 border-t border-border/40 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
        Verified Learner
      </div>
    </article>
  );
});
