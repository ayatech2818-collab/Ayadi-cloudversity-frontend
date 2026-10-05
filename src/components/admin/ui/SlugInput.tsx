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
        <span className="select-none self-stretch bg-page px-3.5 font-mono text-xs leading-[2.75rem] text-muted">
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
        className={`h-11 w-full bg-transparent font-mono text-xs text-text outline-none placeholder:text-muted/60 disabled:cursor-not-allowed ${
          prefix ? "px-3" : "px-3.5"
        }`}
      />
    </div>
  );
}
