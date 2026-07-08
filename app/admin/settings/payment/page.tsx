import { Metadata } from "next";
import PaymentSettings from "@/components/admin/settings/PaymentSettings";

export const metadata: Metadata = {
  title: "Payment Settings | Admin | K-NETWORK",
  description: "Configure payment settings",
};

export default function PaymentSettingsPage() {
  return <PaymentSettings />;
}