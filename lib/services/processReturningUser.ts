import { supabase } from "@/lib/supabase/client";

export interface ReturningUserResult {
  success: boolean;
  productPoints?: number;
  directReferralPoints?: number;
  indirectReferralPoints?: number;
  referrerId?: string | null;
  indirectReferrerId?: string | null;
  orderNumber?: string;
  error?: string;
}

export async function processReturningUser(
  userId: string,
  orderId: string
): Promise<ReturningUserResult> {
  try {
    console.log("📦 Processing returning user purchase...");

    // 1. Get order with items and product points
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (points)
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError) throw new Error(`Order error: ${orderError.message}`);
    if (!orderData) throw new Error("Order not found");

    // 2. Get settings
    const { data: settings, error: settingsError } = await supabase
      .from("company_settings")
      .select("direct_referral_percentage, indirect_referral_percentage, points_rate")
      .eq("id", 1)
      .single();

    if (settingsError) {
      console.warn("Using default settings:", settingsError);
    }

    const directPercentage = settings?.direct_referral_percentage || 10; // 10% of product points
    const indirectPercentage = settings?.indirect_referral_percentage || 5; // 5% of product points
    const pointsRate = settings?.points_rate || 10;

    // 3. Calculate product points from order
    let productPoints = 0;
    orderData.order_items?.forEach((item: any) => {
      productPoints += (item.products?.points || 0) * item.quantity;
    });

    // Calculate referral points based on product points
    const directReferralPoints = Math.floor(productPoints * (directPercentage / 100));
    const indirectReferralPoints = Math.floor(productPoints * (indirectPercentage / 100));

    console.log(`📊 Product points: ${productPoints}`);
    console.log(`📊 Direct referral points (${directPercentage}%): ${directReferralPoints}`);
    console.log(`📊 Indirect referral points (${indirectPercentage}%): ${indirectReferralPoints}`);

    // 4. Get user's current stats and referral info
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("points, total_earnings, monthly_points, lifetime_points, monthly_earnings, lifetime_earnings, referred_by, full_name, id_number")
      .eq("id", userId)
      .single();

    if (profileError) throw new Error(`Profile error: ${profileError.message}`);

    // 5. Find direct and indirect referrers
    let directReferrerId: string | null = userProfile.referred_by || null;
    let indirectReferrerId: string | null = null;

    // If there's a direct referrer, find their referrer (indirect)
    if (directReferrerId) {
      const { data: directReferrer } = await supabase
        .from("profiles")
        .select("referred_by")
        .eq("id", directReferrerId)
        .single();

      if (directReferrer?.referred_by) {
        indirectReferrerId = directReferrer.referred_by;
      }
    }

    console.log(`👤 Direct Referrer: ${directReferrerId}`);
    console.log(`👤 Indirect Referrer: ${indirectReferrerId}`);

    // 6. Update user points
    await supabase
      .from("profiles")
      .update({
        points: (userProfile.points || 0) + productPoints,
        total_earnings: (userProfile.total_earnings || 0) + (productPoints * pointsRate),
        monthly_points: (userProfile.monthly_points || 0) + productPoints,
        lifetime_points: (userProfile.lifetime_points || 0) + productPoints,
        monthly_earnings: (userProfile.monthly_earnings || 0) + (productPoints * pointsRate),
        lifetime_earnings: (userProfile.lifetime_earnings || 0) + (productPoints * pointsRate),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    // 7. Record product points history
    if (productPoints > 0) {
      await supabase.from("points_history").insert({
        user_id: userId,
        points: productPoints,
        source: "purchase",
        source_id: orderId,
        description: `Product points from order #${orderData.order_number}`,
        created_at: new Date().toISOString(),
      });

      await supabase.from("earnings_history").insert({
        user_id: userId,
        points: productPoints,
        naira_equivalent: productPoints * pointsRate,
        source: "purchase",
        source_id: orderId,
        description: `Earnings from order #${orderData.order_number}`,
        created_at: new Date().toISOString(),
      });
    }

    // 8. Award DIRECT referral points (based on product points)
    if (directReferrerId && directReferralPoints > 0) {
      const { data: referrerProfile } = await supabase
        .from("profiles")
        .select("points, total_earnings, monthly_points, lifetime_points, monthly_earnings, lifetime_earnings")
        .eq("id", directReferrerId)
        .single();

      if (referrerProfile) {
        // Update referrer stats
        await supabase
          .from("profiles")
          .update({
            points: (referrerProfile.points || 0) + directReferralPoints,
            total_earnings: (referrerProfile.total_earnings || 0) + (directReferralPoints * pointsRate),
            monthly_points: (referrerProfile.monthly_points || 0) + directReferralPoints,
            lifetime_points: (referrerProfile.lifetime_points || 0) + directReferralPoints,
            monthly_earnings: (referrerProfile.monthly_earnings || 0) + (directReferralPoints * pointsRate),
            lifetime_earnings: (referrerProfile.lifetime_earnings || 0) + (directReferralPoints * pointsRate),
            updated_at: new Date().toISOString(),
          })
          .eq("id", directReferrerId);

        // Direct referral points history
        await supabase.from("points_history").insert({
          user_id: directReferrerId,
          points: directReferralPoints,
          source: "direct_referral",
          source_id: orderId,
          description: `Direct referral bonus (${directPercentage}%) from ${userProfile.full_name || "user"} - Order #${orderData.order_number}`,
          created_at: new Date().toISOString(),
        });

        await supabase.from("earnings_history").insert({
          user_id: directReferrerId,
          points: directReferralPoints,
          naira_equivalent: directReferralPoints * pointsRate,
          source: "direct_referral",
          source_id: orderId,
          description: `Direct referral earnings from order #${orderData.order_number}`,
          created_at: new Date().toISOString(),
        });

        // Activity log for direct referrer
        await supabase.from("activities").insert({
          user_id: directReferrerId,
          title: "Direct Referral Bonus",
          description: `You earned ${directReferralPoints} points (${directPercentage}% of product points) from order #${orderData.order_number}`,
          type: "referral",
          created_at: new Date().toISOString(),
        });

        console.log(`✅ Direct referrer ${directReferrerId} got ${directReferralPoints} bonus points`);
      }
    }

    // 9. Award INDIRECT referral points (based on product points)
    if (indirectReferrerId && indirectReferralPoints > 0) {
      const { data: indirectProfile } = await supabase
        .from("profiles")
        .select("points, total_earnings, monthly_points, lifetime_points, monthly_earnings, lifetime_earnings")
        .eq("id", indirectReferrerId)
        .single();

      if (indirectProfile) {
        // Update indirect referrer stats
        await supabase
          .from("profiles")
          .update({
            points: (indirectProfile.points || 0) + indirectReferralPoints,
            total_earnings: (indirectProfile.total_earnings || 0) + (indirectReferralPoints * pointsRate),
            monthly_points: (indirectProfile.monthly_points || 0) + indirectReferralPoints,
            lifetime_points: (indirectProfile.lifetime_points || 0) + indirectReferralPoints,
            monthly_earnings: (indirectProfile.monthly_earnings || 0) + (indirectReferralPoints * pointsRate),
            lifetime_earnings: (indirectProfile.lifetime_earnings || 0) + (indirectReferralPoints * pointsRate),
            updated_at: new Date().toISOString(),
          })
          .eq("id", indirectReferrerId);

        // Indirect referral points history
        await supabase.from("points_history").insert({
          user_id: indirectReferrerId,
          points: indirectReferralPoints,
          source: "indirect_referral",
          source_id: orderId,
          description: `Indirect referral bonus (${indirectPercentage}%) from order #${orderData.order_number}`,
          created_at: new Date().toISOString(),
        });

        await supabase.from("earnings_history").insert({
          user_id: indirectReferrerId,
          points: indirectReferralPoints,
          naira_equivalent: indirectReferralPoints * pointsRate,
          source: "indirect_referral",
          source_id: orderId,
          description: `Indirect referral earnings from order #${orderData.order_number}`,
          created_at: new Date().toISOString(),
        });

        // Activity log for indirect referrer
        await supabase.from("activities").insert({
          user_id: indirectReferrerId,
          title: "Indirect Referral Bonus",
          description: `You earned ${indirectReferralPoints} points (${indirectPercentage}% of product points) from order #${orderData.order_number}`,
          type: "referral",
          created_at: new Date().toISOString(),
        });

        console.log(`✅ Indirect referrer ${indirectReferrerId} got ${indirectReferralPoints} bonus points`);
      }
    }

    // 10. Update monthly statistics
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Update direct referrer's monthly stats
    if (directReferrerId && directReferralPoints > 0) {
      await supabase
        .from("monthly_statistics")
        .upsert({
          user_id: directReferrerId,
          month: month,
          year: year,
          monthly_points: directReferralPoints,
          monthly_earnings: directReferralPoints * pointsRate,
          active_direct_referrals: 1,
          qualified_level: 1,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,month,year"
        })
        .then(({ error }) => {
          if (error) console.warn("Monthly stats update error:", error);
        });
    }

    // Update indirect referrer's monthly stats
    if (indirectReferrerId && indirectReferralPoints > 0) {
      await supabase
        .from("monthly_statistics")
        .upsert({
          user_id: indirectReferrerId,
          month: month,
          year: year,
          monthly_points: indirectReferralPoints,
          monthly_earnings: indirectReferralPoints * pointsRate,
          active_direct_referrals: 0,
          qualified_level: 1,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,month,year"
        })
        .then(({ error }) => {
          if (error) console.warn("Monthly stats update error:", error);
        });
    }

    return {
      success: true,
      productPoints,
      directReferralPoints: directReferrerId ? directReferralPoints : 0,
      indirectReferralPoints: indirectReferrerId ? indirectReferralPoints : 0,
      referrerId: directReferrerId,
      indirectReferrerId: indirectReferrerId,
      orderNumber: orderData.order_number,
    };

  } catch (error: any) {
    console.error("Returning user processing error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}