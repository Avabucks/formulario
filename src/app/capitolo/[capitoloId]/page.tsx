import { ArgomentoAdd } from "@/src/components/capitolo/argomento-add";
import { ArgomentoItem } from "@/src/components/capitolo/argomento-item";
import { FormularioSettings } from "@/src/components/home/formulario-settings";
import { BreadcrumbLogic } from "@/src/components/navigation/breadcrumb-logic";
import { Header } from "@/src/components/navigation/header";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/src/components/ui/empty";
import { Skeleton } from "@/src/components/ui/skeleton";
import { TypographyH2 } from "@/src/components/ui/typography";
import { decrypt } from "@/src/lib/crypto";
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
            F.titolo AS "formularioTitolo", F.owner_uid as "ownerUid", U_A.display_name AS "nomeAutore", F.beautiful_id AS "formularioId"
            FROM capitoli C
            JOIN formulari F ON F.beautiful_id = C.formulario
            JOIN users U_A ON F.author_uid = U_A.uid
            WHERE C.beautiful_id = $1
            AND (F.owner_uid = $2 OR F.visibility > 0)`,
        [capitoloId, uid]
    );

    if (rowCount === 0) {
        redirect('/home');
    }

    const capitoloDecrypted = {
        ...capitoloRows[0],
        titolo: decrypt(capitoloRows[0].titolo, capitoloRows[0].ownerUid),
        formularioTitolo: decrypt(capitoloRows[0].formularioTitolo, capitoloRows[0].ownerUid),
        editable: capitoloRows[0].ownerUid === uid,
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: capitoloDecrypted.formularioTitolo, href: `/formulario/${capitoloDecrypted.formularioId}` },
        { label: capitoloDecrypted.titolo, href: `/capitolo/${capitoloId}` },
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

    const argomentiDecrypted = argomenti.map((a) => ({
        ...a,
        titolo: decrypt(a.titolo, capitoloRows[0].ownerUid),
    }));

    const renderEmpty = () => (
        <Empty className="border border-dashed">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <BookmarkX />
                </EmptyMedia>
                <EmptyTitle>Nessun Capitolo</EmptyTitle>
                <EmptyDescription>
                    {`Non ci sono capitoli da mostrare in "${capitoloDecrypted.titolo}".`}
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
                        <TypographyH2 className="w-full">{capitoloDecrypted.titolo}</TypographyH2>
                        <div className="flex gap-2 items-center">
                            <FormularioSettings formularioId={capitoloDecrypted.formularioId} />
                            {capitoloDecrypted.editable && (
                                <ArgomentoAdd capitolo={capitoloDecrypted} />
                            )}
                        </div>
                    </div>
                </div>
                <Suspense fallback={renderLoadingSkeleton()}>
                    <div className="flex flex-col gap-4 w-full">
                        {argomentiDecrypted.length == 0 ?
                            renderEmpty()
                            :
                            argomentiDecrypted.map((a, index) => (
                                <ArgomentoItem key={a.id} argomento={{ ...a, editable: capitoloDecrypted.editable, argomentiCount: argomentiDecrypted.length }} />
                            ))
                        }
                    </div>
                </Suspense>
            </div>
        </>
    )
}