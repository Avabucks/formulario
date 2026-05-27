import DeleteAccount from "@/src/components/auth/delete-account";
import { CancelSubscriptionButton } from "@/src/components/billing/cancel-subscription-button";
import { PaddleCheckoutButton } from "@/src/components/billing/paddle-checkout-button";
import { Footer } from "@/src/components/landing/footer";
import { Header } from "@/src/components/navigation/header";
import { ModeToggle } from "@/src/components/theme/theme-toggler";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
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
import { getIronSession } from "iron-session";
import {
  BookOpen,
  ChevronRight,
  Cookie,
  CreditCard,
  Handshake,
  Mail,
  Palette,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const settingsNav = [
  { id: "profile", href: "/settings/profile", label: "Profilo", icon: User },
  { id: "account", href: "/settings/account", label: "Account", icon: Shield },
  {
    id: "preferences",
    href: "/settings/preferences",
    label: "Preferenze",
    icon: Palette,
  },
  {
    id: "billing",
    href: "/settings/billing",
    label: "Billing",
    icon: CreditCard,
  },
  {
    id: "legal",
    href: "/settings/legal",
    label: "Termini e privacy",
    icon: Handshake,
  },
  {
    id: "danger",
    href: "/settings/danger",
    label: "Zona pericolosa",
    icon: Trash2,
  },
] as const;

export type SettingsSectionId = (typeof settingsNav)[number]["id"];

export const settingsSectionIds = settingsNav.map((item) => item.id);

export async function SettingsContent({
  activeSection,
}: Readonly<{ activeSection: SettingsSectionId }>) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.uid) {
    redirect("/login");
  }

  const { rows: users } = await pool.query(
    `SELECT display_name as "displayName", email, foto_profilo as "photoURL", data_creazione as "createdAt"
        FROM users
        WHERE uid = $1`,
    [session.uid],
  );

  if (users.length === 0) {
    redirect("/api/auth/logout");
  }

  const { rows: stats } = await pool.query(
    `SELECT
            COUNT(*) FILTER (WHERE owner_uid = $1) AS "formulari",
            COUNT(*) FILTER (WHERE owner_uid = $1 AND visibility > 0) AS "pubblici",
            COALESCE(SUM(views) FILTER (WHERE owner_uid = $1), 0) AS "views"
        FROM formulari`,
    [session.uid],
  );

  const { rows: subscriptions } = await pool.query(
    `SELECT status, current_period_ends_at as "currentPeriodEndsAt"
        FROM subscriptions
        WHERE user_uid = $1
        ORDER BY updated_at DESC
        LIMIT 1`,
    [session.uid],
  );

  const { rows: tokenUsageRows } = await pool.query(
    `SELECT COALESCE(SUM(total_tokens), 0) AS "totalTokens"
        FROM ai_token_usage
        WHERE user_uid = $1
          AND period_month = DATE_TRUNC('month', CURRENT_DATE)::date`,
    [session.uid],
  );

  const user = users[0];
  const subscription = subscriptions[0];
  const isPro =
    subscription && ["active", "trialing"].includes(subscription.status);
  const formulariCount = Number(stats[0]?.formulari ?? 0);
  const monthlyTokens = Number(tokenUsageRows[0]?.totalTokens ?? 0);
  const formulariLimit = isPro ? null : 5;
  const tokenLimit = isPro ? 1_000_000 : 10_000;
  const createdAt = user.createdAt
    ? new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(
        new Date(user.createdAt),
      )
    : "Non disponibile";
  const proRenewsAt = subscription?.currentPeriodEndsAt
    ? new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(
        new Date(subscription.currentPeriodEndsAt),
      )
    : null;

  return (
    <>
      <Header />
      <div className="mx-auto flex w-full flex-1 flex-col gap-6 px-3 pb-10 mt-16 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="w-full overflow-y-hidden overflow-x-auto lg:sticky lg:top-16 lg:h-fit">
            <nav className="flex gap-1 overflow-x-auto border-b pb-2 flex-col lg:overflow-visible lg:border-b-0 lg:pb-0">
              {settingsNav.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeSection;

                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    className="h-9 shrink-0 justify-start gap-2 px-3"
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </aside>

          <div className="flex flex-col gap-6">
            {activeSection === "profile" && (
              <SettingsSection
                title="Profilo pubblico"
                description="Informazioni mostrate o associate al tuo account."
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar size="lg" className="size-16">
                      {user.photoURL && (
                        <AvatarImage src={user.photoURL} alt="foto profilo" />
                      )}
                      <AvatarFallback className="text-lg">
                        {user.displayName?.substring(0, 1).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-semibold">
                        {user.displayName}
                      </h2>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Google account</Badge>
                </div>
                <Separator />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat
                    label="Formulari"
                    value={String(stats[0]?.formulari ?? 0)}
                  />
                  <Stat
                    label="Pubblici"
                    value={String(stats[0]?.pubblici ?? 0)}
                  />
                  <Stat
                    label="Visualizzazioni"
                    value={String(stats[0]?.views ?? 0)}
                  />
                </div>
              </SettingsSection>
            )}

            {activeSection === "account" && (
              <SettingsSection
                title="Account"
                description="Dati di accesso e gestione dell'identita."
              >
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow
                  icon={BookOpen}
                  label="Account creato"
                  value={createdAt}
                />
              </SettingsSection>
            )}

            {activeSection === "preferences" && (
              <SettingsSection
                title="Preferenze"
                description="Impostazioni applicazione collegate alla tua esperienza."
              >
                <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium">Tema interfaccia</h3>
                    <p className="text-sm text-muted-foreground">
                      Puoi cambiare tema dal selettore a destra.
                    </p>
                  </div>
                  <ModeToggle />
                </div>
              </SettingsSection>
            )}

            {activeSection === "billing" && (
              <SettingsSection
                title="Billing"
                description="Gestisci il piano FormulaBase e avvia l'abbonamento Pro con Paddle."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <UsageMeter
                    label="Formulari"
                    value={formulariCount}
                    limit={formulariLimit}
                  />
                  <UsageMeter
                    label="Token AI questo mese"
                    value={monthlyTokens}
                    limit={tokenLimit}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <PlanBox
                    name="Free"
                    price="0 euro"
                    description="Piano gratuito attivo per tutti gli account."
                    features={["Massimo 5 formulari", "10k token AI al mese"]}
                  />
                  <PlanBox
                    name="Pro"
                    price="2,99 euro / mese"
                    description="Piano per uso intensivo con piu spazio e AI."
                    features={[
                      "Formulari illimitati",
                      "1 milione di token AI al mese",
                    ]}
                    action={
                      isPro ? (
                        <div className="flex flex-col gap-2">
                          <Badge className="w-fit">Pro attivo</Badge>
                          {proRenewsAt && (
                            <p className="text-sm text-muted-foreground">
                              Rinnovo o scadenza periodo: {proRenewsAt}
                            </p>
                          )}
                          <CancelSubscriptionButton />
                        </div>
                      ) : (
                        <PaddleCheckoutButton
                          email={user.email}
                          userId={session.uid}
                          className="w-full gap-2 sm:w-fit"
                        >
                          Abbonati con Paddle
                        </PaddleCheckoutButton>
                      )
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Dopo il pagamento, Paddle gestisce checkout e ricevute. Per
                  attivare automaticamente i limiti Pro serve collegare il
                  webhook Paddle al database dell&apos;app.
                </p>
              </SettingsSection>
            )}

            {activeSection === "legal" && (
              <SettingsSection
                title="Termini e privacy"
                description="I documenti legali gia presenti nell'app sono raccolti anche qui."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <LegalLink
                    href="/terms"
                    icon={Handshake}
                    title="Termini e condizioni"
                    description="Regole di utilizzo, contenuti utente e cancellazione account."
                    meta="Aggiornati ad Aprile 2026"
                  />
                  <LegalLink
                    href="/privacy"
                    icon={Cookie}
                    title="Privacy Policy"
                    description="Dati raccolti, finalita del trattamento e uso dei servizi AI."
                    meta="Aggiornata a Febbraio 2026"
                  />
                </div>
              </SettingsSection>
            )}

            {activeSection === "danger" && (
              <SettingsSection
                title="Zona pericolosa"
                description="Operazioni irreversibili sul tuo account e sui dati collegati."
              >
                <div className="flex flex-col gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium text-destructive">
                      Elimina account
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Elimina definitivamente account, formulari e dati
                      personali collegati.
                    </p>
                  </div>
                  <DeleteAccount username={user.displayName} />
                </div>
              </SettingsSection>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

function Stat({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: Readonly<{
  icon: React.ElementType;
  label: string;
  value: string;
}>) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="break-all text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function PlanBox({
  name,
  price,
  description,
  features,
  action,
}: Readonly<{
  name: string;
  price: string;
  description: string;
  features: string[];
  action?: React.ReactNode;
}>) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border p-4">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium">{name}</h3>
          <Badge variant={name === "Pro" ? "default" : "outline"}>{price}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {action && <div className="mt-auto pt-2">{action}</div>}
    </div>
  );
}

function UsageMeter({
  label,
  value,
  limit,
}: Readonly<{
  label: string;
  value: number;
  limit: number | null;
}>) {
  const percentage = limit ? Math.min(100, Math.round((value / limit) * 100)) : 0;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatUsageNumber(value)}
          </p>
        </div>
        <Badge variant="outline">
          {limit ? `su ${formatUsageNumber(limit)}` : "Illimitati"}
        </Badge>
      </div>
      {limit && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

function formatUsageNumber(value: number) {
  return new Intl.NumberFormat("it-IT", {
    notation: value >= 100_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function LegalLink({
  href,
  icon: Icon,
  title,
  description,
  meta,
}: Readonly<{
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  meta: string;
}>) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">{title}</h3>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      <p className="mt-auto text-xs uppercase tracking-wide text-muted-foreground">
        {meta}
      </p>
    </Link>
  );
}
