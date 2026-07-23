import packageJson from "@/package.json";

import ForumlarioAdd from "@/src/components/home/formulario-add";
import { HomeTabs } from "@/src/components/home/home-tabs";
import { AnimatedGridPattern } from "@/src/components/ui/animated-grid-pattern";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { cn } from "@/src/lib/utils";
import { getIronSession } from "iron-session";
import { ArrowRight, Library } from "lucide-react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SortOption } from "@/src/components/shared/sort-selector";

export const metadata: Metadata = {
  title: `Home - ${packageJson.displayName}`,
  description: `Organizza e impila i tuoi progetti nel tuo workspace personale, naviga tra alberi concettuali ordinati ed elabora tutto con l'assistente AI`,
};

export default async function Home({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ tab?: string; q?: string }>;
}>) {
  const { tab, q } = await searchParams;
  const activeTab = tab === "preferiti" ? "preferiti" : "formulari";
  const searchQuery = q?.trim() ?? "";

  const cookieStore = await cookies();
  const initialOrder = (cookieStore.get("home-order")?.value ||
    "modificato") as SortOption;

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  const { rows: users } = await pool.query(
    `SELECT id, display_name as "displayName", foto_profilo as "photoURL" FROM users WHERE uid = $1`,
    [session.uid],
  );

  if (users.length === 0) {
    redirect("/api/auth/logout");
  }

  const sqlParamsFormulari: (string | number)[] = [session.uid];
  let searchFilterFormulari = "";
  if (searchQuery) {
    sqlParamsFormulari.push(`%${searchQuery}%`);
    searchFilterFormulari = `AND (F.titolo ILIKE $2 OR F.descrizione ILIKE $2)`;
  }

  const { rows: formulari } = await pool.query(
    `
        SELECT F.beautiful_id AS "id", titolo, owner_uid AS "ownerUid", COALESCE(U_A.display_name, 'Utente eliminato') AS "nomeAutore", U_A.foto_profilo AS "photoURL", F.data_creazione as "dataCreazione", F.data_modifica as "dataModifica", descrizione, visibility, views,
            EXISTS (SELECT 1 FROM preferiti P WHERE P.formulario_id = F.beautiful_id AND P.user_uid = $1) AS starred,
            (SELECT COUNT(*) FROM preferiti P2 WHERE P2.formulario_id = F.beautiful_id) AS likes
        FROM formulari F
        LEFT JOIN users U_A ON F.author_uid = U_A.uid
        WHERE owner_uid = $1 ${searchFilterFormulari}
        ORDER BY F.data_modifica DESC
    `,
    sqlParamsFormulari,
  );

  const sqlParamsPreferiti: (string | number)[] = [session.uid];
  let searchFilterPreferiti = "";
  if (searchQuery) {
    sqlParamsPreferiti.push(`%${searchQuery}%`);
    searchFilterPreferiti = `AND (F.titolo ILIKE $2 OR F.descrizione ILIKE $2)`;
  }

  const { rows: preferiti } = await pool.query(
    `
        SELECT F.beautiful_id AS "id", titolo, owner_uid AS "ownerUid", U_A.display_name AS "nomeAutore", U_A.foto_profilo AS "photoURL", F.data_creazione as "dataCreazione", F.data_modifica as "dataModifica", descrizione, visibility, views,
            TRUE AS starred,
            (SELECT COUNT(*) FROM preferiti P2 WHERE P2.formulario_id = F.beautiful_id) AS likes
        FROM formulari F
        JOIN users U_A ON F.author_uid = U_A.uid
        JOIN preferiti P ON P.formulario_id = F.beautiful_id
        WHERE P.user_uid = $1 AND F.visibility > 0 ${searchFilterPreferiti}
        ORDER BY titolo
    `,
    sqlParamsPreferiti,
  );

  const displayName = users[0].displayName;
  const photoURL = users[0].photoURL;

  return (
    <div className="mx-auto flex w-full flex-col gap-4 px-3 pb-8 mt-16 md:px-6 h-full">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative overflow-hidden rounded-xl border bg-card p-6 md:p-8">
          <AnimatedGridPattern
            numSquares={20}
            maxOpacity={0.3}
            duration={3}
            repeatDelay={1}
            className={cn("inset-y-0 h-full w-full opacity-20")}
          />
          <div className="relative flex max-w-3xl flex-col gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {photoURL && (
                  <Avatar size="lg" className="mt-1">
                    <AvatarImage src={photoURL} alt="foto profilo" />
                    <AvatarFallback>
                      {displayName?.substring(0, 1).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Ciao, {displayName}
                </h1>
              </div>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Alloca nuovo spazio nello stack per espandere la tua conoscenza.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ForumlarioAdd showLabel={true} />
            </div>
          </div>
        </div>

        <Card className="hidden md:flex">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5" />
              Stack della Community
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between gap-6">
            <p className="text-sm leading-6 text-muted-foreground">
              Esplora i progetti della community, naviga alberi concettuali
              condivisi e salva gli stack più utili nel tuo workspace.
            </p>
            <Button
              asChild
              variant="secondary"
              className="w-full justify-between"
            >
              <Link href="/community/page/1">
                Vai alla community
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
      <Separator />
      <div className="w-full flex flex-col gap-4 h-full">
        <HomeTabs
          activeTab={activeTab}
          initialOrder={initialOrder}
          formulari={formulari}
          preferiti={preferiti}
          userId={session.uid}
        />
      </div>
    </div>
  );
}
