"use client";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import {
  createContext,
  HTMLAttributes,
  useContext,
  useId,
  useState,
} from "react";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variants: "styleOne" | "styleTwo" | "styleThree";
  id: string;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("useTabsContext must be used within a Tabs Component");
  }

  return context;
}

type TabsProps = {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
  variants: "styleOne" | "styleTwo" | "styleThree";
};

export function Tabs({
  defaultValue,
  children,
  className,
  variants,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const id = useId();

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variants, id }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

const tabsListStyles = cva(
  "flex flex-wrap gap-3.5 rounded-lg border-stroke dark:border-dark-3",
  {
    variants: {
      variant: {
        styleOne: "border p-3",
        styleTwo: "border-b p-3",
        styleThree: "border-b",
      },
    },
  },
);

type TabListProps = {
  children: React.ReactNode;
  className?: string;
};

export function TabList({ children, className }: TabListProps) {
  const { variants } = useTabsContext();

  return (
    <div
      role="tablist"
      className={cn(tabsListStyles({ variant: variants }), className)}
    >
      {children}
    </div>
  );
}

const tabTriggerStyles = cva("font-medium hover:border-primary", {
  variants: {
    variant: {
      default:
        "rounded-[7px] border border-stroke px-5 py-[7px] bg-gray-2 dark:bg-dark-2 dark:border-dark-3 text-dark dark:text-white data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:border-primary hover:bg-primary hover:text-white",
      plain:
        "pb-[7px] border-b-2 border-transparent hover:border-primary hover:text-primary data-[active=true]:border-primary data-[active=true]:text-primary",
    },
  },
});

type TabTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  value: string;
  children: React.ReactNode;
};

export function TabTrigger({
  value,
  children,
  className,
  ...props
}: TabTriggerProps) {
  const { activeTab, setActiveTab, variants, id } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      data-active={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        tabTriggerStyles({
          variant: variants === "styleThree" ? "plain" : "default",
        }),
        className,
      )}
      role="tab"
      aria-selected={isActive}
      id={`${id}-trigger-${value}`}
      aria-controls={`${id}-content-${value}`}
      {...props}
    >
      {children}
    </button>
  );
}

type TabContentProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

export function TabContent({ value, children, className }: TabContentProps) {
  const { activeTab, id } = useTabsContext();

  return (
    <div
      role="tabpanel"
      id={`${id}-content-${value}`}
      aria-labelledby={`${id}-trigger-${value}`}
      className={cn("pt-7.5 font-medium", className)}
      hidden={activeTab !== value}
    >
      {children}
    </div>
  );
}
