'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import type { EnrollmentModalProps } from './EnrollmentModal';

/* The enrolment form, its validation and the API client behind it (axios,
   the Supabase SDK) come to a few hundred kilobytes that nobody needs until
   they ask to enrol. So they arrive then — not with every page of the site,
   which is where the navbar would otherwise put them. */
const load = () => import('./EnrollmentModal').then((module) => module.EnrollmentModal);

const Modal = dynamic(load, { ssr: false });

/** Starts the download early: for the hover or focus of whatever opens the
    form, so that by the click it is usually here. */
export function preloadEnrollment() {
  void load();
}

/** EnrollmentModal, fetched the first time it is opened and kept from then on
    — so closing still plays its exit, and the form keeps its state. */
export function LazyEnrollmentModal({
  isOpen,
  onClose,
  courseTitle,
  courseId,
  showCoursePicker,
}: EnrollmentModalProps) {
  const [wanted, setWanted] = useState(false);
  if (isOpen && !wanted) setWanted(true);

  return wanted ? (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      courseTitle={courseTitle}
      courseId={courseId}
      showCoursePicker={showCoursePicker}
    />
  ) : null;
}
