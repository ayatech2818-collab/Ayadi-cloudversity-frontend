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
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={`${inputClass()} h-11 pl-10 pr-10`}
      />

      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-page hover:text-text"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
