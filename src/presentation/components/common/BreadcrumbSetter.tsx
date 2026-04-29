"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBreadcrumbs } from "./BreadcrumbContext";

interface BreadcrumbSetterProps {
  currentLabel: string;
  parentLabels?: Record<string, string>;
}

/**
 * A tiny client component to set custom breadcrumb labels from server pages.
 */
export function BreadcrumbSetter({ currentLabel, parentLabels }: BreadcrumbSetterProps) {
  const { setCustomLabel } = useBreadcrumbs();
  const pathname = usePathname();

  // Stringify parentLabels to use in dependency array safely
  const parentLabelsKey = parentLabels ? JSON.stringify(parentLabels) : "";

  useEffect(() => {
    if (parentLabels) {
      Object.entries(parentLabels).forEach(([path, label]) => {
        setCustomLabel(path, label);
      });
    }
    if (currentLabel) {
      setCustomLabel(pathname, currentLabel);
    }
  }, [pathname, currentLabel, parentLabelsKey, setCustomLabel]); // Removed direct parentLabels from deps

  return null;
}
