// ============================================
// DATABASE TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  price: number;
  points: number;
  stock: number;
  category: string;
  rating: number;
  reviews: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ✅ Product for cart/order summary (only fields we need)
export interface CartProduct {
  id: string;
  name: string;
  price: number;
  points: number;
  image_url: string | null;
  stock: number;
}

export interface Profile {
  id: string;
  full_name: string;
  id_number: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  referred_by: string | null;
  membership_level: number;
  monthly_points: number;
  lifetime_points: number;
  monthly_earnings: number;
  lifetime_earnings: number;
  direct_referrals: number;
  indirect_referrals: number;
  is_verified: boolean;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// CART TYPES (For components)
// ============================================

export interface CartItemWithProduct extends CartItem {
  products: CartProduct[];
}

// ✅ Order Summary Item - matches Supabase response
export interface OrderSummaryItem {
  id?: string;
  quantity: number;
  products: CartProduct[];
}

// ✅ Cart Summary Item - alias for OrderSummaryItem
export type CartSummaryItem = OrderSummaryItem;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the first product from a cart item's products array
 */
export function getFirstProduct(item: CartItemWithProduct | OrderSummaryItem): CartProduct | null {
  if (!item.products) return null;
  
  // If products is an array, get the first item
  if (Array.isArray(item.products)) {
    return item.products[0] || null;
  }
  
  // If products is a single object, return it
  return item.products as unknown as CartProduct;
}

/**
 * Safely get product price from a cart item
 */
export function getProductPrice(item: CartItemWithProduct | OrderSummaryItem): number {
  const product = getFirstProduct(item);
  return product?.price || 0;
}

/**
 * Safely get product points from a cart item
 */
export function getProductPoints(item: CartItemWithProduct | OrderSummaryItem): number {
  const product = getFirstProduct(item);
  return product?.points || 0;
}

/**
 * Safely get product stock from a cart item
 */
export function getProductStock(item: CartItemWithProduct | OrderSummaryItem): number {
  const product = getFirstProduct(item);
  return product?.stock || 0;
}

/**
 * Safely get product name from a cart item
 */
export function getProductName(item: CartItemWithProduct | OrderSummaryItem): string {
  const product = getFirstProduct(item);
  return product?.name || 'Unknown Product';
}

/**
 * Safely get product image from a cart item
 */
export function getProductImage(item: CartItemWithProduct | OrderSummaryItem): string | null {
  const product = getFirstProduct(item);
  return product?.image_url || null;
}

/**
 * Safely get product ID from a cart item
 */
export function getProductId(item: CartItemWithProduct | OrderSummaryItem): string {
  const product = getFirstProduct(item);
  return product?.id || '';
}

/**
 * Calculate subtotal for a cart item
 */
export function calculateItemSubtotal(item: CartItemWithProduct | OrderSummaryItem): number {
  const product = getFirstProduct(item);
  return (product?.price || 0) * item.quantity;
}

/**
 * Calculate points for a cart item
 */
export function calculateItemPoints(item: CartItemWithProduct | OrderSummaryItem): number {
  const product = getFirstProduct(item);
  return (product?.points || 0) * item.quantity;
}

// ============================================
// ORDER TYPES
// ============================================

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  member_id: string;
  total: number;
  total_points: number;
  payment_proof: string | null;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_address: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  points_earned: number;
  created_at: string;
}

// ============================================
// COMPANY SETTINGS
// ============================================

export interface CompanySettings {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  points_rate: number;
  created_at: string;
  updated_at: string;
}

// ✅ Product for cart/order summary (all fields required)
export interface CartProduct {
  id: string;
  name: string;
  price: number;
  points: number;
  image_url: string | null;
  stock: number;
}