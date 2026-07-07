import { Metadata } from "next";
import OrderDetails from "@/components/admin/orders/OrderDetails";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Order Details | Admin | K-NETWORK`,
    description: `View order details`,
  };
}

export default async function AdminOrderDetailsPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div className="space-y-6">
      <OrderDetails id={id} />
    </div>
  );
}
