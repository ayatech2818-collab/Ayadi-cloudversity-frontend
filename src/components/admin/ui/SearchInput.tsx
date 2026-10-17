"use client";

import { Search, X } from "lucide-react";

import { inputClass } from "./styles";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Accessible name — the field has no visible label. */
  label: string;
  /** Width, set by the caller's layout. */
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted min-[360px]:left-3.5 min-[360px]:h-4 min-[360px]:w-4"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={`${inputClass()} h-9 pl-8.5 pr-8.5 text-xs min-[360px]:h-9.5 min-[360px]:pl-9 min-[360px]:pr-9 sm:h-11 sm:pl-10 sm:pr-10 sm:text-sm`}
      />

      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-page hover:text-text min-[360px]:right-2 min-[360px]:h-7 min-[360px]:w-7"
        >
          <X className="h-3 w-3 min-[360px]:h-3.5 min-[360px]:w-3.5" />
        </button>
      )}
    </div>
  );
}
