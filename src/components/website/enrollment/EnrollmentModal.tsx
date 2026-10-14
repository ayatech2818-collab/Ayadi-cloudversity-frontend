'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { useCallback, useEffect, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { createEnrollment } from '@/lib/api/enrollment';

export interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
  courseId?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zipcode: string;
  message: string;
}

interface FormErrors {
  firstName?: string;
  email?: string;
  phone?: string;
  city?: string;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  zipcode: '',
  message: '',
};

const emptySubscribe = () => () => {};

export function EnrollmentModal({ isOpen, onClose, courseTitle, courseId }: EnrollmentModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [step, setStep] = useState<1 | 'success'>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Lock body scrolling when modal is open
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

  // Reset form state on close
  const handleClose = useCallback(() => {
    onClose();
    // Optional timeout to avoid visually jarring reset while fading out
    setTimeout(() => {
      setStep(1);
      setErrors({});
    }, 300);
  }, [onClose]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for field as user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateStep1()) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const composedMessage = [
        courseTitle ? `Course: ${courseTitle}${courseId ? ` (ID: ${courseId})` : ''}` : null,
        formData.message.trim() || null,
      ]
        .filter(Boolean)
        .join('\n\n');

      await createEnrollment({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim() || null,

        date_of_birth:
            formData.dateOfBirth || null,

        email: formData.email.trim(),
        phone: formData.phone.trim() || null,

        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        country: formData.country.trim() || null,
        zipcode: formData.zipcode.trim() || null,

        message: composedMessage || null,
      });

      setStep("success");
    } catch (error: unknown) {
      console.error(
          "Enrollment submission failed:",
          error
      );

      const errResponse = error as { response?: { data?: { detail?: string } } } | undefined;
      setSubmitError(
          errResponse?.response?.data?.detail ||
              "Something went wrong while submitting your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="enrollment-modal-title"
          aria-describedby="enrollment-modal-description"
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto"
        >
          {/* ---------- BACKDROP OVERLAY ---------- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={handleClose}
            aria-hidden="true"
            className="fixed inset-0 bg-[#080d1e]/75 backdrop-blur-xl"
          />

          {/* ---------- MODAL CARD ---------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="
              relative
              z-10
              w-full
              max-w-[780px]
              max-h-[92vh]
              overflow-y-auto
              rounded-[20px]
              sm:rounded-[30px]
              bg-accent-strong
              p-4
              sm:p-8
              md:p-9
              text-white
              shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(20,29,63,0.6)]
              ring-1
              ring-inset
              ring-white/15
            "
          >
            {/* Ambient Radial Sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] overflow-hidden"
            >
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[460px] rounded-full bg-brand-middle/15 blur-3xl" />
              <div className="absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close modal"
              className="
                group
                absolute
                right-3.5
                top-3.5
                sm:right-6
                sm:top-6
                flex
                size-7.5
                sm:size-9
                items-center
                justify-center
                rounded-full
                bg-white/[0.08]
                text-white/70
                transition-all
                duration-200
                hover:bg-white/20
                hover:text-white
                hover:scale-105
                active:scale-95
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-primary
              "
            >
              <X className="size-3.5 sm:size-4.5 transition-transform duration-200 group-hover:rotate-90" />
            </button>

            {/* ---------- HEADER ---------- */}
            <header className="mb-4 text-center sm:mb-7">
              <h2
                id="enrollment-modal-title"
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  bg-brand-gradient
                  bg-clip-text
                  text-transparent
                  sm:text-3xl
                  md:text-[32px]
                "
              >
                Ayadi Cloudversity
              </h2>
              {courseTitle ? (
                <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-primary/40">
                  <span className="truncate">Course: {courseTitle}</span>
                </div>
              ) : null}
              <p
                id="enrollment-modal-description"
                className="mt-1 text-xs font-medium text-slate-200 sm:text-[15px]"
              >
                {step === 'success'
                  ? 'Application Received'
                  : courseTitle
                  ? `Enrollment enquiry for ${courseTitle}`
                  : "We're happy to hear from you"}
              </p>
            </header>

            {/* ---------- STEP 1: CONTACT & PERSONAL DETAILS ---------- */}
            {step === 1 && (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-x-5 gap-y-2.5 sm:grid-cols-2 sm:gap-y-4">
                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1 block text-xs font-medium text-slate-200 sm:mb-1.5 sm:text-[13px]"
                    >
                      First Name<span className="ml-0.5 text-rose-400 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Your Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.firstName)}
                      aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                      className={`
                        h-9
                        sm:h-11
                        w-full
                        rounded-xl
                        sm:rounded-[14px]
                        bg-[#1c274c]/85
                        px-3
                        sm:px-3.5
                        text-xs
                        sm:text-sm
                        text-white
                        placeholder:text-xs
                        sm:placeholder:text-sm
                        placeholder:text-slate-400/60
                        border
                        transition-all
                        duration-200
                        focus:outline-none
                        focus:bg-[#202d58]
                        ${
                          errors.firstName
                            ? 'border-rose-400/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400'
                            : 'border-white/10 focus:border-brand-middle focus:ring-1 focus:ring-brand-middle'
                        }
                      `}
                    />
                    {errors.firstName && (
                      <span id="firstName-error" className="mt-0.5 block text-[11px] text-rose-400 sm:mt-1 sm:text-xs">
                        {errors.firstName}
                      </span>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-1 block text-xs font-medium text-slate-200 sm:mb-1.5 sm:text-[13px]"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Your Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="
                        h-9
                        sm:h-11
                        w-full
                        rounded-xl
                        sm:rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        px-3
                        sm:px-3.5
                        text-xs
                        sm:text-sm
                        text-white
                        placeholder:text-xs
                        sm:placeholder:text-sm
                        placeholder:text-slate-400/60
                        transition-all
                        duration-200
                        focus:border-brand-middle
                        focus:ring-1
                        focus:ring-brand-middle
                        focus:bg-[#202d58]
                        focus:outline-none
                      "
                    />
                  </div>

                  {/* Date Of Birth (Full row) */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="dateOfBirth"
                      className="mb-1 block text-xs font-medium text-slate-200 sm:mb-1.5 sm:text-[13px]"
                    >
                      Date Of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="
                        h-9
                        sm:h-11
                        w-full
                        rounded-xl
                        sm:rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        px-3
                        sm:px-3.5
                        text-xs
                        sm:text-sm
                        text-white
                        transition-all
                        duration-200
                        focus:border-brand-middle
                        focus:ring-1
                        focus:ring-brand-middle
                        focus:bg-[#202d58]
                        focus:outline-none
                        [color-scheme:dark]
                        cursor-pointer
                      "
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1 block text-xs font-medium text-slate-200 sm:mb-1.5 sm:text-[13px]"
                    >
                      Email<span className="ml-0.5 text-rose-400 font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={`
                        h-9
                        sm:h-11
                        w-full
                        rounded-xl
                        sm:rounded-[14px]
                        bg-[#1c274c]/85
                        px-3
                        sm:px-3.5
                        text-xs
                        sm:text-sm
                        text-white
                        placeholder:text-xs
                        sm:placeholder:text-sm
                        placeholder:text-slate-400/60
                        border
                        transition-all
                        duration-200
                        focus:outline-none
                        focus:bg-[#202d58]
                        ${
                          errors.email
                            ? 'border-rose-400/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400'
                            : 'border-white/10 focus:border-brand-middle focus:ring-1 focus:ring-brand-middle'
                        }
                      `}
                    />
                    {errors.email && (
                      <span id="email-error" className="mt-0.5 block text-[11px] text-rose-400 sm:mt-1 sm:text-xs">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1 block text-xs font-medium text-slate-200 sm:mb-1.5 sm:text-[13px]"
                    >
                      Phone<span className="ml-0.5 text-rose-400 font-bold">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      className={`
                        h-9
                        sm:h-11
                        w-full
                        rounded-xl
                        sm:rounded-[14px]
                        bg-[#1c274c]/85
                        px-3
                        sm:px-3.5
                        text-xs
                        sm:text-sm
                        text-white
                        placeholder:text-xs
                        sm:placeholder:text-sm
                        placeholder:text-slate-400/60
                        border
                        transition-all
                        duration-200
                        focus:outline-none
                        focus:bg-[#202d58]
                        ${
                          errors.phone
                            ? 'border-rose-400/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400'
                            : 'border-white/10 focus:border-brand-middle focus:ring-1 focus:ring-brand-middle'
                        }
                      `}
                    />
                    {errors.phone && (
                      <span id="phone-error" className="mt-0.5 block text-[11px] text-rose-400 sm:mt-1 sm:text-xs">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="address"
                      className="mb-1 block text-xs font-medium text-slate-200 sm:mb-1.5 sm:text-[13px]"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleChange}
                      className="
                        h-9
                        sm:h-11
                        w-full
                        rounded-xl
                        sm:rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        px-3
                        sm:px-3.5
                        text-xs
                        sm:text-sm
                        text-white
                        placeholder:text-xs
                        sm:placeholder:text-sm
                        placeholder:text-slate-400/60
                        transition-all
                        duration-200
                        focus:border-brand-middle
                        focus:ring-1
                        focus:ring-brand-middle
                        focus:bg-[#202d58]
                        focus:outline-none
                      "
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-1 block text-xs font-medium text-slate-200 sm:mb-1.5 sm:text-[13px]"
                    >
                      City<span className="ml-0.5 text-rose-400 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? 'city-error' : undefined}
                      className={`
                        h-9
                        sm:h-11
                        w-full
                        rounded-xl
                        sm:rounded-[14px]
                        bg-[#1c274c]/85
                        px-3
                        sm:px-3.5
                        text-xs
                        sm:text-sm
                        text-white
                        placeholder:text-xs
                        sm:placeholder:text-sm
                        placeholder:text-slate-400/60
                        border
                        transition-all
                        duration-200
                        focus:outline-none
                        focus:bg-[#202d58]
                        ${
                          errors.city
                            ? 'border-rose-400/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400'
                            : 'border-white/10 focus:border-brand-middle focus:ring-1 focus:ring-brand-middle'
                        }
                      `}
                    />
                    {errors.city && (
                      <span id="city-error" className="mt-0.5 block text-[11px] text-rose-400 sm:mt-1 sm:text-xs">
                        {errors.city}
                      </span>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      htmlFor="country"
                      className="mb-1 block text-xs font-medium text-slate-200 sm:mb-1.5 sm:text-[13px]"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      placeholder="Country"
                      value={formData.country}
                      onChange={handleChange}
                      className="
                        h-9
                        sm:h-11
                        w-full
                        rounded-xl
                        sm:rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        px-3
                        sm:px-3.5
                        text-xs
                        sm:text-sm
                        text-white
                        placeholder:text-xs
                        sm:placeholder:text-sm
                        placeholder:text-slate-400/60
                        transition-all
                        duration-200
                        focus:border-brand-middle
                        focus:ring-1
                        focus:ring-brand-middle
                        focus:bg-[#202d58]
                        focus:outline-none
                      "
                    />
                  </div>

                  {/* Zipcode */}
                  <div>
                    <label
                      htmlFor="zipcode"
                      className="mb-1 block text-xs font-medium text-slate-200 sm:mb-1.5 sm:text-[13px]"
                    >
                      Zipcode
                    </label>
                    <input
                      type="text"
                      id="zipcode"
                      name="zipcode"
                      placeholder="Zipcode"
                      value={formData.zipcode}
                      onChange={handleChange}
                      className="
                        h-9
                        sm:h-11
                        w-full
                        rounded-xl
                        sm:rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        px-3
                        sm:px-3.5
                        text-xs
                        sm:text-sm
                        text-white
                        placeholder:text-xs
                        sm:placeholder:text-sm
                        placeholder:text-slate-400/60
                        transition-all
                        duration-200
                        focus:border-brand-middle
                        focus:ring-1
                        focus:ring-brand-middle
                        focus:bg-[#202d58]
                        focus:outline-none
                      "
                    />
                  </div>

                  {/* Message (Full row) */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="message"
                      className="mb-1 block text-xs font-medium text-slate-200 sm:mb-1.5 sm:text-[13px]"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Your message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="
                        h-16
                        sm:h-20
                        w-full
                        resize-none
                        rounded-xl
                        sm:rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        p-2.5
                        sm:p-3.5
                        text-xs
                        sm:text-sm
                        text-white
                        placeholder:text-xs
                        sm:placeholder:text-sm
                        placeholder:text-slate-400/60
                        transition-all
                        duration-200
                        focus:border-brand-middle
                        focus:ring-1
                        focus:ring-brand-middle
                        focus:bg-[#202d58]
                        focus:outline-none
                      "
                    />
                  </div>
                </div>

                {submitError && (
                  <div className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
                    {submitError}
                  </div>
                )}

                {/* Bottom Action - Submit Application */}
                <div className="mt-4 flex justify-end sm:mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      h-9
                      sm:h-[42px]
                      min-w-[120px]
                      sm:min-w-[140px]
                      rounded-xl
                      sm:rounded-[14px]
                      bg-brand-gradient
                      px-4
                      sm:px-5
                      font-bold
                      text-xs
                      sm:text-sm
                      text-white
                      shadow-md
                      shadow-accent/40
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:shadow-lg
                      hover:shadow-brand-middle/25
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-primary
                      cursor-pointer
                    "
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            )}

            {/* ---------- SUCCESS STATE ---------- */}
            {step === 'success' && (
              <div className="py-4 text-center sm:py-8">
                <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 sm:mb-4 sm:size-14">
                  <CheckCircle2 className="size-6 text-emerald-400 sm:size-8" />
                </div>
                <h3 className="text-lg font-bold text-white sm:text-2xl">
                  Enrollment Request Submitted!
                </h3>
                <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-300 sm:mt-2 sm:text-sm">
                  Thank you, <span className="font-semibold text-white">{formData.firstName}</span>. Our admissions advisor will review your application{courseTitle ? <> for <span className="font-semibold text-white">{courseTitle}</span></> : ''} and reach out to you within 24 hours.
                </p>

                <div className="mt-5 flex justify-center sm:mt-7">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="
                      h-9
                      sm:h-[42px]
                      min-w-[110px]
                      sm:min-w-[130px]
                      rounded-xl
                      sm:rounded-[14px]
                      bg-brand-gradient
                      px-4
                      sm:px-6
                      font-bold
                      text-xs
                      sm:text-sm
                      text-white
                      shadow-md
                      shadow-accent/40
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:shadow-lg
                      hover:shadow-brand-middle/25
                      active:translate-y-0
                      active:scale-[0.98]
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-primary
                      cursor-pointer
                    "
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
