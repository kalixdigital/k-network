import { Metadata } from "next";
import MemberDetails from "@/components/admin/members/MemberDetails";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Member Details | Admin | K-NETWORK`,
    description: `View member details`,
  };
}

export default async function AdminMemberDetailsPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div className="w-full max-w-full space-y-6">
      <MemberDetails id={id} />
    </div>
  );
}