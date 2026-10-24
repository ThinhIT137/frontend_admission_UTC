"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
export default function PageMotion({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const reduced = useReducedMotion();
    return (
        <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
