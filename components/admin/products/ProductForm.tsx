"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { ArrowLeft, Upload, X } from "lucide-react";

type ProductFormData = {
  id?: string;
  name: string;
  description: string;
  price: number;
  points: number;
  stock: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
};

type ProductFormProps = {
  product?: ProductFormData;
  isEditing?: boolean;
};

export default function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    points: 0,
    stock: 0,
    category: "",
    image_url: null,
    is_active: true,
    is_featured: false,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
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
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast.error("Image size exceeds 2MB limit");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast.error("Please upload a JPEG, PNG, GIF, or WebP image");
      return;
    }

    setUploading(true);

    try {
      const fileName = `product-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      setFormData((prev) => ({
        ...prev,
        image_url: urlData.publicUrl,
      }));

      showToast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      showToast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image_url: null,
    }));
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
      setFormData((prev) => ({
        ...prev,
        category: newCategory,
      }));
      setNewCategory("");
      showToast.success("Category added");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        showToast.error("Product name is required");
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        showToast.error("Product description is required");
        setLoading(false);
        return;
      }

      if (formData.price <= 0) {
        showToast.error("Product price must be greater than 0");
        setLoading(false);
        return;
      }

      if (!formData.category) {
        showToast.error("Product category is required");
        setLoading(false);
        return;
      }

      const slug = generateSlug(formData.name);

      if (isEditing && product?.id) {
        const { error } = await supabase
          .from("products")
          .update({
            name: formData.name,
            slug,
            description: formData.description,
            price: formData.price,
            points: formData.points,
            stock: formData.stock,
            category: formData.category,
            image_url: formData.image_url,
            is_active: formData.is_active,
            is_featured: formData.is_featured,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        if (error) throw error;

        showToast.success("Product updated successfully");
      } else {
        const { error } = await supabase
          .from("products")
          .insert({
            name: formData.name,
            slug,
            description: formData.description,
            price: formData.price,
            points: formData.points,
            stock: formData.stock,
            category: formData.category,
            image_url: formData.image_url,
            is_active: formData.is_active,
            is_featured: formData.is_featured,
          });

        if (error) throw error;

        showToast.success("Product created successfully");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error saving product:", error);
      showToast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.push("/admin/products")}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </button>

      {/* ✅ Fixed: Responsive grid with proper width constraints */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 w-full">
        {/* Main Form - 2/3 width */}
        <div className="lg:col-span-2 space-y-6 w-full min-w-0">
          {/* Product Name */}
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-400">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Description */}
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-400">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Enter product description"
              required
            />
          </div>

          {/* Price and Points */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full">
            <div>
              <label className="block text-sm font-medium text-slate-400">
                Price (₦) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleNumberChange}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">
                Points
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleNumberChange}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Stock and Category */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full">
            <div>
              <label className="block text-sm font-medium text-slate-400">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleNumberChange}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">
                Category *
              </label>
              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category"
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="rounded-lg bg-emerald-600 px-3 py-2.5 text-white hover:bg-emerald-700 whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6 w-full min-w-0">
          {/* Image Upload */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 w-full">
            <h3 className="text-lg font-semibold text-white">Product Image</h3>
            <p className="mt-1 text-sm text-slate-400">Upload a product image</p>

            {formData.image_url ? (
              <div className="relative mt-4">
                <img
                  src={formData.image_url}
                  alt={formData.name}
                  className="w-full rounded-lg object-cover aspect-square max-h-[200px]"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 p-6 transition hover:border-emerald-500/50 hover:bg-slate-800">
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="mt-2 text-sm text-slate-400">
                  Click to upload image
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  JPEG, PNG, GIF, WebP (max 2MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}

            {uploading && (
              <div className="mt-3 flex items-center justify-center gap-2 text-emerald-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                <span>Uploading...</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 w-full">
            <h3 className="text-lg font-semibold text-white">Status</h3>

            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-white">Active</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-white">Featured</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {isEditing ? "Updating..." : "Creating..."}
              </span>
            ) : (
              <span>{isEditing ? "Update Product" : "Create Product"}</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}