"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Images,
} from "lucide-react";

const stats = [
  {
    title: "Courses",
    value: "—",
    description: "Total courses",
    icon: BookOpen,
  },
  {
    title: "Blogs",
    value: "—",
    description: "Published articles",
    icon: FileText,
  },
  {
    title: "Media",
    value: "—",
    description: "Uploaded files",
    icon: Images,
  },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      {/* Welcome */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mb-8"
      >
        <p className="mb-2 text-sm font-medium text-[#368364]">
          Admin Dashboard
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-[#10251d] sm:text-3xl">
          Good morning, Ayadi Admin 👋
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Here's an overview of your learning platform.
        </p>
      </motion.section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
              }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_12px_40px_rgba(20,70,50,0.04)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-semibold text-[#10251d]">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f4ed] text-[#368364]">
                  <Icon size={20} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* The rest of dashboard content */}
      {/* Course activity */}
      {/* Recent activity */}
      {/* Recent courses */}
    </div>
  );
}