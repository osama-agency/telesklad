"use client";

import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";
import { SetStateActionType } from "@/types/set-state-action-type";
import { cva } from "class-variance-authority";
import {
  createContext,
  type HTMLAttributes,
  type RefObject,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

type PopoverContextType = {
  isOpen: boolean;
  setIsOpen: SetStateActionType<boolean>;
  popoverContentId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

const PopoverContext = createContext<PopoverContextType | null>(null);

export function usePopoverContext() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("usePopoverContext must be used within a PopoverProvider");
  }
  return context;
}

type PopoverProps = {
  children: React.ReactNode;
  className?: string;
};

export function Popover({ children, className }: PopoverProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const popoverContentId = useId();

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };

      document.body.style.pointerEvents = "none";

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }

    if (!isOpen) {
      document.body.style.removeProperty("pointer-events");
    }
  }, [isOpen]);

  return (
    <PopoverContext.Provider
      value={{ isOpen, setIsOpen, popoverContentId, triggerRef }}
    >
      <div className={`relative inline-block ${className}`}>{children}</div>
    </PopoverContext.Provider>
  );
}

type TriggerProps = HTMLAttributes<HTMLButtonElement> & {};

export function PopoverTrigger({
  children,
  onClick,
  className,
  ...props
}: TriggerProps) {
  const { setIsOpen, isOpen, popoverContentId, triggerRef } =
    usePopoverContext();

  return (
    <button
      ref={triggerRef}
      onClick={(e) => {
        setIsOpen((prev) => !prev);
        onClick?.(e);
      }}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-controls={popoverContentId}
      type="button"
      className={cn(
        "inline-flex rounded-[5px] bg-primary px-5 py-2.5 font-medium text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const popoverStyles = cva(
  "pointer-events-auto absolute z-999 w-max max-w-[311px] rounded bg-white drop-shadow-5 dark:bg-dark-2",
  {
    variants: {
      position: {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
        left: "right-full top-0 mr-3",
        right: "left-full top-0 ml-3",
      },
    },
  },
);

type Position = "top" | "bottom" | "left" | "right";

type PopoverContentProps = {
  position: Position;
  children: React.ReactNode;
  className?: string;
};

export function PopoverContent({
  children,
  position,
  className,
}: PopoverContentProps) {
  const { isOpen, setIsOpen, popoverContentId } = usePopoverContext();
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="dialog"
      id={popoverContentId}
      className={cn(popoverStyles({ position }), className)}
    >
      <Indicator position={position} />
      {children}
    </div>
  );
}

const indicatorStyles = cva(
  "absolute size size-4 rounded-sm rotate-45 bg-white dark:bg-dark-2",
  {
    variants: {
      position: {
        top: "-bottom-1.5 left-1/2 -translate-x-1/2",
        bottom: "-top-1.5 left-1/2 -translate-x-1/2",
        left: "-right-1.5 -translate-y-1/2",
        right: "-left-1.5 -translate-y-1/2",
      },
    },
  },
);

function Indicator({ position }: { position: Position }) {
  const { triggerRef } = usePopoverContext();

  if (!triggerRef.current) return null;

  const { height: triggerHeight } = triggerRef.current.getBoundingClientRect();

  return (
    <span
      className={indicatorStyles({ position })}
      style={{
        top:
          position === "left" || position === "right"
            ? triggerHeight / 2 + "px"
            : undefined,
      }}
    />
  );
}
