"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface RevealProps {
  /** Its place in the page's sequence: each step waits a beat longer. */
  order?: number;
  className?: string;
  children: ReactNode;
}

/** A short rise as the dashboard opens, one band of the page after another. */
export default function Reveal({
  order = 0,
  className,
  children,
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: order * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
