import packageJson from "@/package.json";
import { EditorPage } from "@/src/components/editor/editor-page";
import { BreadcrumbLogic } from "@/src/components/navigation/breadcrumb-logic";
import { Header } from "@/src/components/navigation/header";
import { Skeleton } from "@/src/components/ui/skeleton";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ argomentoId: string }>;
}) {
  const { argomentoId } = await params;
  const { rows: argomentoRows, rowCount } = await pool.query(
    `SELECT F.descrizione, F.visibility, A.content AS "content"
     FROM argomenti A
     JOIN capitoli C ON C.beautiful_id = A.capitolo
     JOIN formulari F ON F.beautiful_id = C.formulario
     WHERE A.beautiful_id = $1`,
    [argomentoId],
  );

  const argomento =
    rowCount && rowCount > 0
      ? (() => {
          const { content, ...rest } = argomentoRows[0];
          const firstLine = content?.split("\n")[0] ?? "";
          const titolo = firstLine.startsWith("#")
            ? firstLine.replace(/^#+\s*/, "")
            : "Senza titolo";
          return { ...rest, titolo };
        })()
      : null;

  if (!argomento) {
    return {
      robots: { index: false, follow: false },
    };
  }

  if (argomento.visibility <= 0) {
    return {
      title: `${argomento.titolo} - ${packageJson.displayName}`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${argomento.titolo} - ${packageJson.displayName}`,
    description: argomento.descrizione,
    openGraph: {
      title: `${argomento.titolo} - ${packageJson.displayName}`,
      description: argomento.descrizione,
      images: [
        {
          url: "/social.png",
          width: 1200,
          height: 630,
          alt: `${argomento.titolo} - ${packageJson.displayName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${argomento.titolo} - ${packageJson.displayName}`,
      description: argomento.descrizione,
      images: ["/social.png"],
    },
  };
}

export default async function Argomento({
  params,
}: Readonly<{
  params: Promise<{ argomentoId: string }>;
}>) {
  const { argomentoId } = await params;

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  // Check if user has access to the capitolo (owner or public)
  const { rows: argomentoRows, rowCount } = await pool.query(
    `SELECT A.beautiful_id AS "id",
            A.content AS "content",
            F.titolo AS "formularioTitolo", F.owner_uid as "ownerUid", F.beautiful_id AS "formularioId",
            COALESCE(C.titolo, 'Senza titolo') AS "capitoloTitolo", C.beautiful_id AS "capitoloId"
            FROM argomenti A
            JOIN capitoli C ON  A.capitolo = C.beautiful_id
            JOIN formulari F ON F.beautiful_id = C.formulario
            LEFT JOIN users U_A ON F.author_uid = U_A.uid
            WHERE A.beautiful_id = $1
            AND (F.owner_uid = $2 OR F.visibility > 0)`,
    [argomentoId, uid || null],
  );

  if (rowCount === 0) {
    if (uid) {
      redirect("/home");
    } else {
      redirect("/login");
    }
  }

  const { content, ...argomentoData } = argomentoRows[0];
  const firstLine = content?.split("\n")[0] ?? "";
  const titolo = firstLine.startsWith("#")
    ? firstLine.replace(/^#+\s*/, "")
    : "Senza titolo";

  const argomento = {
    ...argomentoData,
    titolo,
    editable: uid ? argomentoRows[0].ownerUid === uid : false,
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

    // Fetch tree data (capitoli and argomenti of the formulario)
  const { rows: treeRows } = await pool.query(
    `SELECT 
        C.beautiful_id AS "capitoloId",
        COALESCE(C.titolo, 'Senza titolo') AS "capitoloTitolo",
        C.sort_order AS "capitoloSortOrder",
        A.beautiful_id AS "argomentoId",
        A.content AS "argomentoContent",
        A.sort_order AS "argomentoSortOrder"
     FROM capitoli C
     LEFT JOIN argomenti A ON A.capitolo = C.beautiful_id
     WHERE C.formulario = $1
     ORDER BY C.sort_order ASC, A.sort_order ASC`,
    [argomento.formularioId],
  );

  const capitoliMap: Record<
    string,
    {
      id: string;
      titolo: string;
      sortOrder: number;
      argomenti: { id: string; titolo: string; sortOrder: number }[];
    }
  > = {};

  for (const row of treeRows) {
    if (!capitoliMap[row.capitoloId]) {
      capitoliMap[row.capitoloId] = {
        id: row.capitoloId,
        titolo: row.capitoloTitolo,
        sortOrder: row.capitoloSortOrder,
        argomenti: [],
      };
    }
    if (row.argomentoId) {
      const firstLine = row.argomentoContent?.split("\n")[0] ?? "";
      const argomentoTitolo = firstLine.startsWith("#")
        ? firstLine.replace(/^#+\s*/, "")
        : "Senza titolo";
      capitoliMap[row.capitoloId].argomenti.push({
        id: row.argomentoId,
        titolo: argomentoTitolo,
        sortOrder: row.argomentoSortOrder,
      });
    }
  }

  const tree = Object.values(capitoliMap).sort((a, b) => a.sortOrder - b.sortOrder);
  const firstArgId = tree[0]?.argomenti[0]?.id || argomento.id;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    {
      label: argomento.formularioTitolo,
      href: `/editor/${firstArgId}`,
    },
    {
      label: argomento.capitoloTitolo,
    },
    { label: argomento.titolo, href: `/editor/${argomento.id}` },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <Suspense fallback={<Skeleton className="h-full w-full" />}>
        <EditorPage
          argomentoId={argomento.id}
          editable={argomento.editable}
          formularioId={argomento.formularioId}
          tree={tree}
        />
      </Suspense>
    </div>
  );
}
