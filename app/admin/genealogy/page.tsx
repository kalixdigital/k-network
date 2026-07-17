// app/admin/genealogy/page.tsx
import { Metadata } from "next";
import GenealogyList from "@/components/admin/genealogy/GenealogyList";

export const metadata: Metadata = {
  title: "Genealogy | Admin | K-NETWORK",
  description: "View and manage referral network structure",
};

export default function AdminGenealogyPage() {
  return (
    <div className="w-full max-w-full space-y-6">
      <GenealogyList />
    </div>
  );
}