// src/app/admin/products/page.tsx
"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabaseClient";

type Product = { id: number; name: string; price: number };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", price: "" });

    useEffect(() => {
        const fetchProducts = async () => {
        // gọi API lấy sản phẩm
        const { data, error } = await supabase.from("products").select("*");
        if (error) console.error(error);
        else console.log("Products:", data);
        };

        // gọi lần đầu
        fetchProducts();

        // Đăng ký Realtime
        const channel = supabase
        .channel("realtime-admin-products")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "products" },
            () => {
            fetchProducts();
            }
        )
        .subscribe();

        // Cleanup: hủy channel khi component unmount
        return () => {
        supabase.removeChannel(channel);
        };
    }, []);

    const fetchProducts = async () => {
        const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
        if (data) setProducts(data as Product[]);
    };

    const addProduct = async () => {
        if (!form.name || !form.price) return;
        await supabase.from("products").insert([{ name: form.name, price: Number(form.price) }]);
        setForm({ name: "", price: "" });
    };

    const deleteProduct = async (id: number) => {
        await supabase.from("products").delete().eq("id", id);
    };

    return (
        <AdminLayout>
        <h1 className="text-2xl font-bold mb-4">📦 Quản lý sản phẩm (Realtime)</h1>

        <div className="mb-4 flex gap-2 bg-white p-4 rounded-2xl shadow">
            <input
            className="border p-2 rounded flex-1"
            placeholder="Tên sản phẩm"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
            <input
            className="border p-2 rounded w-40"
            placeholder="Giá"
            type="number"
            value={form.price}
            onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
            />
            <button onClick={addProduct} className="bg-green-600 text-white px-4 py-2 rounded">
            Thêm
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full">
            <thead>
                <tr className="bg-gray-100">
                <th className="p-2 text-left">Tên</th>
                <th className="p-2">Giá</th>
                <th className="p-2">Hành động</th>
                </tr>
            </thead>
            <tbody>
                {products.map((p) => (
                <tr key={p.id} className="border-t">
                    <td className="p-2">{p.name}</td>
                    <td className="p-2 text-right">{p.price.toLocaleString()} VND</td>
                    <td className="p-2 text-center">
                    <button
                        onClick={() => deleteProduct(p.id)}
                        className="px-3 py-1 rounded bg-red-600 text-white"
                    >
                        Xóa
                    </button>
                    </td>
                </tr>
                ))}
                {products.length === 0 && (
                <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                    Chưa có sản phẩm nào.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
    </AdminLayout>
  );
}