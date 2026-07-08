import { Metadata } from "next";
import SecuritySettings from "@/components/admin/settings/SecuritySettings";

export const metadata: Metadata = {
  title: "Security Settings | Admin | K-NETWORK",
  description: "Configure security settings",
};

export default function SecuritySettingsPage() {
  return <SecuritySettings />;
}