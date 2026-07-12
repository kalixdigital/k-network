"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  Home, 
  Package, 
  ShoppingBag, 
  Users,
  ShoppingCart,
  GitBranch
} from "lucide-react";
import { getLevel } from "@/lib/constants/levels";

export default function BottomNavigation() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const loadCartCount = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCartCount(0);
        return;
      }

      // Get user's membership level for theming
      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_level")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserLevel(profile.membership_level || 1);
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id);

      if (error) {
        console.error("Cart fetch error:", error);
        return;
      }

      const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
      if (isMountedRef.current) {
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error("Error loading cart count:", error);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadCartCount();

    // Listen for cart updates with debounce
    const handleCartUpdate = () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = setTimeout(() => {
        loadCartCount();
      }, 300);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener("cartUpdated", handleCartUpdate);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [loadCartCount]);

  const levelData = getLevel(userLevel);
  const activeColor = levelData.textColor;
  const badgeBg = levelData.bgColor;
  const badgeText = levelData.textColor;

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/products", label: "Products", icon: Package },
    { href: "/cart", label: "Cart", icon: ShoppingCart, showBadge: true },
    { href: "/orders", label: "Orders", icon: ShoppingBag }, // Changed from Genealogy to Orders
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive
                  ? activeColor
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.showBadge && cartCount > 0 && (
                  <span className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full ${badgeBg} text-[10px] font-bold text-white animate-in fade-in zoom-in-95 duration-200`}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

