"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ExternalLink,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

import AuthorModal from "@/components/admin/AuthorModal";

import { RotateCcw } from "lucide-react";

import RestoreAuthorModal from "@/components/admin/RestoreAuthorModal";

import {
  createAuthor,
  deleteAuthor,
  getAuthors,
  updateAuthor,
  type Author,
} from "@/lib/api/authors";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState<"create" | "edit">("create");

  const [selectedAuthor, setSelectedAuthor] =
    useState<Author | null>(null);

  const [menuOpen, setMenuOpen] =
    useState<string | null>(null);

  /*
   * Fetch authors
   */
  const fetchAuthors = async () => {
    try {
      setLoading(true);

      const data = await getAuthors();

      setAuthors(data);
    } catch (error) {
      console.error(
        "Failed to fetch authors:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  /*
   * Search
   */
  const filteredAuthors = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return authors;
    }

    return authors.filter((author) => {
      return (
        author.name
          .toLowerCase()
          .includes(query) ||
        author.designation
          ?.toLowerCase()
          .includes(query) ||
        author.bio
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [authors, search]);

  /*
   * Add author
   */
  const handleAddAuthor = () => {
    setSelectedAuthor(null);
    setModalMode("create");
    setModalOpen(true);
    setMenuOpen(null);
  };

  /*
   * Edit author
   */
  const handleEditAuthor = (
    author: Author
  ) => {
    setSelectedAuthor(author);
    setModalMode("edit");
    setModalOpen(true);
    setMenuOpen(null);
  };

  /*
   * Delete author
   */
  const handleDeleteAuthor = async (
    author: Author
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${author.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAuthor(author.id);

      setAuthors((current) =>
        current.filter(
          (item) =>
            item.id !== author.id
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete author:",
        error
      );

      alert(
        "Failed to delete author."
      );
    } finally {
      setMenuOpen(null);
    }
  };

  /*
   * Create / update author
   */
  const handleAuthorSubmit = async (
    data: FormData,
    mode: "create" | "edit",
    authorId?: string
  ) => {
    try {
      if (mode === "create") {
        const newAuthor =
          await createAuthor(data);

        setAuthors((current) =>
          [...current, newAuthor].sort(
            (a, b) =>
              a.name.localeCompare(
                b.name
              )
          )
        );
      } else {
        if (!authorId) {
          throw new Error(
            "Author ID is missing."
          );
        }

        const updatedAuthor =
          await updateAuthor(
            authorId,
            data
          );

        setAuthors((current) =>
          current
            .map((author) =>
              author.id ===
              updatedAuthor.id
                ? updatedAuthor
                : author
            )
            .sort((a, b) =>
              a.name.localeCompare(
                b.name
              )
            )
        );
      }

      setModalOpen(false);
      setSelectedAuthor(null);
    } catch (error) {
      console.error(
        "Failed to save author:",
        error
      );

      throw error;
    }
  };

  return (
    <div
      className="min-h-full p-6"
      onClick={() => setMenuOpen(null)}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Authors
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage authors for your blog posts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRestoreModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCcw size={17} />
            Restore Author
          </button>

          <button
            type="button"
            onClick={handleAddAuthor}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#15803d] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#166534]"
          >
            <Plus size={17} />
            Add Author
          </button>
        </div>
      </div>

      

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search authors..."
            className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/10"
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#15803d]" />
        </div>
      ) : filteredAuthors.length === 0 ? (
        /* Empty */
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <UserRound
              size={25}
              className="text-gray-400"
            />
          </div>

          <h3 className="text-sm font-semibold text-gray-900">
            {search
              ? "No authors found"
              : "No authors yet"}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {search
              ? "Try another search."
              : "Add your first blog author."}
          </p>
        </div>
      ) : (
        /* Author Cards */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredAuthors.map(
            (author) => (
              <div
                key={author.id}
                className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {/* Menu */}
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      setMenuOpen(
                        menuOpen ===
                          author.id
                          ? null
                          : author.id
                      );
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <MoreVertical
                      size={18}
                    />
                  </button>

                  {menuOpen ===
                    author.id && (
                    <div
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleEditAuthor(
                            author
                          )
                        }
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Pencil
                          size={15}
                        />

                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteAuthor(
                            author
                          )
                        }
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2
                          size={15}
                        />

                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Author */}
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                    {author.profile_image ? (
                      <img
                        src={
                          author.profile_image
                        }
                        alt={
                          author.name
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound
                        size={25}
                        className="text-gray-400"
                      />
                    )}
                  </div>

                  <div className="min-w-0 pr-8">
                    <h3 className="truncate text-base font-semibold text-gray-900">
                      {author.name}
                    </h3>

                    {author.designation && (
                      <p className="mt-0.5 truncate text-sm text-[#15803d]">
                        {
                          author.designation
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {author.bio && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                    {author.bio}
                  </p>
                )}

                {/* LinkedIn */}
                {author.linkedin_url && (
                  <a
                    href={
                      author.linkedin_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#15803d] transition hover:text-[#166534]"
                  >
                    <ExternalLink
                      size={15}
                    />

                    LinkedIn
                  </a>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Modal */}
      <AuthorModal
        open={modalOpen}
        mode={modalMode}
        author={selectedAuthor}
        onClose={() => {
          setModalOpen(false);
          setSelectedAuthor(null);
        }}
        onSubmit={
          handleAuthorSubmit
        }
      />

      <RestoreAuthorModal
        open={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        onRestored={(restoredAuthor) => {
          setAuthors((current) =>
            [...current, restoredAuthor].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );
        }}
      />
    </div>
  );
}