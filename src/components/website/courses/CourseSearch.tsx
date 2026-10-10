'use client';

import { ArrowRight, Search, X } from 'lucide-react';
import { useRef, type FormEvent } from 'react';

/*
 * The catalogue search. Results update as you type; submitting is only there
 * to carry you down to them, which matters on a phone where the grid starts
 * below the fold.
 *
 * Controlled, and unaware of what it searches — the page owns the query.
 */
export function CourseSearch({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const clear = () => {
    onChange('');
    input.current?.focus();
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="group/search flex h-14 items-center gap-2 rounded-2xl bg-surface pl-5 pr-2 shadow-[0_18px_40px_-28px_rgba(20,29,63,0.45)] ring-1 ring-inset ring-border transition-shadow duration-300 focus-within:ring-2 focus-within:ring-primary"
    >
      <label htmlFor="course-search" className="sr-only">
        Search courses
      </label>

      <Search
        aria-hidden="true"
        size={18}
        className="shrink-0 text-muted transition-colors duration-300 group-focus-within/search:text-primary"
      />

      <input
        ref={input}
        id="course-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search courses"
        autoComplete="off"
        enterKeyHint="search"
        className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-text outline-none placeholder:text-muted/70 [&::-webkit-search-cancel-button]:appearance-none"
      />

      {value ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors duration-300 hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X aria-hidden="true" size={15} />
        </button>
      ) : null}

      <button
        type="submit"
        className="group/go flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary text-white transition-colors duration-300 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="sr-only">Show results</span>
        <ArrowRight
          aria-hidden="true"
          size={16}
          className="transition-transform duration-300 group-hover/go:translate-x-0.5"
        />
      </button>
    </form>
  );
}
