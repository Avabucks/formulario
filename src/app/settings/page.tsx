import packageJson from "@/package.json";
import { Metadata } from "next";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
  title: `Profile settings - ${packageJson.displayName}`,
  description: `Personalizza le impostazioni del tuo Knowledge Stack per gestire i tuoi progetti, navigare tra alberi concettuali ordinati ed elaborare tutto con l'assistente AI`,
};

export default async function SettingsPage() {
  return <SettingsContent activeSection="profile" />;
}
