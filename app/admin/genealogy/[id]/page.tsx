import { Metadata } from "next";
import MemberGenealogy from "@/components/admin/genealogy/MemberGenealogy";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Member Genealogy | Admin | K-NETWORK`,
    description: `View member referral tree`,
  };
}

export default async function AdminMemberGenealogyPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div className="w-full max-w-full space-y-6">
      <MemberGenealogy id={id} />
    </div>
  );
}