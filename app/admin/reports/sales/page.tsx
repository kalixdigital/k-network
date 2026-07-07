import { Metadata } from "next";
import SalesReport from "@/components/admin/reports/SalesReport";

export const metadata: Metadata = {
  title: "Sales Reports | Admin | K-NETWORK",
  description: "View sales reports and analytics",
};

export default function SalesReportPage() {
  return <SalesReport />;
}