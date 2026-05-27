import packageJson from "@/package.json";
import { Metadata } from "next";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
  title: `Profile settings - ${packageJson.displayName}`,
  description: `Gestisci profilo, account, preferenze e documenti legali di ${packageJson.displayName}.`,
};

export default async function SettingsPage() {
  return <SettingsContent activeSection="profile" />;
}
