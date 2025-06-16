"use client";

import { createContext, useContext, useId, useState } from "react";

type RootContextType = {
  activeId: string | undefined;
  toggleActiveId: (id: string) => void;
};

const RootContext = createContext<RootContextType | null>(null);

export function useRootContext() {
  const context = useContext(RootContext);
  if (!context) {
    throw new Error(
      "useRootContext must be used within a RootContext Provider",
    );
  }
  return context;
}

type AccordionRootProps = {
  className?: string;
  children: React.ReactNode;
};

export function AccordionRoot({ children, className }: AccordionRootProps) {
  const [activeId, setActiveId] = useState<string>();

  function toggleActiveId(id: string) {
    setActiveId((currentActiveId) => (currentActiveId === id ? undefined : id));
  }

  return (
    <RootContext.Provider
      value={{
        activeId: activeId,
        toggleActiveId,
      }}
    >
      <div className={className}>{children}</div>
    </RootContext.Provider>
  );
}

type ItemContextType = {
  triggerId: string;
  contentId: string;
  dataState: "open" | "closed";
};

const ItemContext = createContext<ItemContextType | null>(null);

export function useItemContext() {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error(
      "useItemContext must be used within a ItemContext Provider",
    );
  }
  return context;
}

type AccordionItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function AccordionItem({ children, className }: AccordionItemProps) {
  const triggerId = useId();
  const contentId = useId();

  const { activeId } = useRootContext();

  const dataState = activeId === triggerId ? "open" : "closed";

  return (
    <ItemContext.Provider
      value={{
        triggerId,
        contentId,
        dataState,
      }}
    >
      <div data-state={dataState} className={className}>
        {children}
      </div>
    </ItemContext.Provider>
  );
}

type AccordionTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

export function AccordionTrigger({
  children,
  className,
}: AccordionTriggerProps) {
  const { triggerId, contentId, dataState } = useItemContext();
  const { toggleActiveId, activeId } = useRootContext();

  return (
    <h3>
      <button
        type="button"
        id={triggerId}
        aria-controls={contentId}
        aria-expanded={activeId === triggerId}
        data-state={dataState}
        className={className}
        onClick={() => toggleActiveId(triggerId)}
      >
        {children}
      </button>
    </h3>
  );
}

type AccordionContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function AccordionContent({
  children,
  className,
}: AccordionContentProps) {
  const { triggerId, contentId, dataState } = useItemContext();

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      data-state={dataState}
      className={className}
      hidden={dataState === "closed"}
    >
      {dataState === "open" && children}
    </div>
  );
}
