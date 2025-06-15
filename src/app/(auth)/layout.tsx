"use client";

import { type PropsWithChildren } from "react";
import ToastContext from "../context/ToastContext";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <ToastContext />
    </>
  );
} 