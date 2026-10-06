"use client";

import type { SelectHTMLAttributes } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

import { inputClass } from "./styles";

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  /** Optional icon inside the left edge. */
  icon?: LucideIcon;
  /** Rose outline, for a choice that failed validation. */
  invalid?: boolean;
}

/** Native select, dressed like the text inputs. */
export default function Select({
  icon: Icon,
  invalid = false,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={14}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
      )}

      <select
        {...props}
        aria-invalid={invalid}
        className={`${inputClass(invalid)} h-11 cursor-pointer appearance-none pr-9 ${
          Icon ? "pl-9" : ""
        }`}
      >
        {children}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
