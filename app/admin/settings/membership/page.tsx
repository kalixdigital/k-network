import { Metadata } from "next";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export const metadata: Metadata = {
  title: "Membership Settings | Admin | K-NETWORK",
  description: "Configure membership settings",
};

export default function MembershipSettingsPage() {
  return <SettingsForm section="membership" />;
}