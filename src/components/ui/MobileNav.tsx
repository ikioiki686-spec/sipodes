"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

type MobileNavProps = {
  links: Array<{ href: string; label: string }>;
};

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        aria-expanded={open}
        aria-label="Menu navigasi"
        className="interactive-button inline-flex size-11 items-center justify-center rounded-md border border-slate-200 bg-white/80 text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute left-4 right-4 top-20 z-[500] rounded-lg border border-white/40 bg-white/85 p-3 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85"
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="grid gap-1">
              {links.map((link, index) => (
                <motion.a
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-md px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-100 dark:hover:bg-white/10"
                  href={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  key={link.href}
                  onClick={() => setOpen(false)}
                  transition={{ delay: index * 0.04 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
