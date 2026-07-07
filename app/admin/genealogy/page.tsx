import { Metadata } from "next";
import GenealogyList from "@/components/admin/genealogy/GenealogyList";

export const metadata: Metadata = {
  title: "Genealogy | Admin | K-NETWORK",
  description: "View referral tree and downline structure",
};

export default function AdminGenealogyPage() {
  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Genealogy</h1>
        <p className="mt-1 text-slate-400">View referral tree and downline structure</p>
      </div>

      <div className="w-full overflow-hidden">
        <GenealogyList />
      </div>
    </div>
  );
}