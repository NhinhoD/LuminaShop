"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface BreadcrumbContextType {
  customLabels: Record<string, string>;
  setCustomLabel: (path: string, label: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [customLabels, setCustomLabels] = React.useState<Record<string, string>>({});

  const setCustomLabel = React.useCallback((path: string, label: string) => {
    setCustomLabels((prev) => {
      // Avoid unnecessary updates if the label is already the same
      if (prev[path] === label) return prev;
      return { ...prev, [path]: label };
    });
  }, []);

  const value = React.useMemo(() => ({ customLabels, setCustomLabel }), [customLabels, setCustomLabel]);

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider");
  }
  return context;
}
