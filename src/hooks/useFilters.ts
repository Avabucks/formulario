"use client"
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

type SortOption = "trending" | "recent" | "popular";

export function useFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const sortBy = (searchParams.get("sort") as SortOption) ?? "trending";
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
    const page = Number(searchParams.get("page") ?? 1);

    const updateParams = useCallback(
        (updates: { sort?: SortOption; q?: string; page?: number }) => {
            const params = new URLSearchParams(searchParams.toString());

            if (updates.sort !== undefined) params.set("sort", updates.sort);
            if (updates.q !== undefined) params.set("q", updates.q);
            if (updates.page !== undefined) params.set("page", updates.page.toString());

            // Se page non è passato, resetta a 1
            if (updates.page === undefined) params.set("page", "1");

            router.push(`${pathname.split("/page")[0]}/page/${params.get("page")}?${params.toString()}`);
        },
        [searchParams, pathname, router]
    );

    return { sortBy, searchQuery, setSearchQuery, page, updateParams };
}