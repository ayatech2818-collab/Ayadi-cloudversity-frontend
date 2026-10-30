import { getCourses } from "@/lib/api/courses";

/*
 * Course codes generated from the course name: a short prefix from the name
 * and the next free number for that prefix.
 *
 *   Python Full Stack Development → PYTHON-001
 *   Python Django Development     → PYTHON-002
 *   React Development             → REACT-001
 *   Data Science                  → DATA-SCIENCE-001
 *
 * Only a suggestion: the backend keeps codes unique, and the modal retries
 * with the next number when another course took this one first.
 */

/** Words that describe the format, not the subject — never the prefix. */
const FILLER_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "of",
  "for",
  "to",
  "in",
  "on",
  "with",
  "using",
  "from",
  "development",
  "developer",
  "course",
  "courses",
  "full",
  "stack",
  "fullstack",
  "complete",
  "introduction",
  "intro",
  "beginner",
  "beginners",
  "intermediate",
  "advanced",
  "fundamentals",
  "basics",
  "essentials",
  "masterclass",
  "bootcamp",
  "program",
  "programme",
  "training",
  "certification",
  "certificate",
  "mastery",
  "guide",
]);

/** Words too broad on their own, so the next word joins them. */
const FIELD_WORDS = new Set([
  "data",
  "web",
  "machine",
  "deep",
  "artificial",
  "cloud",
  "cyber",
  "digital",
  "mobile",
  "software",
  "game",
  "business",
  "project",
  "graphic",
  "social",
  "content",
]);

/** Room for "-" and the number inside the backend's 50 characters. */
const MAX_PREFIX_LENGTH = 40;

const NUMBER_WIDTH = 3;

/** The backend's answer when the code is already in use. */
const CODE_TAKEN_MESSAGE = "course code already exists";

/** "Python Full Stack Development" → "PYTHON"; "" when there is no name. */
export const courseCodePrefix = (title: string): string => {
  const words = title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  const subject = words.filter((word) => !FILLER_WORDS.has(word));

  // A name made only of filler words still gets a prefix from its start.
  const picked =
    subject.length === 0
      ? words.slice(0, 2)
      : FIELD_WORDS.has(subject[0]) && subject.length > 1
        ? subject.slice(0, 2)
        : subject.slice(0, 1);

  return picked
    .join("-")
    .toUpperCase()
    .slice(0, MAX_PREFIX_LENGTH)
    .replace(/-+$/, "");
};

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The next free code for this name, e.g. "PYTHON-003"; "" without a name. */
export const nextCourseCode = (
  title: string,
  existingCodes: readonly string[]
): string => {
  const prefix = courseCodePrefix(title);

  if (!prefix) return "";

  const pattern = new RegExp(`^${escapeRegExp(prefix)}-(\\d+)$`, "i");

  const highest = existingCodes.reduce((max, code) => {
    const match = pattern.exec(code.trim());

    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `${prefix}-${String(highest + 1).padStart(NUMBER_WIDTH, "0")}`;
};

/** Every course code in use, across all brands — codes are unique globally. */
export const fetchCourseCodes = async (): Promise<string[]> =>
  (await getCourses()).map((course) => course.course_code);

/** True when the save failed only because another course has this code. */
export const isCourseCodeTaken = (message: string): boolean =>
  message.toLowerCase().includes(CODE_TAKEN_MESSAGE);
