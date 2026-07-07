import { Metadata } from "next";
import PointsReport from "@/components/admin/reports/PointsReport";

export const metadata: Metadata = {
  title: "Points Reports | Admin | K-NETWORK",
  description: "View points reports and analytics",
};

export default function PointsReportPage() {
  return <PointsReport />;
}