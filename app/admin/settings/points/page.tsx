import { Metadata } from "next";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export const metadata: Metadata = {
  title: "Points Settings | Admin | K-NETWORK",
  description: "Configure points settings",
};

export default function PointsSettingsPage() {
  return <SettingsForm section="points" />;
}