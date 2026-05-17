import { redirect } from "next/navigation";
import { SettingsContent, SettingsSectionId, settingsSectionIds } from "../settings-content";

export default async function SettingsSectionPage({
    params,
}: Readonly<{
    params: Promise<{ section: string }>;
}>) {
    const { section } = await params;

    if (!settingsSectionIds.includes(section as SettingsSectionId)) {
        redirect("/settings");
    }

    return <SettingsContent activeSection={section as SettingsSectionId} />;
}
