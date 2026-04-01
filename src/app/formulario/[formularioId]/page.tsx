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
import { decrypt } from "@/src/lib/crypto";

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
                F.visibility
         FROM formulari F
         JOIN users U_A ON F.author_uid = U_A.uid
         WHERE F.beautiful_id = $1
           AND (F.owner_uid = $2 OR F.visibility > 0)`,
        [formularioId, uid]
    );

    if (rowCount === 0) {
        redirect('/home')
    }

    // Views should only be incremented if the viewer is not the owner and the formulario is public
    await pool.query(
        `UPDATE formulari SET views = views + 1 WHERE beautiful_id = $1 AND owner_uid != $2 AND visibility > 0`,
        [formularioId, session.uid ?? ""]
    );

    const formularioDecrypted = {
        ...formularioRows[0],
        titolo: decrypt(formularioRows[0].titolo, formularioRows[0].ownerUid),
        editable: formularioRows[0].ownerUid === uid,
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: formularioDecrypted.titolo, href: `/formulario/${formularioId}` },
    ];

    // Fetch capitoli for the formulario
    const { rows: capitoli } = await pool.query(
        `SELECT
            c.beautiful_id        AS "id",
            c.titolo,
            COUNT(a.beautiful_id) AS "argomentiCount",
            c.sort_order          AS "sortOrder",
            f.owner_uid           AS "ownerUid"
        FROM capitoli c
        LEFT JOIN argomenti a ON a.capitolo = c.beautiful_id
        JOIN formulari f ON f.beautiful_id = c.formulario
        WHERE c.formulario = $1
        GROUP BY c.beautiful_id, c.titolo, c.formulario, c.sort_order, f.owner_uid
        ORDER BY c.sort_order ASC`,
        [formularioId]
    );

    const capitoliDecrypted = capitoli.map((c) => ({
        ...c,
        titolo: decrypt(c.titolo, c.ownerUid),
    }));

    const renderEmpty = () => (
        <Empty className="border border-dashed">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <BookmarkX />
                </EmptyMedia>
                <EmptyTitle>Nessun Capitolo</EmptyTitle>
                <EmptyDescription>
                    {`Non ci sono capitoli da mostrare in "${formularioDecrypted.titolo}".`}
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
                        <TypographyH2 className="w-full">{formularioDecrypted.titolo}</TypographyH2>
                        <div className="flex gap-2 items-center">
                            <FormularioSettings formularioId={formularioDecrypted.id} />
                            {formularioDecrypted.editable && (
                                <CapitoloAdd formulario={formularioDecrypted} />
                            )}
                        </div>
                    </div>
                </div>
                <Suspense fallback={renderLoadingSkeleton()}>
                    <div className="flex flex-col gap-4 w-full">
                        {capitoliDecrypted.length == 0 ?
                            renderEmpty()
                            :
                            capitoliDecrypted.map((c, index) => (
                                <CapitoloItem key={c.id} capitolo={{ ...c, editable: formularioDecrypted.editable, capitoliCount: capitoliDecrypted.length }} />
                            ))
                        }
                    </div>
                </Suspense>
            </div>
        </>
    )
}