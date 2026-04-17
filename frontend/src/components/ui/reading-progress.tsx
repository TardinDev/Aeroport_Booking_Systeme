import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Hair-thin coral line that tracks reading progress across the page.
 * GPU-accelerated (scaleX only), respects reduced motion via the global override.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-coral"
    />
  );
}
