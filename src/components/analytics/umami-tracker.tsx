'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function UmamiTracker() {
    const pathname = usePathname();

    useEffect(() => {
            (globalThis as unknown as { umami?: any }).umami?.track('pageview', {
            url: pathname,
        });
    }, [pathname]);

    return null;
}