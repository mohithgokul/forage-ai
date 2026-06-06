import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { pageVariants, gradientForPath, easeCurtain } from "@/lib/motion";

interface Props {
  children: ReactNode;
  path: string;
}

export function PageTransition({ children, path }: Props) {
  const gradient = gradientForPath(path);

  return (
    <>
      {/* Layer 1 — solid void black, leads in */}
      <motion.div
        aria-hidden
        initial={{ y: "100%" }}
        animate={{ y: "100%" }}
        exit={{ y: ["100%", "0%", "0%", "-100%"] }}
        transition={{
          duration: 1.36,
          times: [0, 0.37, 0.51, 1],
          ease: easeCurtain,
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9990,
          pointerEvents: "none",
          background: "#05050F",
        }}
      />
      {/* Layer 2 — per-route gradient, 80ms behind */}
      <motion.div
        aria-hidden
        initial={{ y: "100%" }}
        animate={{ y: "100%" }}
        exit={{ y: ["100%", "0%", "0%", "-100%"] }}
        transition={{
          duration: 1.36,
          times: [0.06, 0.43, 0.51, 0.95],
          ease: easeCurtain,
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9991,
          pointerEvents: "none",
          background: gradient,
        }}
      />
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: "100vh" }}
      >
        {children}
      </motion.div>
    </>
  );
}
