"use client";

import { useEffect, useState } from 'react';

export function useLocale() {
  const [locale, setLocale] = useState<'vi' | 'en'>('vi');

  useEffect(() => {
    // Read from document.cookie on the client side
    const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
    if (match) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocale(match[2] as 'vi' | 'en');
    }
  }, []);

  return locale;
}

