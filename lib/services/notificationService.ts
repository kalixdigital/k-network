import { supabase } from "@/lib/supabase/client";

type NotificationType = 'referral' | 'purchase' | 'points' | 'withdrawal' | 'system' | 'membership';

interface CreateNotificationParams {
  userId: string;
  title: string;
  description: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}

export async function createNotification({
  userId,
  title,
  description,
  type,
  metadata = {},
}: CreateNotificationParams) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        description,
        type,
        is_read: false,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

// Bulk create notifications for multiple users
export async function createBulkNotifications(
  notifications: CreateNotificationParams[]
) {
  try {
    const results = await Promise.all(
      notifications.map((notif) => createNotification(notif))
    );
    return results.filter((r) => r !== null);
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    return [];
  }
}

// Get all admin users
export async function getAdminUsers() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "admin");

    if (error) {
      console.error("Error fetching admin users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
}

// Get unread notifications for a user
export async function getUnreadNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching unread notifications:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

// Delete a notification
export async function deleteNotification(notificationId: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error("Error deleting notification:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}

// Pre-defined notification templates
export const NotificationTemplates = {
  // ========== USER NOTIFICATIONS ==========
  orderPlaced: (orderNumber: string, total: number, points: number) => ({
    title: "Order Placed Successfully! 🎉",
    description: `Your order #${orderNumber} has been placed successfully. Total: ₦${total.toLocaleString()}. You earned ${points} points. We'll notify you once your order is confirmed.`,
    type: "purchase" as NotificationType,
  }),

  orderConfirmed: (orderNumber: string) => ({
    title: "Order Confirmed ✅",
    description: `Your order #${orderNumber} has been confirmed and is being processed.`,
    type: "purchase" as NotificationType,
  }),

  orderCompleted: (orderNumber: string) => ({
    title: "Order Completed 🎉",
    description: `Your order #${orderNumber} has been completed. Thank you for your purchase!`,
    type: "purchase" as NotificationType,
  }),

  orderCancelled: (orderNumber: string) => ({
    title: "Order Cancelled ❌",
    description: `Your order #${orderNumber} has been cancelled.`,
    type: "purchase" as NotificationType,
  }),

  referralBonus: (referralName: string, points: number) => ({
    title: "Referral Bonus Earned! 🎉",
    description: `You earned ${points} points for referring ${referralName}!`,
    type: "referral" as NotificationType,
  }),

  levelUp: (levelName: string) => ({
    title: "Level Up! 🚀",
    description: `Congratulations! You've reached the ${levelName} level. New rewards unlocked!`,
    type: "membership" as NotificationType,
  }),

  pointsEarned: (points: number, source: string) => ({
    title: "Points Earned! ⭐",
    description: `You earned ${points} points from ${source}.`,
    type: "points" as NotificationType,
  }),

  withdrawalRequested: (amount: number) => ({
    title: "Withdrawal Request Received 💰",
    description: `Your withdrawal request of ₦${amount.toLocaleString()} has been received and is being processed.`,
    type: "withdrawal" as NotificationType,
  }),

  withdrawalApproved: (amount: number) => ({
    title: "Withdrawal Approved ✅",
    description: `Your withdrawal of ₦${amount.toLocaleString()} has been approved and is being processed.`,
    type: "withdrawal" as NotificationType,
  }),

  withdrawalCompleted: (amount: number) => ({
    title: "Withdrawal Completed 💰",
    description: `Your withdrawal of ₦${amount.toLocaleString()} has been completed.`,
    type: "withdrawal" as NotificationType,
  }),

  // ========== ADMIN NOTIFICATIONS ==========
  newOrderAdmin: (orderNumber: string, customerName: string, total: number) => ({
    title: "New Order Received! 📦",
    description: `New order #${orderNumber} from ${customerName}. Total: ₦${total.toLocaleString()}`,
    type: "system" as NotificationType,
  }),

  newUserRegistration: (userName: string, userId: string) => ({
    title: "New User Registered! 👤",
    description: `New user ${userName} has registered. ID: ${userId}`,
    type: "system" as NotificationType,
  }),

  withdrawalRequestAdmin: (userName: string, amount: number) => ({
    title: "New Withdrawal Request! 💰",
    description: `${userName} has requested a withdrawal of ₦${amount.toLocaleString()}`,
    type: "system" as NotificationType,
  }),

  lowStockAlert: (productName: string, stock: number) => ({
    title: "Low Stock Alert! ⚠️",
    description: `Product "${productName}" is running low. Current stock: ${stock}`,
    type: "system" as NotificationType,
  }),

  userLevelUpAdmin: (userName: string, levelName: string) => ({
    title: "User Level Up! 🚀",
    description: `${userName} has reached ${levelName} level!`,
    type: "system" as NotificationType,
  }),

  orderStatusUpdateAdmin: (orderNumber: string, status: string) => ({
    title: "Order Status Update 📦",
    description: `Order #${orderNumber} status changed to: ${status}`,
    type: "system" as NotificationType,
  }),

  paymentReceivedAdmin: (orderNumber: string, amount: number) => ({
    title: "Payment Received 💳",
    description: `Payment of ₦${amount.toLocaleString()} received for order #${orderNumber}`,
    type: "system" as NotificationType,
  }),
};