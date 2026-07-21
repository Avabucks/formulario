import packageJson from "@/package.json";
import { CapitoloAdd } from "@/src/components/formulario/capitolo-add";
import { CapitoloItem } from "@/src/components/formulario/capitolo-item";
import ViewTracker from "@/src/components/formulario/view-tracker";
import { FormularioSettings } from "@/src/components/home/formulario-settings";
import { BreadcrumbLogic } from "@/src/components/navigation/breadcrumb-logic";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/components/ui/empty";
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
  params: Promise<{ formularioId: string }>;
}) {
  const { formularioId } = await params;
  const { rows: formularioRows, rowCount } = await pool.query(
    `SELECT F.titolo, F.descrizione, F.visibility
         FROM formulari F
         WHERE F.beautiful_id = $1`,
    [formularioId],
  );

  const formulario = rowCount && rowCount > 0 ? formularioRows[0] : null;

  if (!formulario) {
    return {
      robots: { index: false, follow: false },
    };
  }

  if (formulario.visibility <= 0) {
    return {
      title: `${formulario.titolo} - ${packageJson.displayName}`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${formulario.titolo} - ${packageJson.displayName}`,
    description: formulario.descrizione,
    openGraph: {
      title: `${formulario.titolo} - ${packageJson.displayName}`,
      description: formulario.descrizione,
      images: [
        {
          url: "/social.png",
          width: 1200,
          height: 630,
          alt: `${formulario.titolo} - ${packageJson.displayName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${formulario.titolo} - ${packageJson.displayName}`,
      description: formulario.descrizione,
      images: ["/social.png"],
    },
  };
}

export default async function Formulario({
  params,
}: Readonly<{
  params: Promise<{ formularioId: string }>;
}>) {
  const { formularioId } = await params;

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  // Check if user has access to the formulario (owner or public)
  const { rows: formularioRows, rowCount } = await pool.query(
    `SELECT F.beautiful_id AS "id", F.titolo, F.descrizione, F.owner_uid as "ownerUid", U_A.display_name AS "nomeAutore", F.data_creazione as "dataCreazione",
                F.visibility
         FROM formulari F
         LEFT JOIN users U_A ON F.author_uid = U_A.uid
         WHERE F.beautiful_id = $1
           AND (F.owner_uid = $2 OR F.visibility > 0)`,
    [formularioId, uid || null],
  );

  if (rowCount === 0) {
    if (uid) {
      redirect("/home");
    } else {
      redirect("/login");
    }
  }

  const formulario = {
    ...formularioRows[0],
    editable: uid ? formularioRows[0].ownerUid === uid : false,
  };

  // check if logged in user exists in db
  if (uid) {
    const { rows: users } = await pool.query(
      `SELECT id FROM users WHERE uid = $1`,
      [uid],
    );
    if (users.length === 0) {
      redirect("/api/auth/logout");
    }
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: formulario.titolo, href: `/formulario/${formularioId}` },
  ];

  // Fetch capitoli for the formulario
  const { rows: capitoli } = await pool.query(
    `SELECT
            c.beautiful_id        AS "id",
            COALESCE(c.titolo, 'Senza titolo') AS "titolo",
            COUNT(a.beautiful_id) AS "argomentiCount",
            c.sort_order          AS "sortOrder"
         FROM capitoli c
         LEFT JOIN argomenti a ON a.capitolo = c.beautiful_id
         WHERE c.formulario = $1
         GROUP BY c.beautiful_id, c.titolo, c.formulario, c.sort_order
         ORDER BY c.sort_order ASC`,
    [formularioId],
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
      <EmptyContent className="flex-row justify-center gap-2">
        {formulario.editable && <CapitoloAdd formulario={formulario} />}
      </EmptyContent>
    </Empty>
  );

  const renderLoadingSkeleton = () => (
    <div className="flex flex-col gap-4 w-full">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-11.5 w-full" />
      ))}
    </div>
  );

  const showSchema = formulario.visibility === 2;
  const jsonLd = showSchema
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: formulario.titolo,
        description:
          formulario.descrizione ||
          `Formulario di formule e cheat sheet per ${formulario.titolo}.`,
        dateCreated: formulario.dataCreazione
          ? new Date(formulario.dataCreazione).toISOString()
          : undefined,
        author: {
          "@type": "Person",
          name: formulario.nomeAutore || "FormulaBase User",
        },
        publisher: {
          "@type": "Organization",
          name: "FormulaBase",
          url:
            process.env.NEXT_PUBLIC_APP_URL ||
            "https://formulario-five.vercel.app",
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="flex flex-col gap-4 w-full px-2 md:px-6 pt-16 pb-5">
        <ViewTracker formularioId={formulario.id} />
        <BreadcrumbLogic items={breadcrumbs} />
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <TypographyH2 className="w-full">{formulario.titolo}</TypographyH2>
            <div className="flex gap-2 items-center">
              <FormularioSettings formularioId={formulario.id} />
              {formulario.editable && <CapitoloAdd formulario={formulario} />}
            </div>
          </div>
        </div>
        <Suspense fallback={renderLoadingSkeleton()}>
          <div className="flex flex-col gap-4 w-full">
            {capitoli.length == 0
              ? renderEmpty()
              : capitoli.map((c) => (
                  <CapitoloItem
                    key={c.id}
                    capitolo={{
                      ...c,
                      editable: formulario.editable,
                      capitoliCount: capitoli.length,
                    }}
                  />
                ))}
          </div>
        </Suspense>
      </div>
    </>
  );
}
