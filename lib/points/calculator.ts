import { supabase } from '@/lib/supabase/client';
import { 
  PointsCalculationResult, 
  CommissionResult,
  Order,
  OrderItem,
  Profile,
  Product
} from './types';
import { getCompanySettings, getMembershipLevels } from './settings';
import { getReferralChain } from './referrals';
import { 
  recordPointsHistory, 
  recordEarningsHistory, 
  updateMonthlyStatistics 
} from './history';
import { evaluateMembership } from './membership';

export async function processOrderCompletion(orderId: string): Promise<{
  success: boolean;
  result?: PointsCalculationResult;
  error?: string;
}> {
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error('Order not found');

    // Verify order is completed
    if (order.status !== 'completed') {
      return {
        success: false,
        error: 'Order is not completed'
      };
    }

    // Get company settings
    const settings = await getCompanySettings();
    if (!settings) throw new Error('Company settings not found');

    const buyerId = order.user_id;
    const month = new Date(order.created_at).getMonth() + 1;
    const year = new Date(order.created_at).getFullYear();

    // Calculate product points
    let productPoints = 0;
    order.order_items?.forEach((item: any) => {
      productPoints += (item.products?.points || 0) * item.quantity;
    });

    // Get referral chain
    const { direct, indirect } = await getReferralChain(buyerId);

    // Calculate commissions
    let directCommission: CommissionResult | null = null;
    let indirectCommission: CommissionResult | null = null;

    if (direct) {
      directCommission = {
        userId: direct.id,
        pointsAwarded: settings.direct_referral_bonus || 10,
        source: 'direct_referral',
        description: `Direct referral bonus for ${direct.full_name || 'User'}`
      };
    }

    if (indirect) {
      indirectCommission = {
        userId: indirect.id,
        pointsAwarded: settings.indirect_referral_bonus || 10,
        source: 'indirect_referral',
        description: `Indirect referral bonus for ${indirect.full_name || 'User'}`
      };
    }

    // Calculate total points
    const totalPoints = productPoints + 
      (directCommission?.pointsAwarded || 0) + 
      (indirectCommission?.pointsAwarded || 0);

    const totalEarnings = totalPoints * (settings.points_rate || 10);

    // Update buyer profile
    await updateUserPoints(buyerId, productPoints, totalEarnings);

    // Update direct sponsor
    if (directCommission) {
      await updateUserPoints(
        directCommission.userId,
        directCommission.pointsAwarded,
        directCommission.pointsAwarded * (settings.points_rate || 10)
      );
    }

    // Update indirect sponsor
    if (indirectCommission) {
      await updateUserPoints(
        indirectCommission.userId,
        indirectCommission.pointsAwarded,
        indirectCommission.pointsAwarded * (settings.points_rate || 10)
      );
    }

    // Update monthly statistics
    await updateMonthlyStatistics(buyerId, month, year, {
      monthly_points: productPoints,
      monthly_earnings: productPoints * (settings.points_rate || 10)
    });

    if (directCommission) {
      await updateMonthlyStatistics(directCommission.userId, month, year, {
        monthly_points: directCommission.pointsAwarded,
        monthly_earnings: directCommission.pointsAwarded * (settings.points_rate || 10)
      });
    }

    if (indirectCommission) {
      await updateMonthlyStatistics(indirectCommission.userId, month, year, {
        monthly_points: indirectCommission.pointsAwarded,
        monthly_earnings: indirectCommission.pointsAwarded * (settings.points_rate || 10)
      });
    }

    // Record history with proper error handling
    try {
      await recordPointsHistory({
        user_id: buyerId,
        points: productPoints,
        source: 'purchase' as const,
        source_id: orderId,
        description: `Product points from order ${order.order_number}`,
        reference_id: order.order_number
      });
    } catch (error) {
      console.error('Failed to record points history:', error);
      // Don't throw - continue with other operations
    }
    
    // For direct and indirect commissions, wrap in try-catch individually
    if (directCommission) {
      try {
        await recordPointsHistory({
          user_id: directCommission.userId,
          points: directCommission.pointsAwarded,
          source: 'direct_referral' as const,
          source_id: orderId,
          description: directCommission.description,
          reference_id: order.order_number
        });
      } catch (error) {
        console.error('Failed to record direct referral points:', error);
      }
    }

    if (indirectCommission) {
      try {
        await recordPointsHistory({
          user_id: indirectCommission.userId,
          points: indirectCommission.pointsAwarded,
          source: 'indirect_referral' as const,
          source_id: orderId,
          description: indirectCommission.description,
          reference_id: order.order_number
        });
      } catch (error) {
        console.error('Failed to record indirect referral points:', error);
      }
    }

    // Record earnings history with proper error handling
    try {
      await recordEarningsHistory({
        user_id: buyerId,
        points: productPoints,
        naira_equivalent: productPoints * (settings.points_rate || 10),
        source: 'purchase' as const,
        source_id: orderId,
        description: `Earnings from order ${order.order_number}`
      });
    } catch (error) {
      console.error('Failed to record earnings history:', error);
    }

    // Evaluate membership
    await evaluateMembership(buyerId, month, year);

    // Create activity log
    await createActivityLog(
      buyerId,
      'Order Completed',
      `Order ${order.order_number} completed. Earned ${totalPoints} points (₦${totalEarnings.toLocaleString()})`
    );

    const result: PointsCalculationResult = {
      buyerId,
      productPoints,
      directReferralPoints: directCommission?.pointsAwarded || 0,
      indirectReferralPoints: indirectCommission?.pointsAwarded || 0,
      totalPoints,
      totalEarnings,
      directReferralCommission: directCommission,
      indirectReferralCommission: indirectCommission
    };

    return {
      success: true,
      result
    };

  } catch (error) {
    console.error('Error processing order completion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function updateUserPoints(userId: string, points: number, earnings: number): Promise<void> {
  try {
    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('points, total_earnings, monthly_points, lifetime_points, monthly_earnings, lifetime_earnings')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Update profile with all points fields
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        points: (profile.points || 0) + points,
        total_earnings: (profile.total_earnings || 0) + earnings,
        monthly_points: (profile.monthly_points || 0) + points,
        lifetime_points: (profile.lifetime_points || 0) + points,
        monthly_earnings: (profile.monthly_earnings || 0) + earnings,
        lifetime_earnings: (profile.lifetime_earnings || 0) + earnings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
}

async function createActivityLog(userId: string, title: string, description: string): Promise<void> {
  try {
    await supabase
      .from('activities')
      .insert({
        user_id: userId,
        title,
        description,
        type: 'purchase'
      });
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
}

// Call this function when an order is marked as completed
export async function handleOrderCompleted(orderId: string) {
  const result = await processOrderCompletion(orderId);
  if (result.success) {
    console.log('✅ Points calculation completed:', result.result);
  } else {
    console.error('❌ Points calculation failed:', result.error);
  }
  return result;
}