import { Metadata } from "next";
import PointsSettings from "@/components/admin/settings/PointsSettings";

export const metadata: Metadata = {
  title: "Points Settings | Admin | K-NETWORK",
  description: "Configure points settings",
};

export default function PointsSettingsPage() {
  return <PointsSettings />;
}