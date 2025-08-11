/**
 * OptimizedMotion.tsx
 * 
 * Wrapper otimizado para animações Framer Motion
 * Reduz animações desnecessárias e melhora performance
 */

import { motion, MotionProps } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { ReactNode, useRef } from 'react';
import React from 'react';

interface OptimizedMotionProps extends MotionProps {
  children: ReactNode;
  triggerOnce?: boolean;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
}

export function OptimizedMotion({
  children,
  triggerOnce = true,
  threshold = 0.1,
  rootMargin = '0px',
  fallback,
  ...motionProps
}: OptimizedMotionProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce
  });

  // Use effect to synchronize refs
  React.useEffect(() => {
    if (elementRef.current && targetRef.current !== elementRef.current) {
      // Force update targetRef using type assertion
      (targetRef as React.MutableRefObject<HTMLDivElement | null>).current = elementRef.current;
    }
  }, [targetRef]);

  // Renderiza fallback estático se não estiver na viewport
  if (!isIntersecting && fallback) {
    return <div ref={elementRef}>{fallback}</div>;
  }

  return (
    <motion.div
      ref={elementRef}
      {...motionProps}
      // Apenas anima quando está visível
      animate={isIntersecting ? motionProps.animate : motionProps.initial}
    >
      {children}
    </motion.div>
  );
}

// Variações pré-definidas para animações comuns
// Detecta preferência de animação reduzida
const prefersReducedMotion = typeof window !== 'undefined' && 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const fadeInUp = {
  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: prefersReducedMotion ? 0.3 : 0.6, ease: "easeOut" }
};

export const fadeInLeft = {
  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: prefersReducedMotion ? 0.3 : 0.6, ease: "easeOut" }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};