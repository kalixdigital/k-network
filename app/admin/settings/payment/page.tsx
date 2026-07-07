import { Metadata } from "next";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export const metadata: Metadata = {
  title: "Payment Settings | Admin | K-NETWORK",
  description: "Configure payment settings",
};

export default function PaymentSettingsPage() {
  return <SettingsForm section="payment" />;
}