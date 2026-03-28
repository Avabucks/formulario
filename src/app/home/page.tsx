import { FormularioCard } from "@/src/components/home/formulario-card";
import HomeTitle from "@/src/components/home/home-title";
import { Header } from "@/src/components/navigation/header";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/src/components/ui/empty";
import { Skeleton } from "@/src/components/ui/skeleton";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { BookOpen } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Page() {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    const { rows: users } = await pool.query(`SELECT id FROM users WHERE uid = $1`, [session.uid]);

    if (users.length === 0) {
        redirect('/api/auth/logout')
    }

    const { rows: formulari } = await pool.query(`
        SELECT F.beautiful_id AS "id", titolo, owner_uid as "ownerUid", U_A.display_name AS "nomeAutore", anno, descrizione, visibility_public AS "visibilityPublic"
        FROM formulari F
        JOIN users U_A ON F.author_uid = U_A.uid
        WHERE owner_uid = $1
        ORDER BY titolo DESC
    `, [session.uid]);

    const renderEmpty = () => (
        <Empty className="border border-dashed">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <BookOpen />
                </EmptyMedia>
                <EmptyTitle>Nessun formulario</EmptyTitle>
                <EmptyDescription>
                    Non ci sono formulari da mostrare.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    )

    const renderLoadingSkeleton = () => (
        <div className="flex flex-col gap-4 w-full">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-50 w-full" />
                ))}
            </div>
        </div>
    );

    return (
        <>
            <Header />
            <div className="flex flex-col gap-4 w-full px-2 md:px-6 pt-16">
                <HomeTitle />
                <Suspense fallback={renderLoadingSkeleton()}>
                    <div className="flex flex-col gap-4 w-full">
                        {formulari.length === 0 ? (
                            renderEmpty()
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                                {formulari.map((f) => (
                                    <FormularioCard formulario={f} key={f.id} />
                                ))}
                            </div>
                        )}
                    </div>
                </Suspense>
            </div>
        </>
    )
}