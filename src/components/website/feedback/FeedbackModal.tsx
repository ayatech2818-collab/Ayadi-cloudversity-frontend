'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  LoaderCircle,
  MessageSquarePlus,
  Send,
  Star,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from 'react';
import { createPortal } from 'react-dom';

import { getApiErrorMessage } from '@/lib/api/errors';
import { createFeedback } from '@/lib/api/feedback';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormErrors {
  name?: string;
  rating?: string;
  message?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 out of 5 — Poor',
  2: '2 out of 5 — Fair',
  3: '3 out of 5 — Good',
  4: '4 out of 5 — Very Good',
  5: '5 out of 5 — Excellent!',
};

const emptySubscribe = () => () => {};

export function FeedbackModal({
  isOpen,
  onClose,
  onSuccess,
}: FeedbackModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const resetForm = useCallback(() => {
    setName('');
    setRating(0);
    setHoveredRating(0);
    setMessage('');
    setErrors({});
    setSubmitError(null);
    setIsSuccess(false);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      resetForm();
    }, 300);
  }, [onClose, resetForm]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      nextErrors.name = 'Please enter your name.';
    } else if (trimmedName.length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.';
    } else if (trimmedName.length > 150) {
      nextErrors.name = 'Name cannot exceed 150 characters.';
    }

    if (!rating || rating < 1 || rating > 5) {
      nextErrors.rating = 'Please select a star rating (1 to 5).';
    }

    if (!trimmedMessage) {
      nextErrors.message = 'Please share your feedback message.';
    } else if (trimmedMessage.length < 5) {
      nextErrors.message = 'Feedback message must be at least 5 characters.';
    } else if (trimmedMessage.length > 3000) {
      nextErrors.message = 'Feedback message cannot exceed 3,000 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await createFeedback({
        name: name.trim(),
        rating,
        message: message.trim(),
      });

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      setSubmitError(
        getApiErrorMessage(
          err,
          'Unable to submit feedback right now. Please try again later.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            aria-hidden="true"
            className="fixed inset-0 bg-[#0B1330]/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            aria-describedby="feedback-modal-desc"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0f172a] border border-white/10 text-white shadow-2xl"
          >
            {/* Header Ambient Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-primary/25 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-20 -bottom-20 size-60 rounded-full bg-accent-soft/30 blur-3xl"
            />

            {/* Modal Header */}
            <div className="relative border-b border-white/10 px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary/20 text-emerald-400 ring-1 ring-inset ring-primary/30"
                  >
                    <MessageSquarePlus size={18} />
                  </span>
                  <div>
                    <h2
                      id="feedback-modal-title"
                      className="text-base sm:text-lg font-bold text-white tracking-[-0.015em]"
                    >
                      Share Your Experience
                    </h2>
                    <p
                      id="feedback-modal-desc"
                      className="text-xs text-slate-300"
                    >
                      Help other students find their learning path
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close feedback modal"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="relative p-5 sm:p-6">
              {isSuccess ? (
                /* Success View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center"
                >
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
                    <CheckCircle2 size={32} />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white sm:text-xl">
                    Thank You for Your Feedback!
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Your feedback has been submitted successfully. It will appear
                    on our website after review by our team.
                  </p>

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex items-center justify-center rounded-full bg-accent-gradient px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs ring-1 ring-white/15 transition-all hover:ring-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {submitError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300"
                    >
                      {submitError}
                    </div>
                  )}

                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="feedback-name"
                      className="block text-xs font-semibold text-slate-200"
                    >
                      Your Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="feedback-name"
                      name="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) {
                          setErrors((prev) => ({ ...prev, name: undefined }));
                        }
                      }}
                      placeholder="e.g. Sara Ali"
                      maxLength={150}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className={`mt-1.5 h-10 w-full rounded-xl bg-slate-900/80 px-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 border transition-colors focus:outline-none ${
                        errors.name
                          ? 'border-rose-400 focus:border-rose-400'
                          : 'border-white/15 focus:border-primary'
                      }`}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1 text-xs text-rose-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Rating Selector */}
                  <div>
                    <span className="block text-xs font-semibold text-slate-200">
                      Your Rating <span className="text-rose-400">*</span>
                    </span>

                    <div
                      role="radiogroup"
                      aria-label="Rating from 1 to 5 stars"
                      className="mt-2 flex items-center gap-1.5"
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeRating = hoveredRating || rating;
                        const isFilled = star <= activeRating;

                        return (
                          <button
                            key={star}
                            type="button"
                            role="radio"
                            aria-checked={rating === star}
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            disabled={isSubmitting}
                            onClick={() => {
                              setRating(star);
                              if (errors.rating) {
                                setErrors((prev) => ({
                                  ...prev,
                                  rating: undefined,
                                }));
                              }
                            }}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="p-1 rounded-lg text-slate-400 transition-all hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-primary"
                          >
                            <Star
                              size={24}
                              className={
                                isFilled
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-transparent text-slate-500 hover:text-amber-300'
                              }
                            />
                          </button>
                        );
                      })}

                      <span className="ml-2 text-xs font-medium text-slate-300">
                        {hoveredRating || rating
                          ? RATING_LABELS[hoveredRating || rating]
                          : 'Click a star'}
                      </span>
                    </div>

                    {errors.rating && (
                      <p className="mt-1 text-xs text-rose-400">
                        {errors.rating}
                      </p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="feedback-message"
                        className="block text-xs font-semibold text-slate-200"
                      >
                        Your Feedback <span className="text-rose-400">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {message.trim().length}/3000
                      </span>
                    </div>

                    <textarea
                      id="feedback-message"
                      name="message"
                      rows={4}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) {
                          setErrors((prev) => ({
                            ...prev,
                            message: undefined,
                          }));
                        }
                      }}
                      placeholder="Share your experience with our courses, teachers, or learning community..."
                      maxLength={3000}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={
                        errors.message ? 'message-error' : undefined
                      }
                      className={`mt-1.5 w-full rounded-xl bg-slate-900/80 p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 border transition-colors focus:outline-none resize-none ${
                        errors.message
                          ? 'border-rose-400 focus:border-rose-400'
                          : 'border-white/15 focus:border-primary'
                      }`}
                    />
                    {errors.message && (
                      <p
                        id="message-error"
                        className="mt-1 text-xs text-rose-400"
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button & Actions */}
                  <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="rounded-full px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-full bg-accent-gradient px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs ring-1 ring-white/15 transition-all hover:ring-primary/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle size={15} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Submit Feedback
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
