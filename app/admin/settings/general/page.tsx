import { Metadata } from "next";
import GeneralSettings from "@/components/admin/settings/GeneralSettings";

export const metadata: Metadata = {
  title: "General Settings | Admin | K-NETWORK",
  description: "Configure general settings",
};

export default function GeneralSettingsPage() {
  return <GeneralSettings />;
}