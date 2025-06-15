"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      className="opacity-25"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText,
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = "relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed active:scale-95";

  const variants = {
    primary: "bg-gradient-primary text-white hover:bg-gradient-primary-hover hover:shadow-lg hover:shadow-primary/25 focus:ring-primary/50 disabled:opacity-50",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500/50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50 disabled:opacity-50",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50 disabled:opacity-50",
    outline: "border border-stroke dark:border-dark-3 bg-transparent text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-primary/50 disabled:opacity-50"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm gap-2",
    md: "px-4 py-3 text-base gap-2",
    lg: "px-6 py-4 text-lg gap-3"
  };

  const spinnerSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && !loadingText && (
        <Spinner className={spinnerSizes[size]} />
      )}
      
      <span className={cn(
        "transition-opacity duration-200",
        isLoading && "opacity-0"
      )}>
        {children}
      </span>

      {isLoading && loadingText && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner className={cn("mr-2", spinnerSizes[size])} />
          {loadingText}
        </span>
      )}
    </button>
  );
};

export { LoadingButton, type LoadingButtonProps }; 