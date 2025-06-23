'use client';

import { createContext, useContext, ReactNode } from "react";
import { Session } from "next-auth";

const UserContext = createContext<Session | null>(null);

interface UserProviderProps {
  children: ReactNode;
  session: Session | null;
}

export function UserProvider({ children, session }: UserProviderProps) {
  return (
    <UserContext.Provider value={session}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
} 