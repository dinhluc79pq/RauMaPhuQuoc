"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

interface FormData {
  name: string
  phone: string
  address: string
}

interface CartItem {
  id: number
  name: string
  price: number
  image_url: string
}

export default function Checkout() {
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    address: "",
  })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]")
    const total = cart.reduce((sum, item) => sum + item.price, 0)

    if (!form.name || !form.phone || !form.address) {
      setMessage("❌ Vui lòng nhập đầy đủ thông tin")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("orders").insert([
      {
        customer_name: form.name,
        phone: form.phone,
        address: form.address,
        items: cart,
        total_price: total,
      },
    ])

    if (error) {
      console.error(error)
      setMessage("❌ Lỗi khi đặt hàng!")
    } else {
      localStorage.removeItem("cart")
      setMessage("✅ Đặt hàng thành công!")
      setForm({ name: "", phone: "", address: "" })
    }
    setLoading(false)
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🛒 Thanh toán</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow"
      >
        <input
          type="text"
          placeholder="Tên khách hàng"
          value={form.name}
          className="border p-3 rounded"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={form.phone}
          className="border p-3 rounded"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="Địa chỉ"
          value={form.address}
          className="border p-3 rounded"
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đặt hàng"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-lg font-medium ${
            message.includes("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </main>
  )
}
