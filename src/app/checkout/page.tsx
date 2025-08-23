"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

interface CartItem {
  id: number
  name: string
  price: number
  image_url: string
  quantity: number
  description?: string;
}


function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + " VND";
}

export default function Checkout() {
  const [form, setForm] = useState({
    phone: "",
    name: "",
    address: "",
    note: "",
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Lấy giỏ hàng từ localStorage
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("orders").insert([
      {
        customer_name: form.name,
        phone: form.phone,
        address: form.address,
        note: form.note,
        items: cart,
        total_price: totalPrice,
      },
    ]);

    if (error) {
      setMessage("❌ Lỗi khi đặt hàng!");
    } else {
      localStorage.removeItem("cart");
      setCart([]);
      setMessage("✅ Đặt hàng thành công!");
      alert("🎉 Đặt hàng thành công!");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }

  return (
    <>
    <div className="p-6 pt-0 max-w-2xl mx-auto">
      <Header />
      <h1 className="text-2xl mt-3 font-semibold text-center mb-4">Thanh toán</h1>

      {/* 👉 Giỏ hàng */}
      <div id="cart-section" className="mt-6 p-4 border rounded-xl shadow">        
        {cart.length === 0 ? (
          <p className="text-gray-600">Giỏ hàng trống</p>
        ) : (
          <ul className="space-y-2">
            {cart.map((item, i) => (
              <li
                key={i}
                className="grid grid-cols-[60%_5%_35%] border-b pb-2 last:border-0"
              >
                <span className="truncate">{item.name}</span>
                <span className="text-center">{item.quantity}</span>
                <span className="font-medium text-green-600 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {cart.length > 0 && (
          <div className="mt-4 font-bold text-lg text-right">
            Tổng: {formatCurrency(totalPrice)}
          </div>
        )}
      </div>

      {/* 👉 Form thông tin */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-8">
        <input
          type="text"
          placeholder="Số điện thoại"
          className="border p-2 rounded"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
          pattern="^(0[0-9]{9})$"
        />
        <input
          type="text"
          placeholder="Tên người nhận"
          className="border p-2 rounded"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Địa chỉ nhận"
          className="border p-2 rounded h-16"
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          required
        ></textarea>
        <textarea
          placeholder="Ghi chú"
          className="border p-2 rounded h-24"
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        ></textarea>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          disabled={cart.length === 0}
        >
          Xác nhận đặt hàng
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
    <Footer />
    </>
  );
}
