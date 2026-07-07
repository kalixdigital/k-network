import { Metadata } from "next";
import MemberReport from "@/components/admin/reports/MemberReport";

export const metadata: Metadata = {
  title: "Member Reports | Admin | K-NETWORK",
  description: "View member reports and analytics",
};

export default function MemberReportPage() {
  return <MemberReport />;
}