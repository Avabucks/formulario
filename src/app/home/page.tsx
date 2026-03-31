import ForumlarioAdd from "@/src/components/home/formulario-add";
import { FormularioCard } from "@/src/components/home/formulario-card";
import { Header } from "@/src/components/navigation/header";
import { Button } from "@/src/components/ui/button";
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
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home() {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    const { rows: users } = await pool.query(`SELECT id, display_name as "displayName" FROM users WHERE uid = $1`, [session.uid]);

    if (users.length === 0) {
        redirect('/api/auth/logout')
    }

    const { rows: formulari } = await pool.query(`
        SELECT F.beautiful_id AS "id", titolo, owner_uid as "ownerUid", U_A.display_name AS "nomeAutore", anno, descrizione, visibility, views
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
            <section className="relative overflow-hidden border-t border-b border-border bg-secondary/30 mt-16 mb-5">
                <svg className="absolute inset-0 h-full w-full opacity-[0.10]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="cross" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M16 0v32M0 16h32" stroke="currentColor" strokeWidth="0.5" fill="none" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cross)" />
                </svg>

                <div className="relative mx-auto flex items-center justify-between gap-2 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 aspect-square items-center justify-center rounded-full bg-foreground/10">
                            <Users className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Esplora la Community</p>
                            <p className="text-sm text-muted-foreground">Una libreria collaborativa di formule, in costante espansione</p>
                        </div>
                    </div>
                    <Button variant="outline" size="lg" className="gap-2" asChild>
                        <Link href="/community">
                            Scopri
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>
            <div className="flex flex-col gap-4 w-full px-2 pb-10 md:px-6">
                <div className="flex flex-row justify-between items-center w-full">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                            I Formulari di {users[0].displayName}
                        </h2>
                        <p className="mt-1 text-muted-foreground">
                            Gestisci e modifica i tuoi formulari
                        </p>
                    </div>
                    <ForumlarioAdd />
                </div >
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