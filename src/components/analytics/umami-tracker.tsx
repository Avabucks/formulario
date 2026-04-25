'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function UmamiTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '');
    (globalThis as unknown as { umami?: any }).umami?.trackView(url);
  }, [pathname, searchParams]);

  return null;
}