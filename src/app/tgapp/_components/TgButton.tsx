"use client";

import clsx from 'clsx';
import React, { forwardRef } from 'react';

const styles = {
  base: [
    // Base
    'relative isolate inline-flex items-baseline justify-center gap-x-2 rounded-lg border text-base/6 font-semibold',
    // Sizing
    'px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6',
    // Focus
    'focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    // Disabled
    'disabled:opacity-50',
    // Icon
    '*:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:self-center sm:*:data-[slot=icon]:my-1 sm:*:data-[slot=icon]:size-4',
  ],
  solid: [
    // Green color scheme for tgapp
    'bg-green-500 border-green-600 text-white shadow-sm',
    'hover:bg-green-600 active:bg-green-700',
    'dark:bg-green-600 dark:border-green-700 dark:hover:bg-green-700',
  ],
  outline: [
    // Green outline for tgapp
    'border-green-500 text-green-600 bg-transparent',
    'hover:bg-green-50 active:bg-green-100',
    'dark:border-green-400 dark:text-green-400 dark:hover:bg-green-500/10',
  ],
  ghost: [
    // Ghost variant
    'border-transparent text-gray-600 bg-transparent',
    'hover:bg-gray-100 active:bg-gray-200',
    'dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700',
  ],
  selected: [
    // Selected state for filter buttons
    'bg-green-500 border-green-600 text-white shadow-sm',
    'dark:bg-green-600 dark:border-green-700',
  ],
};

type TgButtonProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  selected?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<'button'>;

export const TgButton = forwardRef<HTMLButtonElement, TgButtonProps>(
  function TgButton({ variant = 'solid', selected = false, className, children, ...props }, ref) {
    let classes = clsx(
      className,
      styles.base,
      selected ? styles.selected : styles[variant]
    );

    return (
      <button {...props} className={classes} ref={ref}>
        <TouchTarget>{children}</TouchTarget>
      </button>
    );
  }
);

/**
 * Expand the hit area to at least 44×44px on touch devices
 */
function TouchTarget({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span
        className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
        aria-hidden="true"
      />
      {children}
    </>
  );
} 