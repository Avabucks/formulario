import packageJson from '@/package.json';
import ForumlarioAdd from "@/src/components/home/formulario-add";
import { FormularioCard } from "@/src/components/home/formulario-card";
import { Header } from "@/src/components/navigation/header";
import { Badge } from '@/src/components/ui/badge';
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/src/components/ui/empty";
import { Separator } from "@/src/components/ui/separator";
import { Skeleton } from "@/src/components/ui/skeleton";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { formatNumber } from '@/src/lib/utils';
import { getIronSession } from "iron-session";
import { ArrowRight, BookOpen, Eye, FileText, Globe2, Library, Star, StarOff, UsersRound } from "lucide-react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: `Home - ${packageJson.displayName}`,
    description: `Crea, organizza e condividi i tuoi formulari e cheat sheet con ${packageJson.displayName}. Usa l'editor avanzato e l'assistente AI per generare formule e appunti in pochi secondi.`,
};

export default async function Home() {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    const { rows: users } = await pool.query(`SELECT id, display_name as "displayName" FROM users WHERE uid = $1`, [session.uid]);

    if (users.length === 0) {
        redirect('/api/auth/logout')
    }

    const { rows: formulari } = await pool.query(`
        SELECT F.beautiful_id AS "id", titolo, owner_uid AS "ownerUid", COALESCE(U_A.display_name, 'Utente eliminato') AS "nomeAutore", U_A.foto_profilo AS "photoURL", F.data_creazione as "dataCreazione", descrizione, visibility, views,
            EXISTS (SELECT 1 FROM preferiti P WHERE P.formulario_id = F.beautiful_id AND P.user_uid = $1) AS starred,
            (SELECT COUNT(*) FROM preferiti P2 WHERE P2.formulario_id = F.beautiful_id) AS likes
        FROM formulari F
        LEFT JOIN users U_A ON F.author_uid = U_A.uid
        WHERE owner_uid = $1
        ORDER BY data_modifica DESC
    `, [session.uid]);

    const { rows: preferiti } = await pool.query(`
        SELECT F.beautiful_id AS "id", titolo, owner_uid AS "ownerUid", U_A.display_name AS "nomeAutore", U_A.foto_profilo AS "photoURL", F.data_creazione as "dataCreazione", descrizione, visibility, views,
            TRUE AS starred,
            (SELECT COUNT(*) FROM preferiti P2 WHERE P2.formulario_id = F.beautiful_id) AS likes
        FROM formulari F
        JOIN users U_A ON F.author_uid = U_A.uid
        JOIN preferiti P ON P.formulario_id = F.beautiful_id
        WHERE P.user_uid = $1 AND F.visibility > 0
        ORDER BY titolo
    `, [session.uid]);

    const totalFormulari = formulari.length;
    const totalPreferiti = preferiti.length;
    const formulariPubblici = formulari.filter((formulario) => formulario.visibility === 2).length;
    const totalVisualizzazioni = formulari.reduce((acc, formulario) => acc + Number(formulario.views ?? 0), 0);
    const totalLike = formulari.reduce((acc, formulario) => acc + Number(formulario.likes ?? 0), 0);
    const displayName = users[0].displayName;

    const stats = [
        {
            label: "Formulari",
            value: formatNumber(totalFormulari),
            description: totalFormulari === 1 ? "Formulario personale" : "Formulari personali",
            icon: FileText,
        },
        {
            label: "Preferiti",
            value: formatNumber(totalPreferiti),
            description: "Raccolti dalla community",
            icon: Star,
        },
        {
            label: "Pubblici",
            value: formatNumber(formulariPubblici),
            description: "Visibili a tutti",
            icon: Globe2,
        },
        {
            label: "Visualizzazioni",
            value: formatNumber(totalVisualizzazioni),
            description: `${formatNumber(totalLike)} like ricevuti`,
            icon: Eye,
        },
    ];

    const renderEmptyFormulari = () => (
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
            <EmptyContent className="flex-row justify-center gap-2">
                <ForumlarioAdd allowKey={false} showLabel={true} />
            </EmptyContent>
        </Empty>
    )

    const renderEmptyPreferiti = () => (
        <Empty className="border border-dashed">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <StarOff />
                </EmptyMedia>
                <EmptyTitle>Nessun formulario preferito</EmptyTitle>
                <EmptyDescription>
                    Non hai ancora aggiunto formulari ai preferiti.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
                <Button asChild variant="outline" size="lg" className="gap-2 px-8">
                    <Link href="/community/page/1">
                        <UsersRound className="h-5 w-5" />
                        Esplora la Community
                    </Link>
                </Button>
            </EmptyContent>
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
            <div className="mx-auto flex w-full flex-col gap-4 px-3 pb-8 mt-16 md:px-6">
                <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm md:p-8">
                        <svg className="absolute inset-0 h-full w-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="home-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                                    <path d="M36 0H0v36" stroke="currentColor" strokeWidth="0.5" fill="none" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#home-grid)" />
                        </svg>
                        <div className="relative flex max-w-3xl flex-col gap-5">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                                    Bentornato, {displayName}
                                </h1>
                                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                                    Organizza i formulari, riprendi le modifiche e tieni a portata di mano le raccolte più utili.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <ForumlarioAdd allowKey={false} showLabel={true} />
                            </div>
                        </div>
                    </div>

                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Library className="h-5 w-5" />
                                Libreria condivisa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col justify-between gap-6">
                            <p className="text-sm leading-6 text-muted-foreground">
                                Scopri formulari pubblici, salva quelli utili e usali come base per studiare o preparare lezioni.
                            </p>
                            <Button asChild variant="secondary" className="w-full justify-between">
                                <Link href="/community/page/1">
                                    Vai alla community
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>
                <section className="hidden md:grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} size="sm" className="shadow-sm">
                            <CardContent className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                                </div>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
                <Separator />
                <section className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                    I tuoi formulari
                                </h2>
                                <Badge variant="outline">{formatNumber(totalFormulari)}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Crea, modifica e consulta le raccolte che possiedi.
                            </p>
                        </div>
                    </div>
                    <Suspense fallback={renderLoadingSkeleton()}>
                        <div className="flex flex-col gap-4 w-full">
                            {formulari.length === 0 ? (
                                renderEmptyFormulari()
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[101rem]:grid-cols-5 gap-4 w-full">
                                    {formulari.map((f) => (
                                        <FormularioCard formulario={f} key={f.id} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </Suspense>
                </section>
                <Separator />
                <section className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                                    <Star size={24} className="fill-foreground/50 text-transparent" />
                                    Preferiti
                                </h2>
                                <Badge variant="outline">{formatNumber(totalPreferiti)}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Formulari pubblici salvati dalla community.
                            </p>
                        </div>
                    </div>
                    <Suspense fallback={renderLoadingSkeleton()}>
                        <div className="flex flex-col gap-4 w-full">
                            {preferiti.length === 0 ? (
                                renderEmptyPreferiti()
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[101rem]:grid-cols-5 gap-4 w-full">
                                    {preferiti.map((f) => (
                                        <FormularioCard formulario={f} key={f.id} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </Suspense>
                </section>
            </div>
        </>
    )
}