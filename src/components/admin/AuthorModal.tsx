"use client";

import { useEffect, useState } from "react";

import {
  X,
  Upload,
  UserRound,
} from "lucide-react";

import type { Author } from "@/lib/api/authors";

interface AuthorModalProps {
  open: boolean;
  mode: "create" | "edit";
  author?: Author | null;
  onClose: () => void;
  onSubmit: (
    data: FormData,
    mode: "create" | "edit",
    authorId?: string
  ) => Promise<void>;
}

export default function AuthorModal({
  open,
  mode,
  author,
  onClose,
  onSubmit,
}: AuthorModalProps) {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [profileImage, setProfileImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * Populate form when:
   *
   * 1. Modal opens
   * 2. Create/Edit mode changes
   * 3. Selected author changes
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "edit" && author) {
      setName(author.name ?? "");

      setDesignation(
        author.designation ?? ""
      );

      setBio(author.bio ?? "");

      setLinkedin(
        author.linkedin_url ?? ""
      );

      setPreview(
        author.profile_image ?? null
      );

      setProfileImage(null);
    } else {
      setName("");
      setDesignation("");
      setBio("");
      setLinkedin("");

      setProfileImage(null);
      setPreview(null);
    }

    setError("");
  }, [open, mode, author]);

  /*
   * Cleanup preview URL
   */
  useEffect(() => {
    return () => {
      if (
        preview &&
        preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (!open) {
    return null;
  }

  /*
   * Image selection
   */
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileImage(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreview(objectUrl);
  };

  /*
   * Submit
   */
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Author name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();

      formData.append(
        "name",
        name.trim()
      );

      if (designation.trim()) {
        formData.append(
          "designation",
          designation.trim()
        );
      }

      if (bio.trim()) {
        formData.append(
          "bio",
          bio.trim()
        );
      }

      if (linkedin.trim()) {
        formData.append(
          "linkedin_url",
          linkedin.trim()
        );
      }

      /*
       * Send the actual image file.
       */
      if (profileImage) {
        formData.append(
          "profile_image",
          profileImage
        );
      }

      await onSubmit(
        formData,
        mode,
        mode === "edit"
          ? author?.id
          : undefined
      );

      onClose();
    } catch (err) {
      console.error(
        "Failed to save author:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the author."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === "edit"
                ? "Edit Author"
                : "Add Author"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {mode === "edit"
                ? "Update author information."
                : "Add an author for your blog posts."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">

            {/* Profile Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Profile Image
              </label>

              <div className="flex items-center gap-4">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                  {preview ? (
                    <img
                      src={preview}
                      alt={
                        name || "Author"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound
                      size={28}
                      className="text-gray-400"
                    />
                  )}
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  <Upload size={16} />

                  Choose Image

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={
                      handleImageChange
                    }
                    disabled={saving}
                  />
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="e.g. Adil Shinas"
                disabled={saving}
                className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/10 disabled:bg-gray-50"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Designation
              </label>

              <input
                type="text"
                value={designation}
                onChange={(event) =>
                  setDesignation(
                    event.target.value
                  )
                }
                placeholder="e.g. Founder & CEO"
                disabled={saving}
                className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/10 disabled:bg-gray-50"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Bio
              </label>

              <textarea
                value={bio}
                onChange={(event) =>
                  setBio(
                    event.target.value
                  )
                }
                placeholder="Write a short author bio..."
                rows={4}
                disabled={saving}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/10 disabled:bg-gray-50"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                LinkedIn
              </label>

              <input
                type="url"
                value={linkedin}
                onChange={(event) =>
                  setLinkedin(
                    event.target.value
                  )
                }
                placeholder="https://linkedin.com/in/username"
                disabled={saving}
                className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/10 disabled:bg-gray-50"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#15803d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}

              {saving
                ? "Saving..."
                : mode === "edit"
                  ? "Update Author"
                  : "Add Author"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}