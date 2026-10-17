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
  className?: string;
  wrapperClassName?: string;
}

/** Native select, dressed like the text inputs. */
export default function Select({
  icon: Icon,
  invalid = false,
  className = "",
  wrapperClassName = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      {Icon && (
        <Icon
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted min-[360px]:left-3 sm:left-3.5 sm:h-[14px] sm:w-[14px]"
        />
      )}

      <select
        {...props}
        aria-invalid={invalid}
        className={`${inputClass(invalid)} h-9 cursor-pointer appearance-none pr-8 text-xs min-[360px]:h-9.5 min-[360px]:pr-8.5 sm:h-11 sm:pr-9 sm:text-sm ${
          Icon ? "pl-8 min-[360px]:pl-8.5 sm:pl-9" : ""
        } ${className}`}
      >
        {children}
      </select>

      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted min-[360px]:right-3 sm:right-3 sm:h-[15px] sm:w-[15px]"
      />
    </div>
  );
}
