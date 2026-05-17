"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

type AnimatedSectionProps = HTMLMotionProps<"section"> & {
  stagger?: boolean;
};

export function AnimatedSection({
  children,
  stagger = false,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: "easeOut",
            staggerChildren: stagger ? 0.08 : 0,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export const fadeItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
  },
};
