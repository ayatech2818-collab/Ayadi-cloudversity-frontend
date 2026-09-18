'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, X } from 'lucide-react';
import { useCallback, useEffect, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from 'react';
import { createPortal } from 'react-dom';

export interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  // Step 2 details
  programInterest: string;
  learningMode: string;
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
  programInterest: 'Cloud Computing & DevOps',
  learningMode: 'Self-Paced with Mentor Support',
};

const programs = [
  'Cloud Computing & DevOps',
  'Cloud Solutions Architecture',
  'AI & Cloud Data Engineering',
  'Cloud Security & Compliance',
  'Full-Stack Cloud Development',
];

const learningModes = [
  'Self-Paced with Mentor Support',
  'Instructor-Led Live Cohort',
  'Accelerated Bootcamp',
];

const emptySubscribe = () => () => {};

export function EnrollmentModal({ isOpen, onClose }: EnrollmentModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

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

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Ready for future backend submission
    setStep('success');
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
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
              rounded-[26px]
              sm:rounded-[30px]
              bg-accent-strong
              p-5
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
                right-4
                top-4
                sm:right-6
                sm:top-6
                flex
                size-9
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
              <X className="size-4.5 transition-transform duration-200 group-hover:rotate-90" />
            </button>

            {/* ---------- HEADER ---------- */}
            <header className="mb-6 text-center sm:mb-7">
              <h2
                id="enrollment-modal-title"
                className="
                  text-2xl
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
              <p
                id="enrollment-modal-description"
                className="mt-1 text-sm font-medium text-slate-200 sm:text-[15px]"
              >
                {step === 'success'
                  ? 'Application Received'
                  : "We're happy to hear from you"}
              </p>
            </header>

            {/* ---------- STEP 1: CONTACT & PERSONAL DETAILS ---------- */}
            {step === 1 && (
              <form onSubmit={handleNext} noValidate>
                <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2 sm:gap-y-4">
                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1.5 block text-[13px] font-medium text-slate-200"
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
                        h-11
                        w-full
                        rounded-[14px]
                        bg-[#1c274c]/85
                        px-3.5
                        text-sm
                        text-white
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
                      <span id="firstName-error" className="mt-1 block text-xs text-rose-400">
                        {errors.firstName}
                      </span>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-1.5 block text-[13px] font-medium text-slate-200"
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
                        h-11
                        w-full
                        rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        px-3.5
                        text-sm
                        text-white
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
                      className="mb-1.5 block text-[13px] font-medium text-slate-200"
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
                        h-11
                        w-full
                        rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        px-3.5
                        text-sm
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
                      className="mb-1.5 block text-[13px] font-medium text-slate-200"
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
                        h-11
                        w-full
                        rounded-[14px]
                        bg-[#1c274c]/85
                        px-3.5
                        text-sm
                        text-white
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
                      <span id="email-error" className="mt-1 block text-xs text-rose-400">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-[13px] font-medium text-slate-200"
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
                        h-11
                        w-full
                        rounded-[14px]
                        bg-[#1c274c]/85
                        px-3.5
                        text-sm
                        text-white
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
                      <span id="phone-error" className="mt-1 block text-xs text-rose-400">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="address"
                      className="mb-1.5 block text-[13px] font-medium text-slate-200"
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
                        h-11
                        w-full
                        rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        px-3.5
                        text-sm
                        text-white
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
                      className="mb-1.5 block text-[13px] font-medium text-slate-200"
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
                        h-11
                        w-full
                        rounded-[14px]
                        bg-[#1c274c]/85
                        px-3.5
                        text-sm
                        text-white
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
                      <span id="city-error" className="mt-1 block text-xs text-rose-400">
                        {errors.city}
                      </span>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      htmlFor="country"
                      className="mb-1.5 block text-[13px] font-medium text-slate-200"
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
                        h-11
                        w-full
                        rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        px-3.5
                        text-sm
                        text-white
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
                      className="mb-1.5 block text-[13px] font-medium text-slate-200"
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
                        h-11
                        w-full
                        rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        px-3.5
                        text-sm
                        text-white
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
                      className="mb-1.5 block text-[13px] font-medium text-slate-200"
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
                        h-20
                        w-full
                        resize-none
                        rounded-[14px]
                        bg-[#1c274c]/85
                        border
                        border-white/10
                        p-3.5
                        text-sm
                        text-white
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

                {/* Bottom Action - Next Button */}
                <div className="mt-5 flex justify-end sm:mt-6">
                  <button
                    type="submit"
                    className="
                      h-[42px]
                      w-[120px]
                      rounded-[14px]
                      bg-brand-gradient
                      font-bold
                      text-sm
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
                      flex
                      items-center
                      justify-center
                      cursor-pointer
                    "
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* ---------- STEP 2: PROGRAM SELECTION & PREFERENCES ---------- */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Step 2 of 2
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-white">
                    Program & Learning Preferences
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-300">
                    Select your preferred track to personalize your enrollment curriculum.
                  </p>
                </div>

                {/* Program Track Selection */}
                <div>
                  <label
                    htmlFor="programInterest"
                    className="mb-1.5 block text-[13px] font-medium text-slate-200"
                  >
                    Choose Program / Track
                  </label>
                  <select
                    id="programInterest"
                    name="programInterest"
                    value={formData.programInterest}
                    onChange={handleChange}
                    className="
                      h-11
                      w-full
                      rounded-[14px]
                      bg-[#1c274c]
                      border
                      border-white/10
                      px-3.5
                      text-sm
                      text-white
                      transition-all
                      duration-200
                      focus:border-brand-middle
                      focus:ring-1
                      focus:ring-brand-middle
                      focus:outline-none
                      cursor-pointer
                    "
                  >
                    {programs.map((prog) => (
                      <option key={prog} value={prog} className="bg-accent-strong text-white">
                        {prog}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Learning Mode */}
                <div>
                  <label
                    htmlFor="learningMode"
                    className="mb-1.5 block text-[13px] font-medium text-slate-200"
                  >
                    Study Format
                  </label>
                  <select
                    id="learningMode"
                    name="learningMode"
                    value={formData.learningMode}
                    onChange={handleChange}
                    className="
                      h-11
                      w-full
                      rounded-[14px]
                      bg-[#1c274c]
                      border
                      border-white/10
                      px-3.5
                      text-sm
                      text-white
                      transition-all
                      duration-200
                      focus:border-brand-middle
                      focus:ring-1
                      focus:ring-brand-middle
                      focus:outline-none
                      cursor-pointer
                    "
                  >
                    {learningModes.map((mode) => (
                      <option key={mode} value={mode} className="bg-accent-strong text-white">
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Applicant Summary Preview */}
                <div className="rounded-xl bg-[#1c274c]/50 p-3.5 border border-white/5 text-xs text-slate-300">
                  <div className="font-semibold text-white mb-1">Applicant Summary:</div>
                  <div>
                    {formData.firstName} {formData.lastName} &bull; {formData.email}
                  </div>
                  {formData.city && <div>Location: {formData.city}, {formData.country || 'Global'}</div>}
                </div>

                {/* Bottom Actions - Back & Submit */}
                <div className="mt-6 flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-xl
                      px-3.5
                      py-2
                      text-sm
                      font-medium
                      text-slate-300
                      transition-colors
                      duration-200
                      hover:bg-white/10
                      hover:text-white
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-primary
                      cursor-pointer
                    "
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </button>

                  <button
                    type="submit"
                    className="
                      h-[42px]
                      min-w-[140px]
                      rounded-[14px]
                      bg-brand-gradient
                      px-5
                      font-bold
                      text-sm
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
                    Submit Application
                  </button>
                </div>
              </form>
            )}

            {/* ---------- SUCCESS STATE ---------- */}
            {step === 'success' && (
              <div className="py-6 text-center sm:py-8">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                  <CheckCircle2 className="size-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  Enrollment Request Submitted!
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
                  Thank you, <span className="font-semibold text-white">{formData.firstName}</span>. Our admissions advisor will review your preferences for{' '}
                  <span className="text-emerald-300 font-medium">{formData.programInterest}</span> and reach out to you within 24 hours.
                </p>

                <div className="mt-7 flex justify-center">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="
                      h-[42px]
                      min-w-[130px]
                      rounded-[14px]
                      bg-brand-gradient
                      px-6
                      font-bold
                      text-sm
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
