// src/app/admin/orders/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import OrderDetailsModal from "@/components/OrderDetailsModal";
import ConfirmModal from "@/components/ConfirmModal";

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  note: string | null;
  total_price: number;
  status: 0 | 1 | 2;
  created_at: string;
};

const statusText: Record<Order["status"], string> = {
  0: "Đã đặt",
  1: "Đã nhận",
  2: "Đã giao hàng",
};

const statusMap: Record<0 | 1 | 2, { text: string; className: string }> = {
  0: { text: "Đã đặt", className: "bg-white text-black" },
  1: { text: "Đã nhận", className: "bg-yellow-200 text-yellow-800" },
  2: { text: "Đã giao hàng", className: "bg-blue-200 text-blue-800" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // form thêm/sửa nhanh
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    note: "",
    total_price: "",
    status: 0 as 0 | 1 | 2,
  });

  // Modal chi tiết
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();

    // Realtime cho bảng orders
    const channel = supabase
      .channel("realtime-admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  };

  const [confirmOrder, setConfirmOrder] = useState<{id: number, newStatus: 0|1|2} | null>(null);

    const handleStatusChange = (id: number, newStatus: 0|1|2) => {
        
        setConfirmOrder({ id, newStatus });
        };

        const confirmUpdate = async () => {
        if (!confirmOrder) return;
        await supabase
            .from("orders")
            .update({ status: confirmOrder.newStatus })
            .eq("id", confirmOrder.id);

        setConfirmOrder(null);
        };

    const addOrder = async () => {
        if (!form.customer_name || !form.phone || !form.address || !form.total_price) return;
        await supabase.from("orders").insert([
        {
            customer_name: form.customer_name,
            phone: form.phone,
            address: form.address,
            note: form.note || null,
            total_price: Number(form.total_price),
            status: form.status, // 0/1/2
        },
        ]);
        setForm({
        customer_name: "",
        phone: "",
        address: "",
        note: "",
        total_price: "",
        status: 0,
        });
    };

  const updateStatus = async (id: number, next: 0 | 1 | 2) => {
    await supabase.from("orders").update({ status: next }).eq("id", id);
  };

  const deleteOrder = async (id: number) => {
    await supabase.from("orders").delete().eq("id", id);
  };

  const openDetails = (id: number) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const totalToday = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    const start = new Date(y, m, d).getTime();
    const end = start + 24 * 60 * 60 * 1000;
    return orders
      .filter((o) => {
        const t = new Date(o.created_at).getTime();
        return t >= start && t < end;
      })
      .reduce((sum, o) => sum + (o.total_price || 0), 0);
  }, [orders]);

    function nextStatus(current: 0 | 1 | 2): 0 | 1 | 2 {
        if (current === 0) return 1;
        if (current === 1) return 2;
        return 2;
    }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">🛒 Quản lý đơn hàng (Realtime)</h1>

      {/* KPI nhỏ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Đơn hôm nay</div>
          <div className="text-2xl font-semibold">{orders.length}</div>
        </div>
        <div className="rounded-2xl p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Doanh thu hôm nay</div>
          <div className="text-2xl font-semibold">
            {totalToday.toLocaleString()} VND
          </div>
        </div>
        <div className="rounded-2xl p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Đơn đã giao</div>
          <div className="text-2xl font-semibold">
            {orders.filter((o) => o.status === 2).length}
          </div>
        </div>
      </div>

      {/* Form thêm đơn nhanh */}
      <div className="mb-6 flex flex-wrap gap-2 bg-white p-4 rounded-2xl shadow">
        <input
          className="border p-2 rounded flex-1 min-w-[220px]"
          placeholder="Tên khách hàng"
          value={form.customer_name}
          onChange={(e) => setForm((s) => ({ ...s, customer_name: e.target.value }))}
        />
        <input
          className="border p-2 rounded w-48"
          placeholder="SĐT"
          value={form.phone}
          onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
        />
        <input
          className="border p-2 rounded flex-1 min-w-[260px]"
          placeholder="Địa chỉ"
          value={form.address}
          onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
        />
        <input
          className="border p-2 rounded w-40"
          placeholder="Tổng tiền"
          type="number"
          value={form.total_price}
          onChange={(e) => setForm((s) => ({ ...s, total_price: e.target.value }))}
        />
        <select
          className="border p-2 rounded w-40"
          value={form.status}
          onChange={(e) => setForm((s) => ({ ...s, status: Number(e.target.value) as 0|1|2 }))}
        >
          <option value={0}>Đã đặt</option>
          <option value={1}>Đã nhận</option>
          <option value={2}>Đã giao hàng</option>
        </select>
        <input
          className="border p-2 rounded flex-1 min-w-[220px]"
          placeholder="Ghi chú"
          value={form.note}
          onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
        />
        <button onClick={addOrder} className="bg-green-600 text-white px-4 py-2 rounded">
          Thêm đơn
        </button>
      </div>

      {/* Bảng đơn hàng */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        {loading ? (
          <p className="p-4">Đang tải...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Khách hàng</th>
                <th className="p-2">SĐT</th>
                <th className="p-2 text-left">Địa chỉ</th>
                <th className="p-2 text-right">Tổng</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2 text-left">Ngày</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-2">{o.customer_name}</td>
                  <td className="p-2 text-center">{o.phone}</td>
                  <td className="p-2">{o.address}</td>
                  <td className="p-2 text-right">{o.total_price.toLocaleString()} VND</td>
                  <td className="p-2 text-center">
                    <select
                        value={o.status}
                        onChange={(e) =>
                        handleStatusChange(o.id, Number(e.target.value) as 0|1|2)}
                        className={`border p-2 rounded w-40 ${statusMap[o.status].className}`}
                    >
                        {Object.entries(statusMap).map(([value, { text, className }]) => (
                            <option key={value} value={value} className={className}>
                            {text}
                            </option>
                        ))}
                    </select>
                  </td>
                  <td className="p-2 text-sm text-gray-600">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="p-2 flex gap-2 justify-center">
                    <button
                      onClick={() => openDetails(o.id)}
                      className="px-3 py-1 rounded bg-indigo-600 text-white"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => supabase.from("orders").delete().eq("id", o.id)}
                      className="px-3 py-1 rounded bg-red-600 text-white"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal chi tiết */}
      <OrderDetailsModal
        orderId={detailId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

    <ConfirmModal
        open={!!confirmOrder}
        title="Xác nhận cập nhật trạng thái"
        message={`Bạn có chắc muốn chuyển đơn #${confirmOrder?.id} sang trạng thái ${
            confirmOrder
            ? { 0: "Đã đặt", 1: "Đã nhận", 2: "Đã giao hàng" }[confirmOrder.newStatus]
            : ""
        }?`}
        onConfirm={confirmUpdate}
        onCancel={() => setConfirmOrder(null)}
    />
    </AdminLayout>
  );
}