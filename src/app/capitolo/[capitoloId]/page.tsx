import packageJson from '@/package.json';
import { ArgomentoAdd } from "@/src/components/capitolo/argomento-add";
import { ArgomentoItem } from "@/src/components/capitolo/argomento-item";
import { FormularioSettings } from "@/src/components/home/formulario-settings";
import { BreadcrumbLogic } from "@/src/components/navigation/breadcrumb-logic";
import { Header } from "@/src/components/navigation/header";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/src/components/ui/empty";
import { Skeleton } from "@/src/components/ui/skeleton";
import { TypographyH2 } from "@/src/components/ui/typography";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { BookmarkX } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ capitoloId: string }>
}) {
    const { capitoloId } = await params;
    const { rows: capitoloRows, rowCount } = await pool.query(
        `SELECT C.titolo, F.descrizione, F.visibility
         FROM capitoli C
         JOIN formulari F ON F.beautiful_id = C.formulario
         WHERE C.beautiful_id = $1`,
        [capitoloId]
    );

    const capitolo = rowCount && rowCount > 0 ? capitoloRows[0] : null;

    if (!capitolo) {
        return {
            robots: { index: false, follow: false },
        };
    }

    if (capitolo.visibility <= 0) {
        return {
            title: `${capitolo.titolo} - ${packageJson.displayName}`,
            robots: { index: false, follow: false },
        };
    }

    return {
        title: `${capitolo.titolo} - ${packageJson.displayName}`,
        description: capitolo.descrizione,
        openGraph: {
            title: `${capitolo.titolo} - ${packageJson.displayName}`,
            description: capitolo.descrizione,
            images: ["/social.png"],
        },
        twitter: {
            card: 'summary',
            title: `${capitolo.titolo} - ${packageJson.displayName}`,
            description: capitolo.descrizione,
        },
    };
}

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
            LEFT JOIN users U_A ON F.author_uid = U_A.uid
            WHERE C.beautiful_id = $1
            AND (F.owner_uid = $2 OR F.visibility > 0)`,
        [capitoloId, uid]
    );

    if (rowCount === 0) {
        redirect('/home');
    }

    const capitolo = {
        ...capitoloRows[0],
        editable: capitoloRows[0].ownerUid === uid,
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
        a.sort_order   AS "sortOrder",
        a.content      AS "content"
        FROM argomenti a
        WHERE a.capitolo = $1
        ORDER BY a.sort_order ASC`,
        [capitoloId]
    );

    const argomentiRes = argomenti.map(({ content, ...row }) => {
        const firstLine = content?.split("\n")[0] ?? "";
        const title = firstLine.startsWith("#") ? firstLine.replace(/^#+\s*/, "") : null;
        return { ...row, titolo: title };
    });

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
            <EmptyContent className="flex-row justify-center gap-2">
                {capitolo.editable && (
                    <ArgomentoAdd capitolo={capitolo} />
                )}
            </EmptyContent>
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
            <div className="flex flex-col gap-4 w-full px-2 md:px-6 pt-16 pb-5">
                <BreadcrumbLogic items={breadcrumbs} />
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-4">
                        <TypographyH2 className="w-full">{capitolo.titolo}</TypographyH2>
                        <div className="flex gap-2 items-center">
                            <FormularioSettings formularioId={capitolo.formularioId} />
                            {capitolo.editable && (
                                <ArgomentoAdd capitolo={capitolo} />
                            )}
                        </div>
                    </div>
                </div>
                <Suspense fallback={renderLoadingSkeleton()}>
                    <div className="flex flex-col gap-4 w-full">
                        {argomentiRes.length == 0 ?
                            renderEmpty()
                            :
                            argomentiRes.map((a, index) => (
                                <ArgomentoItem key={a.id} argomento={{ ...a, editable: capitolo.editable, argomentiCount: argomentiRes.length }} />
                            ))
                        }
                    </div>
                </Suspense>
            </div>
        </>
    )
}