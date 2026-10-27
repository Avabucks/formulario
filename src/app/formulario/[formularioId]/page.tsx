import packageJson from "@/package.json";
import ViewTracker from "@/src/components/formulario/view-tracker";
import { Workspace } from "@/src/components/workspace/workspace";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
      <div className="flex flex-col h-screen">
        <ViewTracker formularioId={formulario.id} />
        <Workspace
          formulario={{
            id: formulario.id,
            titolo: formulario.titolo,
            descrizione: formulario.descrizione,
            nomeAutore: formulario.nomeAutore,
            editable: formulario.editable,
          }}
        />
      </div>
    </>
  );
}
