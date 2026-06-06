import type { Variants, Transition } from "framer-motion";

export const easeExpo: Transition["ease"] = [0.16, 1, 0.3, 1];
export const easeCurtain: Transition["ease"] = [0.76, 0, 0.24, 1];

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      delay: 0.75,
      ease: easeExpo,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const childVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeExpo } },
};

export const scrollRevealVariants: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeExpo } },
};

export const cardGridContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

export const cardGridItem: Variants = {
  initial: { opacity: 0, y: 32, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: easeExpo },
  },
};

export function gradientForPath(path: string): string {
  if (path.startsWith("/apps/")) {
    return "linear-gradient(135deg, #F59E0B 0%, #06B6D4 100%)";
  }
  switch (path) {
    case "/auth":
      return "linear-gradient(135deg, #F43F5E 0%, #F59E0B 100%)";
    case "/dashboard":
      return "linear-gradient(135deg, #06B6D4 0%, #7C3AED 100%)";
    case "/new":
      return "linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)";
    case "/settings":
      return "linear-gradient(135deg, #F43F5E 0%, #7C3AED 100%)";
    case "/":
    default:
      return "linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)";
  }
}
