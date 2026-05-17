import packageJson from '@/package.json';
import ForumlarioAdd from "@/src/components/home/formulario-add";
import { FormularioCard } from "@/src/components/home/formulario-card";
import { Header } from "@/src/components/navigation/header";
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { formatNumber } from '@/src/lib/utils';
import { getIronSession } from "iron-session";
import { ArrowRight, BookOpen, FileText, Library, Star, StarOff, UsersRound } from "lucide-react";
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

    const { rows: users } = await pool.query(`SELECT id, display_name as "displayName", foto_profilo as "photoURL" FROM users WHERE uid = $1`, [session.uid]);

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
    const displayName = users[0].displayName;
    const photoURL = users[0].photoURL;

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
                                <div className="flex items-center gap-3">
                                    {photoURL && (
                                        <Avatar size="lg" className="mt-1">
                                            <AvatarImage src={photoURL} alt="foto profilo" />
                                            <AvatarFallback>{displayName?.substring(0, 1).toUpperCase() || "U"}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                                        Ciao, {displayName}
                                    </h1>
                                </div>
                                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                                    Crea un formulario, dividilo in capitoli e riprendi le modifiche in ogni momento.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <ForumlarioAdd showLabel={true} />
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
                <Separator />
                <Tabs defaultValue="formulari" className="w-full gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                La tua raccolta
                            </h2>
                        </div>
                        <TabsList className="w-full sm:w-fit">
                            <TabsTrigger value="formulari" className="gap-2 px-3">
                                <FileText className="h-4 w-4" />
                                Formulari
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                                    {formatNumber(totalFormulari)}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="preferiti" className="gap-2 px-3">
                                <Star className="h-4 w-4" />
                                Preferiti
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                                    {formatNumber(totalPreferiti)}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="formulari" className="mt-0">
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
                    </TabsContent>

                    <TabsContent value="preferiti" className="mt-0">
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
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}