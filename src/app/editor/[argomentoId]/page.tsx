import { EditorPage } from "@/src/components/editor/editor-page";
import { FormularioSettings } from "@/src/components/home/formulario-settings";
import { BreadcrumbLogic } from "@/src/components/navigation/breadcrumb-logic";
import { Header } from "@/src/components/navigation/header";
import { Skeleton } from "@/src/components/ui/skeleton";
import { TypographyH4 } from "@/src/components/ui/typography";
import { decrypt } from "@/src/lib/crypto";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Argomento({
    params,
}: Readonly<{
    params: Promise<{ argomentoId: string }>
}>) {
    const { argomentoId } = await params

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    // check if user exists
    const { rows: users } = await pool.query(`SELECT id FROM users WHERE uid = $1`, [uid]);
    if (users.length === 0) {
        redirect('/api/auth/logout')
    }

    // Check if user has access to the capitolo (owner or public)
    const { rows: argomentoRows, rowCount } = await pool.query(
        `SELECT A.beautiful_id AS "id", A.titolo, A.capitolo,
            F.titolo AS "formularioTitolo", F.owner_uid as "ownerUid", U_A.display_name AS "nomeAutore", F.beautiful_id AS "formularioId",
            C.titolo AS "capitoloTitolo", C.beautiful_id AS "capitoloId",
            A.content,
            F.visibility
            FROM argomenti A
            JOIN capitoli C ON  A.capitolo = C.beautiful_id
            JOIN formulari F ON F.beautiful_id = C.formulario
            JOIN users U_A ON F.author_uid = U_A.uid
            WHERE A.beautiful_id = $1
            AND (F.owner_uid = $2 OR F.visibility > 0)`,
        [argomentoId, uid]
    );

    if (rowCount === 0) {
        redirect('/home');
    }

    const argomentoDecrypted = {
        ...argomentoRows[0],
        titolo: decrypt(argomentoRows[0].titolo, argomentoRows[0].ownerUid),
        formularioTitolo: decrypt(argomentoRows[0].formularioTitolo, argomentoRows[0].ownerUid),
        capitoloTitolo: decrypt(argomentoRows[0].capitoloTitolo, argomentoRows[0].ownerUid),
        content: decrypt(argomentoRows[0].content, argomentoRows[0].ownerUid),
        editable: argomentoRows[0].ownerUid === uid,
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: argomentoDecrypted.formularioTitolo, href: `/formulario/${argomentoDecrypted.formularioId}` },
        { label: argomentoDecrypted.capitoloTitolo, href: `/capitolo/${argomentoDecrypted.capitoloId}` },
        { label: argomentoDecrypted.titolo, href: `/editor/${argomentoDecrypted.id}` },
    ];

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-1 flex-col gap-4 w-full px-2 md:px-6 pt-16 pb-5 overflow-hidden">
                <BreadcrumbLogic items={breadcrumbs} />
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <TypographyH4 className="truncate min-w-0 flex-1">{argomentoDecrypted.titolo}</TypographyH4>
                    </div>
                    <FormularioSettings formularioId={argomentoDecrypted.formularioId} />
                </div>
                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                    <EditorPage argomento={argomentoDecrypted} />
                </Suspense>
            </div>
        </div>
    )
}