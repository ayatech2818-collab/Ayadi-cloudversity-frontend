"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCardTilt } from "@/components/website/ui/card-chrome";

import { getCurrentAdmin } from "@/lib/api/auth";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tilt = useCardTilt();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("Login session was not created.");
      setLoading(false);
      return;
    }

    try {
      await getCurrentAdmin();

      router.push("/admin");
    } catch (error) {
      await supabase.auth.signOut();

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 403
      ) {
        setError("You do not have admin access.");
      } else {
        setError("Unable to verify admin access.");
      }

      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8f6]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#1b6b4f]/10 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.4,
            delay: 0.2,
            ease: "easeOut",
          }}
          className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-[#0d4f3b]/10 blur-3xl"
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            // {...tilt}
            className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_30px_100px_rgba(20,70,50,0.12)] lg:grid-cols-[1.05fr_0.95fr]"
          >          {/* LEFT BRAND PANEL */}
          <motion.section
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative hidden min-h-[650px] overflow-hidden bg-[#0b4635] lg:flex"
          >
            {/* Decorative circles */}
            <motion.div
              animate={{
                y: [0, -18, 0],
                rotate: [0, 3, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10"
            />

            <motion.div
              animate={{
                y: [0, 15, 0],
                rotate: [0, -4, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full border border-white/10"
            />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(91,190,145,0.18),transparent_35%)]" />

            <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.15,
                }}
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
                  transition={{
                    duration: 0.7,
                    delay: 0.25,
                  }}
                >
                  <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-emerald-200/80">
                    Admin Portal
                  </p>

                  <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white xl:text-5xl">
                    Build, manage &
                    <br />
                    <span className="text-emerald-200">
                      inspire learning.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-md text-base leading-7 text-white/65">
                    Manage courses, students, learning content and
                    everything that powers the Ayadi Cloudversity
                    learning experience.
                  </p>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.4,
                  }}
                  className="mt-9 flex flex-wrap gap-3"
                >
                  {[
                    "Course Management",
                    "Student Management",
                    "Learning Content",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs text-white/70 backdrop-blur-sm"
                    >
                      {item}
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Bottom */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.6,
                }}
                className="text-xs text-white/35"
              >
                © {new Date().getFullYear()} Ayadi Cloudversity
              </motion.p>
            </div>
          </motion.section>

          {/* RIGHT LOGIN PANEL */}
          <motion.section
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
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
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                }}
              >
                <p className="mb-3 text-sm font-medium text-[#368364]">
                  Welcome back
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-[#10251d] sm:text-4xl">
                  Sign in to your account
                </h1>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Enter your credentials to access the Ayadi
                  Cloudversity admin portal.
                </p>
              </motion.div>

              {/* Form */}
              <motion.form
                onSubmit={handleLogin}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.3,
                }}
                className="mt-9 space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#1a2c24]"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    autoComplete="email"
                    placeholder="admin@example.com"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#368364] focus:bg-white focus:ring-4 focus:ring-[#368364]/10"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[#1a2c24]"
                    >
                      Password
                    </label>

                    <Link
                      href="/admin/forgot-password"
                      className="text-xs font-medium text-[#368364] transition-colors hover:text-[#0b4635]"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-4 pr-12 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#368364] focus:bg-white focus:ring-4 focus:ring-[#368364]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      {showPassword ? (
                        /* Eye off */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c5 0 8.5 5 8.5 7s-3.5 7-8.5 7a10.43 10.43 0 0 1-4.08-.83" />
                          <path d="M6.61 6.61C4.22 8.22 3.5 10.5 3.5 12c0 2 3.5 7 8.5 7" />
                          <path d="m3 3 18 18" />
                        </svg>
                      ) : (
                        /* Eye */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Login button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.01 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-accent-gradient px-5 text-sm font-medium text-white shadow-lg shadow-[#0b4635]/15 transition-all hover:bg-[#0e5943] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="block h-4 w-4 shrink-0 rounded-full border-2 border-white/20 border-t-white"
                        />                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Security note */}
                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      width="18"
                      height="11"
                      x="3"
                      y="11"
                      rx="2"
                    />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>

                  Secure admin access
                </div>
              </motion.form>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </main>
  );
}