import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

/**
 * One file, picked either from the hidden `<input type="file">` or by dropping
 * it on a zone. Spread `dropZoneProps` on the zone, and give the input
 * `ref={inputRef}` and `onChange={onInputChange}`.
 */
export function useFilePicker(
  onSelect: (file: File) => void,
  disabled = false
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const dropZoneProps = {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();

      if (!disabled) setDragging(true);
    },

    onDragLeave: (event: DragEvent<HTMLElement>) => {
      // Moving across a child fires this too; only react to a real exit.
      if (
        !event.currentTarget.contains(
          event.relatedTarget as Node | null
        )
      ) {
        setDragging(false);
      }
    },

    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setDragging(false);

      const file = event.dataTransfer.files?.[0];

      if (file && !disabled) onSelect(file);
    },
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) onSelect(file);

    // Lets the same file be picked again after it was dropped.
    event.target.value = "";
  };

  return {
    inputRef,
    dragging,
    dropZoneProps,
    onInputChange,
    openPicker: () => inputRef.current?.click(),
  };
}
