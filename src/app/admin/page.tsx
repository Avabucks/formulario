import packageJson from "@/package.json";
import { DatePicker } from "@/src/components/admin/date-picker";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { formatNumber } from "@/src/lib/utils";
import { getIronSession } from "iron-session";
import {
  BarChart2,
  FileText,
  Pencil,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: `Admin - ${packageJson.displayName}`,
  description: `...`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Admin({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ date?: string }>;
}>) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const { rows: users } = await pool.query(
    `SELECT is_admin as "isAdmin" FROM users WHERE uid = $1`,
    [session.uid],
  );

  if (!session.uid || !users[0]?.isAdmin) {
    redirect("/home");
  } else {
    const { date } = await searchParams;
    const selectedDate = date ?? new Date().toISOString().split("T")[0];

    const { rows: users } = await pool.query(
      `SELECT 
                COUNT(*) FILTER (
                    WHERE data_creazione::date <= $1::date
                      AND uid NOT IN ('EHawFI6rMdRGaY7qQTOUdl9pAGl2', 'ihXvO40BU4NQzQEeeBNBDP6Mcuj2')
                )::int AS total,
                COUNT(*) FILTER (
                    WHERE data_creazione::date = $1::date
                      AND uid NOT IN ('EHawFI6rMdRGaY7qQTOUdl9pAGl2', 'ihXvO40BU4NQzQEeeBNBDP6Mcuj2')
                )::int AS today
            FROM users`,
      [selectedDate],
    );

    const { rows: formulari } = await pool.query(
      `SELECT 
            COUNT(*) FILTER (
                WHERE data_creazione::date <= $1::date
                  AND owner_uid NOT IN ('EHawFI6rMdRGaY7qQTOUdl9pAGl2', 'ihXvO40BU4NQzQEeeBNBDP6Mcuj2')
            )::int AS total,

            COUNT(*) FILTER (
                WHERE data_creazione::date = $1::date
                  AND owner_uid NOT IN ('EHawFI6rMdRGaY7qQTOUdl9pAGl2', 'ihXvO40BU4NQzQEeeBNBDP6Mcuj2')
            )::int AS today

        FROM formulari`,
      [selectedDate],
    );

    const { rows: formulariModificati } = await pool.query(
      `SELECT
          COUNT(*) FILTER (
              WHERE f.data_modifica::timestamp >= f.data_creazione::timestamp + INTERVAL '1 day'
                AND f.data_creazione::date <= $1::date
                AND f.author_uid NOT IN ('EHawFI6rMdRGaY7qQTOUdl9pAGl2', 'ihXvO40BU4NQzQEeeBNBDP6Mcuj2')
          )::int AS total,
          COUNT(*) FILTER (
              WHERE f.data_modifica::timestamp >= f.data_creazione::timestamp + INTERVAL '1 day'
                AND f.data_modifica::date = $1::date
                AND f.author_uid NOT IN ('EHawFI6rMdRGaY7qQTOUdl9pAGl2', 'ihXvO40BU4NQzQEeeBNBDP6Mcuj2')
          )::int AS today
      FROM formulari f`,
      [selectedDate],
    );

    const { rows: formDistribution } = await pool.query(
      `WITH conteggio_per_utente AS (
          SELECT owner_uid, COUNT(*) AS numero_formulari
          FROM formulari
          WHERE data_creazione::date <= $1::date
          GROUP BY owner_uid
      )
      SELECT 
          numero_formulari::int,
          COUNT(owner_uid)::int AS numero_utenti
      FROM conteggio_per_utente
      WHERE owner_uid NOT IN ('EHawFI6rMdRGaY7qQTOUdl9pAGl2', 'ihXvO40BU4NQzQEeeBNBDP6Mcuj2')
      GROUP BY numero_formulari
      ORDER BY numero_formulari ASC`,
      [selectedDate],
    );

    const { rows: feedback } = await pool.query(
      `SELECT f.rating, f.testo, f.created_at, u.display_name, u.foto_profilo
        FROM feedback f
        JOIN users u ON u.uid = f.user_uid
        ORDER BY f.created_at DESC`,
    );

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Statistiche per:
          </span>
          <DatePicker />
        </div>

        <h2 className="text-xl font-semibold">Generali</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Totale utenti
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground/10">
                <Users className="h-4 w-4 text-foreground/50" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-medium">
                  {formatNumber(users[0].total.toLocaleString("it-IT"))}
                </p>
                {users[0].today > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-green-50 text-green-700 flex gap-1 items-center"
                  >
                    <TrendingUp className="h-3 w-3" />
                    {formatNumber(users[0].today)} nuovi
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                registrati in totale
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Formulari
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground/10">
                <FileText className="h-4 w-4 text-foreground/50" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-medium">
                  {formatNumber(formulari[0].total.toLocaleString("it-IT"))}
                </p>
                {formulari[0].today > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-green-50 text-green-700 flex gap-1 items-center"
                  >
                    <TrendingUp className="h-3 w-3" />
                    {formatNumber(formulari[0].today)} nuovi
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                creati complessivamente
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Formulari modificati
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground/10">
                <Pencil className="h-4 w-4 text-foreground/50" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-medium">
                {formatNumber(
                  formulariModificati[0].total.toLocaleString("it-IT"),
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                di cui {formatNumber(formulariModificati[0].today)} modificati
                oggi
              </p>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Distribuzione per formulari
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground/10">
                <BarChart2 className="h-4 w-4 text-foreground/50" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-1.5 max-h-15">
              {formDistribution.map(({ numero_formulari, numero_utenti }) => (
                <div
                  key={numero_formulari}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {numero_formulari}{" "}
                    {numero_formulari === 1 ? "formulario" : "formulari"}
                  </span>
                  <span className="font-medium">{numero_utenti} utenti</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* TODO:
                <h2 className="text-xl font-semibold">AI</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                    - tokens (con sotto la divisione tra input e output)
                    - dollars from tokens (con sotto la divisione tra input e output)
                </div>
                */}

        <h2 className="text-xl font-semibold">Feedback</h2>
        <div className="space-y-3">
          {feedback.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessun feedback ricevuto.
            </p>
          ) : (
            feedback.map((f) => (
              <Card key={`${f.display_name}-${f.created_at}`}>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={f.foto_profilo}
                          alt={f.display_name}
                        />
                        <AvatarFallback className="text-xs">
                          {f.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {f.display_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4"
                          stroke="oklch(79.5% 0.184 86.047)"
                          fill={
                            i < f.rating
                              ? "oklch(79.5% 0.184 86.047)"
                              : "transparent"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <p className="text-sm text-muted-foreground">{f.testo}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(f.created_at).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }
}
