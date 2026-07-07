import { Metadata } from "next";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export const metadata: Metadata = {
  title: "General Settings | Admin | K-NETWORK",
  description: "Configure general settings",
};

export default function GeneralSettingsPage() {
  return <SettingsForm section="general" />;
}