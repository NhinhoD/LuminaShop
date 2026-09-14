"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";
import React from "react";

interface CustomerSearchInputProps {
  readonly initialSearch?: string;
  readonly placeholder: string;
}

export function CustomerSearchInput({ initialSearch = "", placeholder }: CustomerSearchInputProps): React.ReactElement {
  const [value, setValue] = useState(initialSearch);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (term.trim()) {
      params.set("q", term.trim());
    } else {
      params.delete("q");
    }
    params.delete("page"); // Reset to page 1 on new search
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }, 400);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    debouncedSearch(val);
  };

  return (
    <div className="relative w-full sm:w-80">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
      />
    </div>
  );
}
