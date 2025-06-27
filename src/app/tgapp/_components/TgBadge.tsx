"use client";

import clsx from 'clsx';
import React from 'react';

const colors = {
  green: 'bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  gray: 'bg-gray-500/15 text-gray-700 dark:bg-white/5 dark:text-gray-400',
  blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
};

type TgBadgeProps = {
  color?: keyof typeof colors;
  className?: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<'span'>;

export function TgBadge({ color = 'green', className, children, ...props }: TgBadgeProps) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        'inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5',
        colors[color]
      )}
    >
      {children}
    </span>
  );
} 