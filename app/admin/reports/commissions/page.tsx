import { Metadata } from "next";
import CommissionReport from "@/components/admin/reports/CommissionReport";

export const metadata: Metadata = {
  title: "Commission Reports | Admin | K-NETWORK",
  description: "View commission reports and analytics",
};

export default function CommissionReportPage() {
  return <CommissionReport />;
}