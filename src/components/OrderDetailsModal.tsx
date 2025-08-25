// src/components/OrderDetailsModal.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type DetailRow = {
  id: number;
  quantity: number;
  product: { id: number; name: string; price: number } | null;
};

export default function OrderDetailsModal({
    orderId,
    open,
    onClose,
}: {
    orderId: number | null;
    open: boolean;
    onClose: () => void;
}) {
    const [rows, setRows] = useState<DetailRow[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !orderId) return;
        loadDetails(orderId);

        // Realtime cho order_details của đơn này
        const channel = supabase
        .channel(`realtime-order-details-${orderId}`)
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "order_details", filter: `order_id=eq.${orderId}` },
            () => loadDetails(orderId)
        )
        .subscribe();

        return () => {
        supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, orderId]);

    const loadDetails = async (oid: number) => {
        setLoading(true);
        // Yêu cầu: đã có FK order_details.product_id -> products.id
        // Dùng alias để lấy product
        const { data, error } = await supabase
        .from("order_details")
        .select("id, quantity, product:products(id, name, price)")
        .eq("order_id", oid);

        if (!error && data) {
        setRows(
            data.map((r: any) => ({
            id: r.id,
            quantity: r.quantity,
            product: r.product,
            }))
        );
        }
        setLoading(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Chi tiết đơn hàng #{orderId}</h2>
            <button onClick={onClose} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
                Đóng
            </button>
            </div>

            {loading ? (
            <p>Đang tải...</p>
            ) : rows.length === 0 ? (
            <p>Đơn hàng chưa có chi tiết.</p>
            ) : (
            <table className="w-full">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2 text-left">Sản phẩm</th>
                    <th className="p-2 text-right">Đơn giá</th>
                    <th className="p-2 text-center">SL</th>
                    <th className="p-2 text-right">Thành tiền</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r) => (
                    <tr key={r.id} className="border-t">
                    <td className="p-2">{r.product?.name ?? "(đã xóa)"}</td>
                    <td className="p-2 text-right">
                        {r.product ? r.product.price.toLocaleString() : 0} VND
                    </td>
                    <td className="p-2 text-center">{r.quantity}</td>
                    <td className="p-2 text-right">
                        {((r.product?.price ?? 0) * r.quantity).toLocaleString()} VND
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>
        </div>
    );
}
