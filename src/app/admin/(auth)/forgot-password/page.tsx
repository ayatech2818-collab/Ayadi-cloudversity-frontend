"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEPS = [
  {
    title: "Enter your email",
    desc: "We send an 8-digit code",
    icon: Mail,
  },
  {
    title: "Verify the code",
    desc: "Confirm it's really you",
    icon: ShieldCheck,
  },
  {
    title: "Set new password",
    desc: "12+ characters, you're done",
    icon: KeyRound,
  },
];

const ACTIVE_STEP = 0;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const floatTransition = (duration: number, delay = 0) =>
    reduceMotion
      ? { duration: 0 }
      : {
          duration,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay,
        };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your admin email.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(trimmed);

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);

    // Brief success beat, then continue the flow
    window.setTimeout(() => {
      router.push(
        `/admin/reset-password?email=${encodeURIComponent(trimmed)}`
      );
    }, 1400);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8f6]">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#1b6b4f]/10 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
          className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-[#0d4f3b]/10 blur-3xl"
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_30px_100px_rgba(20,70,50,0.12)] lg:grid-cols-[1.05fr_0.95fr]"
        >
          {/* LEFT BRAND PANEL */}
          <motion.section
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative hidden min-h-[650px] overflow-hidden bg-[#0b4635] lg:flex"
          >
            {/* Decorative circles */}
            <motion.div
              animate={reduceMotion ? {} : { y: [0, -18, 0], rotate: [0, 3, 0] }}
              transition={floatTransition(7)}
              className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10"
            />
            <motion.div
              animate={reduceMotion ? {} : { y: [0, 15, 0], rotate: [0, -4, 0] }}
              transition={floatTransition(8)}
              className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full border border-white/10"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(91,190,145,0.18),transparent_35%)]" />

            <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <img
                  src="/images/ayadi-logo-white.png"
                  alt="Ayadi Cloudversity"
                  className="h-auto w-40 object-contain"
                />
              </motion.div>

              {/* Main content */}
              <div className="max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25 }}
                >
                  <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-emerald-200/80">
                    Account recovery
                  </p>
                  <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white xl:text-5xl">
                    Locked out?
                    <br />
                    <span className="text-emerald-200">
                      Let&apos;s get you back in.
                    </span>
                  </h2>
                  <p className="mt-6 max-w-md text-base leading-7 text-white/65">
                    Reset your admin access in three quick steps. Your
                    account stays secure the whole way.
                  </p>
                </motion.div>

                {/* Steps */}
                <motion.ol
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="relative mt-9 space-y-5"
                >
                  {/* connecting line */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-6 left-[19px] top-6 w-px bg-white/10"
                  />
                  {STEPS.map((step, index) => {
                    const isActive = index === ACTIVE_STEP;
                    const isDone = index < ACTIVE_STEP;
                    const Icon = step.icon;
                    return (
                      <motion.li
                        key={step.title}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.5 + index * 0.12,
                          ease: EASE,
                        }}
                        className="relative flex items-center gap-4"
                      >
                        <span
                          className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-1 transition-colors ${
                            isActive
                              ? "bg-white text-emerald-900 ring-white"
                              : isDone
                                ? "bg-emerald-300 text-emerald-950 ring-emerald-300"
                                : "bg-white/[0.07] text-white/60 ring-white/15"
                          }`}
                        >
                          {isDone ? (
                            <Check size={17} strokeWidth={2.4} />
                          ) : (
                            <Icon size={17} strokeWidth={2} />
                          )}
                        </span>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isActive ? "text-white" : "text-white/70"
                            }`}
                          >
                            <span className="mr-2 font-mono text-xs text-white/35">
                              0{index + 1}
                            </span>
                            {step.title}
                          </p>
                          <p className="mt-0.5 text-xs text-white/50">
                            {step.desc}
                          </p>
                        </div>
                        {isActive && (
                          <motion.span
                            layoutId="forgot-active-pill"
                            className="ml-auto hidden rounded-full border border-emerald-200/30 bg-emerald-200/10 px-3 py-1 text-[11px] font-medium text-emerald-100 xl:block"
                          >
                            You are here
                          </motion.span>
                        )}
                      </motion.li>
                    );
                  })}
                </motion.ol>
              </div>

              {/* Bottom */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xs text-white/35"
              >
                © {new Date().getFullYear()} Ayadi Cloudversity
              </motion.p>
            </div>
          </motion.section>

          {/* RIGHT FORM PANEL */}
          <motion.section
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="flex min-h-[650px] items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16"
          >
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-10 flex justify-center lg:hidden"
              >
                <div className="rounded-2xl bg-[#0b4635] px-6 py-4">
                  <img
                    src="/images/ayadi-logo-white.png"
                    alt="Ayadi Cloudversity"
                    className="w-36"
                  />
                </div>
              </motion.div>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#368364]">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#368364]/10 font-mono text-[11px] font-bold">
                    1
                  </span>
                  Step 1 of 3 — your email
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#10251d] sm:text-4xl">
                  Forgot password?
                </h1>
                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Enter your admin email and we&apos;ll send you an
                  8-digit reset code.
                </p>
              </motion.div>

              {/* Form / success */}
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="mt-9 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 text-center"
                  >
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                        delay: 0.1,
                      }}
                      className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg shadow-emerald-900/20"
                    >
                      <Check size={22} strokeWidth={2.5} />
                    </motion.span>
                    <p className="mt-4 text-sm font-semibold text-[#10251d]">
                      Code sent
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Check <span className="font-medium text-gray-800">{email.trim()}</span>{" "}
                      for your code. Taking you to verification…
                    </p>
                    <div
                      aria-hidden="true"
                      className="mx-auto mt-5 h-1 w-32 overflow-hidden rounded-full bg-emerald-900/10"
                    >
                      <motion.span
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="block h-full w-full bg-brand-gradient"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mt-9 space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-[#1a2c24]"
                      >
                        Email address
                      </label>
                      <div className="relative">
                        <Mail
                          size={17}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          required
                          autoComplete="email"
                          placeholder="admin@example.com"
                          className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/70 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#368364] focus:bg-white focus:ring-4 focus:ring-[#368364]/10"
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -5 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -5 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          role="alert"
                          className="overflow-hidden rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.01 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      className="group relative h-12 w-full cursor-pointer overflow-hidden rounded-xl bg-accent-gradient px-5 text-sm font-medium text-white shadow-lg shadow-[#0b4635]/15 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <motion.span
                              animate={
                                reduceMotion ? {} : { rotate: 360 }
                              }
                              transition={{
                                duration: 0.7,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="block h-4 w-4 shrink-0 rounded-full border-2 border-white/20 border-t-white"
                            />
                            Sending code...
                          </>
                        ) : (
                          <>
                            Send reset code
                            <ArrowRight
                              size={17}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </span>
                    </motion.button>

                    <div className="flex items-center justify-center pt-1">
                      <Link
                        href="/admin/login"
                        className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#368364] transition-colors hover:text-[#0b4635]"
                      >
                        <ArrowLeft
                          size={14}
                          className="transition-transform duration-300 group-hover:-translate-x-0.5"
                        />
                        Back to login
                      </Link>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1 text-xs text-gray-400">
                      <Lock size={14} />
                      Secure admin access
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </main>
  );
}
