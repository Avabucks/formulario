import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Users, FileText, TrendingUp } from "lucide-react"
import { DatePicker } from "@/src/components/admin/date-picker"
import { formatNumber } from "@/src/lib/utils";

export default async function Admin({
    searchParams,
}: Readonly<{
    searchParams: Promise<{ date?: string }>
}>) {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const { rows: users } = await pool.query(`SELECT is_admin as "isAdmin" FROM users WHERE uid = $1`, [session.uid]);

    if (!session.uid || !users[0]?.isAdmin) {
        redirect('/home')
    } else {
        const { date } = await searchParams
        const selectedDate = date ?? new Date().toISOString().split("T")[0]

        const { rows: users } = await pool.query(
            `SELECT 
                COUNT(*) FILTER (
                    WHERE data_creazione::date <= $1::date
                )::int AS total,
                COUNT(*) FILTER (
                    WHERE data_creazione::date = $1::date
                )::int AS today
            FROM users`,
            [selectedDate]
        )

        const { rows: formulari } = await pool.query(
            `SELECT 
                COUNT(*) FILTER (
                    WHERE data_creazione::date <= $1::date
                )::int AS total,
                COUNT(*) FILTER (
                    WHERE data_creazione::date = $1::date
                )::int AS today
            FROM formulari`,
            [selectedDate]
        )

        return (
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Statistiche per:</span>
                    <DatePicker />
                </div>

                <h2 className="text-xl font-semibold">Generali</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
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
                                <p className="text-3xl font-medium">{formatNumber(users[0].total.toLocaleString("it-IT"))}</p>
                                {users[0].today > 0 && (
                                    <Badge variant="secondary" className="bg-green-50 text-green-700 flex gap-1 items-center">
                                        <TrendingUp className="h-3 w-3" />
                                        {formatNumber(users[0].today)} nuovi
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">registrati in totale</p>
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
                                <p className="text-3xl font-medium">{formatNumber(formulari[0].total.toLocaleString("it-IT"))}</p>
                                {formulari[0].today > 0 && (
                                    <Badge variant="secondary" className="bg-green-50 text-green-700 flex gap-1 items-center">
                                        <TrendingUp className="h-3 w-3" />
                                        {formatNumber(formulari[0].today)} nuovi
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">creati complessivamente</p>
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

            </div>
        )

    }
}