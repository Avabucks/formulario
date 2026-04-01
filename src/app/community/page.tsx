import { CtaCommunity } from "@/src/components/community/cta-community";
import { FormularioCard } from "@/src/components/home/formulario-card";
import { Header } from "@/src/components/navigation/header";
import { decrypt } from "@/src/lib/crypto";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export default async function Community() {
    
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    const { rows: formulari } = await pool.query(`
        SELECT F.beautiful_id AS "id", titolo, owner_uid AS "ownerUid", U_A.display_name AS "nomeAutore", anno, descrizione, visibility, views,
            (SELECT COUNT(*) FROM preferiti P2 WHERE P2.formulario_id = F.beautiful_id) AS likes,
            ${session.uid
                ? `EXISTS (SELECT 1 FROM preferiti P WHERE P.formulario_id = F.beautiful_id AND P.user_uid = $1) AS starred`
                : `FALSE AS starred`
            }
        FROM formulari F
        JOIN users U_A ON F.author_uid = U_A.uid
        WHERE visibility = 2
        ORDER BY views DESC, F.id DESC
    `, session.uid ? [session.uid] : []);

    const formulariDecrypted = formulari.map((f) => ({
        ...f,
        titolo: decrypt(f.titolo, f.ownerUid),
        descrizione: decrypt(f.descrizione, f.ownerUid),
    }));

    return (
        <>
            <Header />
            <div className="flex flex-col gap-4 w-full px-2 pt-16 pb-10 md:px-6">
                <div className="rounded-xl overflow-hidden">
                    <CtaCommunity />
                </div>
                {/* TODO */}
                <div className="flex flex-col gap-4 w-full">
                    {formulariDecrypted.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[101rem]:grid-cols-5 gap-4 w-full">
                            {formulariDecrypted.map((f) => (
                                <FormularioCard formulario={f} key={f.id} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}