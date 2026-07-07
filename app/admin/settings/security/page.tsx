import { Metadata } from "next";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export const metadata: Metadata = {
  title: "Security Settings | Admin | K-NETWORK",
  description: "Configure security settings",
};

export default function SecuritySettingsPage() {
  return <SettingsForm section="security" />;
}