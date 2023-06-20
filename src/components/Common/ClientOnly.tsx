"use client";
import { ReactNode } from "react";
import { useIsClient } from "usehooks-ts";

// Wrapper to disable SSR for wrapped component
// Runs on client side
const ClientOnly = ({ children }: { children: ReactNode }) => {
  const isClient = useIsClient();
  return isClient ? <>{children}</> : null;
};

export default ClientOnly;
