import { CapitoloItem } from "@/src/components/formulario/capitolo-item";
import { CapitoloAdd } from "@/src/components/formulario/capitolo-add";
import { FormularioSettings } from "@/src/components/home/formulario-settings";
import { BreadcrumbLogic } from "@/src/components/navigation/breadcrumb-logic";
import { Header } from "@/src/components/navigation/header";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/src/components/ui/empty";
import { Skeleton } from "@/src/components/ui/skeleton";
import { TypographyH2 } from "@/src/components/ui/typography";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { BookmarkX } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Formulario({
    params,
}: Readonly<{
    params: Promise<{ formularioId: string; }>
}>) {
    const { formularioId } = await params

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    // check if user exists
    const { rows: users } = await pool.query(`SELECT id FROM users WHERE uid = $1`, [uid]);
    if (users.length === 0) {
        redirect('/api/auth/logout')
    }

    // Check if user has access to the formulario (owner or public)
    const { rows: formularioRows, rowCount } = await pool.query(
        `SELECT F.beautiful_id AS "id", F.titolo, F.owner_uid as "ownerUid", U_A.display_name AS "nomeAutore", F.anno,
                F.visibility_public AS "visibilityPublic"
         FROM formulari F
         JOIN users U_A ON F.author_uid = U_A.uid
         WHERE F.beautiful_id = $1
           AND (F.owner_uid = $2 OR F.visibility_public = true)`,
        [formularioId, uid]
    );

    if (rowCount === 0) {
        redirect('/home')
    }

    const formulario = {
        ...formularioRows[0],
        editable: formularioRows[0].ownerUid === uid,
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: formulario.titolo, href: `/formulario/${formularioId}` },
    ];

    // Fetch capitoli for the formulario
    const { rows: capitoli } = await pool.query(
        `SELECT
            c.beautiful_id        AS "id",
            c.titolo,
            COUNT(a.beautiful_id) AS "argomentiCount",
            c.sort_order          AS "sortOrder"
         FROM capitoli c
         LEFT JOIN argomenti a ON a.capitolo = c.beautiful_id
         WHERE c.formulario = $1
         GROUP BY c.beautiful_id, c.titolo, c.formulario, c.sort_order
         ORDER BY c.sort_order ASC`,
        [formularioId]
    );

    const renderEmpty = () => (
        <Empty className="border border-dashed">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <BookmarkX />
                </EmptyMedia>
                <EmptyTitle>Nessun Capitolo</EmptyTitle>
                <EmptyDescription>
                    {`Non ci sono capitoli da mostrare in "${formulario.titolo}".`}
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
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-4">
                        <TypographyH2 className="w-full">{formulario.titolo}</TypographyH2>
                        <div className="flex gap-2 items-center">
                            <FormularioSettings formularioId={formulario.id} />
                            {formulario.editable && (
                                <CapitoloAdd formulario={formulario} />
                            )}
                        </div>
                    </div>
                </div>
                <Suspense fallback={renderLoadingSkeleton()}>
                    <div className="flex flex-col gap-4 w-full">
                        {capitoli.length == 0 ?
                            renderEmpty()
                            :
                            capitoli.map((c, index) => (
                                <CapitoloItem key={c.id} capitolo={{ ...c, editable: formulario.editable, capitoliCount: capitoli.length }} />
                            ))
                        }
                    </div>
                </Suspense>
            </div>
        </>
    )
}