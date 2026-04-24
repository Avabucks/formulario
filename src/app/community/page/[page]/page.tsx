import { CommunityFilters } from "@/src/components/community/community-filters";
import { CtaCommunity } from "@/src/components/community/cta-community";
import { FormularioCard } from "@/src/components/home/formulario-card";
import { Footer } from "@/src/components/landing/footer";
import { Header } from "@/src/components/navigation/header";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/src/components/ui/pagination";
import { Separator } from "@/src/components/ui/separator";
import { Toggle } from "@/src/components/ui/toggle";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { cn } from "@/src/lib/utils";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import Link from "next/link";

const SORT_MAP = {
    trending: "views DESC",
    recent: "F.id DESC",
    popular: "likes DESC",
};

export default async function Capitolo({
    params,
    searchParams,
}: Readonly<{
    params: Promise<{ page?: string }>,
    searchParams: Promise<{ sort?: string; q?: string; }>
}>) {
    const pageParams = await params
    const queryParams = await searchParams
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    const currentPage = Math.max(1, Number.parseInt(pageParams.page ?? "1"));
    const sort = (queryParams.sort ?? "trending") as keyof typeof SORT_MAP;
    const q = queryParams.q?.trim() ?? "";

    const orderBy = SORT_MAP[sort] ?? SORT_MAP.trending;

    const LIMIT = 60;
    const OFFSET = (currentPage - 1) * LIMIT;

    // Indice del parametro uid: $1 se loggato, altrimenti non c'è
    const uidOffset = session.uid ? 1 : 0;
    const limitIdx = uidOffset + 1;
    const offsetIdx = uidOffset + 2;
    const searchIdx = uidOffset + 3;

    const sqlParams: (string | number)[] = [
        ...(session.uid ? [session.uid] : []),
        LIMIT,
        OFFSET,
        ...(q ? [`%${q}%`] : []),
    ];

    const { rows: formulari } = await pool.query(`
        SELECT F.beautiful_id AS "id", titolo, owner_uid AS "ownerUid", U_A.display_name AS "nomeAutore", data_creazione as "dataCreazione", descrizione, visibility, views,
            (SELECT COUNT(*) FROM preferiti P2 WHERE P2.formulario_id = F.beautiful_id) AS likes,
            ${session.uid
            ? `EXISTS (SELECT 1 FROM preferiti P WHERE P.formulario_id = F.beautiful_id AND P.user_uid = $1) AS starred`
            : `FALSE AS starred`
        },
            COUNT(*) OVER() AS "totalCount"
        FROM formulari F
        JOIN users U_A ON F.author_uid = U_A.uid
        WHERE visibility = 2
        ${q ? `AND (titolo ILIKE $${searchIdx} OR descrizione ILIKE $${searchIdx})` : ""}
        ORDER BY ${orderBy}
        LIMIT $${limitIdx}
        OFFSET $${offsetIdx}
    `, sqlParams);

    const createPageLink = (p: number) => {
        const paramsObj = new URLSearchParams(queryParams);
        paramsObj.delete("page");
        const queryString = paramsObj.toString();
        return queryString
            ? `/community/page/${p}?${queryString}`
            : `/community/page/${p}`;
    };

    const totalCount = formulari.length > 0 ? Number.parseInt(formulari[0].totalCount) : 0;
    const totalPages = Math.ceil(totalCount / LIMIT);

    return (
        <>
            <Header />
            <div className="flex flex-col gap-4 w-full px-2 pt-16 pb-5 md:px-6">
                <div className="rounded-xl overflow-hidden">
                    <CtaCommunity />
                </div>
                <CommunityFilters />
                <div className="flex flex-col gap-4 w-full">
                    {formulari.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[101rem]:grid-cols-5 gap-4 w-full">
                            {formulari.map((f) => (
                                <FormularioCard formulario={f} key={f.id} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">Nessun risultato trovato.</p>
                    )}
                </div>
                {formulari.length > 0 && (
                    <div className="flex flex-1 gap-2 items-center">
                        <Separator className="flex-1 w-full" orientation="horizontal" />
                        <div>
                            <Pagination>
                                <PaginationContent>
                                    {Array.from({ length: totalPages }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <PaginationItem key={page}>
                                                <Link
                                                    key={page}
                                                    href={createPageLink(page)}
                                                >
                                                    <Toggle variant="outline" pressed={page === currentPage} className="cursor-pointer">
                                                        {page}
                                                    </Toggle>
                                                </Link>
                                            </PaginationItem>
                                        );
                                    })}
                                </PaginationContent>
                            </Pagination>

                        </div>
                        <Separator className="flex-1 w-full" orientation="horizontal" />
                    </div>
                )}
            </div>
            <Footer />
        </>
    )
}