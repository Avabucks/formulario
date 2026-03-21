import { ArgomentoItem } from "@/src/components/capitolo/argomento-item";
import { CapitoloTitle } from "@/src/components/capitolo/capitolo-title";
import { BreadcrumbLogic } from "@/src/components/navigation/breadcrumb-logic";
import { Header } from "@/src/components/navigation/header";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/src/components/ui/empty";
import { Skeleton } from "@/src/components/ui/skeleton";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { BookmarkX } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Capitolo({
    params,
}: Readonly<{
    params: Promise<{ capitoloId: string; }>
}>) {
    const { capitoloId } = await params

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    // check if user exists
    const { rows: users } = await pool.query(`SELECT id FROM users WHERE uid = $1`, [uid]);
    if (users.length === 0) {
        redirect('/api/auth/logout')
    }

    // Check if user has access to the capitolo (owner or public)
    const { rows: capitoloRows, rowCount } = await pool.query(
        `SELECT C.beautiful_id AS "id", C.titolo, C.formulario,
            F.titolo AS "formularioTitolo", F.autore, F.beautiful_id AS "formularioId",
            U.display_name AS "nomeAutore"
            FROM capitoli C
            JOIN formulari F ON F.beautiful_id = C.formulario
            JOIN users U ON F.autore = U.uid
            WHERE C.beautiful_id = $1
            AND (F.autore = $2 OR F.visibility_public = true)`,
        [capitoloId, uid]
    );

    if (rowCount === 0) {
        redirect('/home');
    }

    const capitolo = {
        ...capitoloRows[0],
        editable: capitoloRows[0].autore === uid,
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: capitolo.formularioTitolo, href: `/formulario/${capitolo.formularioId}` },
        { label: capitolo.titolo, href: `/capitolo/${capitoloId}` },
    ];

    // Fetch argomenti for the capitolo
    const { rows: argomenti } = await pool.query(
        `SELECT
        a.beautiful_id AS "id",
        a.titolo,
        a.sort_order   AS "sortOrder"
        FROM argomenti a
        WHERE a.capitolo = $1
        ORDER BY a.sort_order ASC`,
        [capitoloId]
    );

    const renderEmpty = () => (
        <Empty className="border border-dashed">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <BookmarkX />
                </EmptyMedia>
                <EmptyTitle>Nessun Capitolo</EmptyTitle>
                <EmptyDescription>
                    {`Non ci sono capitoli da mostrare in "${capitolo.titolo}".`}
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    )

    const renderLoadingSkeleton = () => (
        <div className="flex flex-col gap-4 w-full">
            {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11.5 w-full" />
            ))}
        </div>
    );

    return (
        <>
            <Header />
            <div className="flex flex-col gap-4 w-full px-2 md:px-6 pt-16">
                <BreadcrumbLogic items={breadcrumbs} />
                <CapitoloTitle capitolo={capitolo} />
                <Suspense fallback={renderLoadingSkeleton()}>
                    <div className="flex flex-col gap-4 w-full">
                        {argomenti.length == 0 ?
                            renderEmpty()
                            :
                            argomenti.map((a, index) => (
                                <ArgomentoItem key={a.id} argomento={{ ...a, editable: capitolo.editable, argomentiCount: argomenti.length }} />
                            ))
                        }
                    </div>
                </Suspense>
            </div>
        </>
    )
}