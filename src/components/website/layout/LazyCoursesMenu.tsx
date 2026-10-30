'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import type { CoursesMenuProps } from './CoursesMenu';
import type { CoursesSheetProps } from './CoursesSheet';

/* The menu brings the catalogue and the API client behind it, which nobody
   needs until they hover Courses — same reasoning as LazyEnrollmentModal. */
const load = () => import('./CoursesMenu').then((module) => module.CoursesMenu);
const loadSheet = () => import('./CoursesSheet').then((module) => module.CoursesSheet);

const Menu = dynamic(load, { ssr: false });
const Sheet = dynamic(loadSheet, { ssr: false });

/** Starts the download early, on the hover that is about to open it. */
export function preloadCoursesMenu() {
  void load();
}

/** The same for the phone's sheet, on the press that is about to open it. */
export function preloadCoursesSheet() {
  void loadSheet();
}

/** CoursesSheet, fetched the first time it opens and kept from then on. */
export function LazyCoursesSheet(props: CoursesSheetProps) {
  const [wanted, setWanted] = useState(false);
  if (props.isOpen && !wanted) setWanted(true);

  return wanted ? <Sheet {...props} /> : null;
}

/** CoursesMenu, fetched the first time it opens and kept from then on — so
    closing still plays its exit, and it reopens where it was left. */
export function LazyCoursesMenu(props: CoursesMenuProps) {
  const [wanted, setWanted] = useState(false);
  if (props.isOpen && !wanted) setWanted(true);

  return wanted ? <Menu {...props} /> : null;
}
