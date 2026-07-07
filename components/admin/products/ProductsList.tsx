"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { Eye, Edit, Trash2, Search, Filter, X, Package } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  points: number;
  stock: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

type FilterOptions = {
  category: string;
  is_active: string;
  search: string;
};

export default function ProductsList() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: "",
    is_active: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const itemsPerPage = 10;

  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .order("category");

      if (error) throw error;

      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select("*", { count: "exact" });

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.is_active) {
        query = query.eq("is_active", filters.is_active === "true");
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setProducts(data || []);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error loading products:", error);
      showToast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      is_active: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const handleViewProduct = (product: Product) => {
    router.push(`/products/${product.slug}`);
  };

  const handleEditProduct = (product: Product) => {
    router.push(`/admin/products/${product.id}`);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete);

      if (error) throw error;

      showToast.success("Product deleted successfully");
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast.error("Failed to delete product");
    } finally {
      setProductToDelete(null);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ 
          is_active: !product.is_active,
          updated_at: new Date().toISOString()
        })
        .eq("id", product.id);

      if (error) throw error;

      showToast.success(`Product ${product.is_active ? 'deactivated' : 'activated'} successfully`);
      loadProducts();
    } catch (error) {
      console.error("Error toggling product status:", error);
      showToast.error("Failed to update product status");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Product",
      width: "250px",
      render: (item: Product) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
              <Package className="h-5 w-5 text-slate-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-white truncate max-w-[150px]">
              {item.name}
            </p>
            <p className="text-xs text-slate-400 truncate max-w-[150px]">
              {item.category}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      width: "100px",
      render: (item: Product) => (
        <span className="font-bold text-emerald-400">
          ₦{item.price.toLocaleString()}
        </span>
      ),
    },
    {
      key: "points",
      header: "Points",
      width: "80px",
      render: (item: Product) => (
        <span className="text-yellow-400">{item.points}</span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      width: "80px",
      render: (item: Product) => (
        <span className={item.stock > 0 ? "text-white" : "text-red-400"}>
          {item.stock}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      width: "120px",
      render: (item: Product) => (
        <button
          onClick={() => toggleProductStatus(item)}
          className="cursor-pointer"
        >
          <StatusBadge status={item.is_active ? "active" : "inactive"} type="member" />
        </button>
      ),
    },
    {
      key: "created_at",
      header: "Date Added",
      width: "120px",
      render: (item: Product) => (
        <span className="text-slate-400 whitespace-nowrap">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "140px",
      render: (item: Product) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewProduct(item)}
            className="rounded-lg p-1.5 text-emerald-400 transition hover:bg-emerald-500/10 hover:text-emerald-300"
            title="View Product"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditProduct(item)}
            className="rounded-lg p-1.5 text-blue-400 transition hover:bg-blue-500/10 hover:text-blue-300"
            title="Edit Product"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setProductToDelete(item.id)}
            className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            title="Delete Product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full">
        <div className="w-full sm:flex-1 sm:max-w-[300px]">
          <SearchBar
            placeholder="Search products..."
            onSearch={(query) => handleFilterChange("search", query)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition whitespace-nowrap ${
              showFilters
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-slate-700 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {Object.values(filters).some((v) => v) && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                {Object.values(filters).filter((v) => v).length}
              </span>
            )}
          </button>

          {Object.values(filters).some((v) => v) && (
            <button
              onClick={clearFilters}
              className="text-sm text-slate-400 hover:text-white whitespace-nowrap"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 w-full overflow-x-auto">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-[280px]">
            <div>
              <label className="block text-sm font-medium text-slate-400">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">
                Status
              </label>
              <select
                value={filters.is_active}
                onChange={(e) => handleFilterChange("is_active", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="min-w-[800px]">
          <DataTable
            data={products}
            columns={columns}
            loading={loading}
            emptyMessage="No products found"
          />
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="w-full overflow-x-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}