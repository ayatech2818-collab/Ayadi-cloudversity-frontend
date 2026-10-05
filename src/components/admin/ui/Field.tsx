"use client";

import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  /** Id of the control this labels. */
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/** Label, control, then either the error or the hint — never both. */
export default function Field({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold text-text"
      >
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>

      {children}

      {error ? (
        <p
          role="alert"
          className="mt-1.5 text-xs font-medium text-rose-600"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p className="mt-1.5 text-[11px] text-muted">{hint}</p>
        )
      )}
    </div>
  );
}
