"use client";

import { inputGroupClass } from "./styles";

/** "Hello, World!" → "hello-world". */
export const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

interface SlugInputProps {
  id: string;
  /** The fixed part of the address shown before the slug, e.g. "/blog/". */
  prefix?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  invalid?: boolean;
  disabled?: boolean;
}

/**
 * A slug box, with the URL prefix attached when there is one. Typed text is
 * lowercased and spaces become hyphens.
 */
export default function SlugInput({
  id,
  prefix,
  value,
  onChange,
  placeholder,
  invalid = false,
  disabled = false,
}: SlugInputProps) {
  return (
    <div
      className={`flex items-center overflow-hidden ${inputGroupClass(invalid)}`}
    >
      {prefix && (
        <span className="select-none self-stretch bg-page px-2.5 font-mono text-[11px] leading-[2.25rem] text-muted min-[360px]:px-3 min-[360px]:text-xs min-[360px]:leading-[2.375rem] sm:px-3.5 sm:text-xs sm:leading-[2.75rem]">
          {prefix}
        </span>
      )}

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value.toLowerCase().replace(/\s+/g, "-")
          )
        }
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid}
        className={`h-9 min-[360px]:h-9.5 sm:h-11 w-full bg-transparent font-mono text-[11px] min-[360px]:text-xs sm:text-xs text-text outline-none placeholder:text-muted/60 disabled:cursor-not-allowed ${
          prefix ? "px-2.5 min-[360px]:px-3" : "px-3 min-[360px]:px-3.5"
        }`}
      />
    </div>
  );
}
