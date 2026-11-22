"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";
import { useI18n } from "@/client/components/common/I18nContext";

/**
 * Debounced search field for the customer order/template history.
 *
 * @param props - Current search query from the URL.
 * @returns Search input.
 */
export function ProfileOrderSearch({ currentSearch }: { currentSearch: string }): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const { dict } = useI18n();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }, 500);

  return (
    <div className="relative mb-6 w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark/35" />
      <input
        type="text"
        placeholder={dict?.shop?.searchPlaceholder || "Search..."}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          handleSearch(e.target.value);
        }}
        className="h-9 w-full border border-border bg-background pl-9 pr-3 text-[12px] text-dark outline-none transition-colors placeholder:text-dark/30 focus:border-dark"
      />
    </div>
  );
}
