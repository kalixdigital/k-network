import { Metadata } from "next";
import WithdrawalDetails from "@/components/admin/withdrawals/WithdrawalDetails";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Withdrawal Details | Admin | K-NETWORK`,
    description: `View withdrawal details`,
  };
}

export default async function AdminWithdrawalDetailsPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div className="w-full max-w-full space-y-6">
      <WithdrawalDetails id={id} />
    </div>
  );
}