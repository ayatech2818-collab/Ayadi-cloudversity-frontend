"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { inputGroupClass } from "./styles";

interface TagInputProps {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}

/**
 * Chips with a text box after them. Enter or a comma adds what was typed, so
 * does leaving the box; Backspace on an empty box removes the last chip.
 */
export default function TagInput({
  id,
  values,
  onChange,
  placeholder,
  disabled = false,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim().replace(/^,+|,+$/g, "");

    if (value && !values.includes(value)) {
      onChange([...values, value]);
    }

    setDraft("");
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 p-2 ${inputGroupClass()}`}
    >
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 py-1 pl-2.5 pr-1 text-xs font-semibold text-primary-hover"
        >
          {value}

          <button
            type="button"
            aria-label={`Remove ${value}`}
            disabled={disabled}
            onClick={() =>
              onChange(values.filter((item) => item !== value))
            }
            className="flex h-4 w-4 cursor-pointer items-center justify-center rounded transition-colors hover:bg-rose-100 hover:text-rose-600 disabled:cursor-not-allowed dark:hover:bg-rose-500/20 dark:hover:text-rose-300"
          >
            <X size={11} />
          </button>
        </span>
      ))}

      <input
        id={id}
        type="text"
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit();
          } else if (
            event.key === "Backspace" &&
            !draft &&
            values.length > 0
          ) {
            onChange(values.slice(0, -1));
          }
        }}
        placeholder={values.length === 0 ? placeholder : "Add more..."}
        className="h-7 min-w-[110px] flex-1 bg-transparent px-1.5 text-sm text-text outline-none placeholder:text-muted/60"
      />
    </div>
  );
}
