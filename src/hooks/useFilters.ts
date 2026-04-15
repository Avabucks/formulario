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

            const newPage = updates.page ?? 1;
            params.delete("page");

            if (updates.sort !== undefined) {
                params.set("sort", updates.sort);
            }

            if (updates.q !== undefined) {
                if (updates.q.trim() === "") {
                    params.delete("q");
                } else {
                    params.set("q", updates.q);
                }
            }

            const queryString = params.toString();
            const suffix = queryString ? `?${queryString}` : "";
            const basePath = pathname.split("/page")[0] || "";

            router.push(`${basePath}/page/${newPage}${suffix}`);
        },
        [searchParams, pathname, router]
    );

    return { sortBy, searchQuery, setSearchQuery, page, updateParams };
}