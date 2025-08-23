"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Footer from "@/components/Footer";
import Header from "@/components/Header";

interface Product {
  id: number
  name: string
  price: number
  image_url: string
  description?: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  // const [cart, setCart] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([]);

  // 🥤 Lấy danh sách sản phẩm
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("*")
      if (error) {
        console.error("Lỗi load sản phẩm:", error.message)
      } else {
        setProducts(data as Product[])
      }
    }
    fetchProducts()
  }, [])

  // 🛒 Load giỏ hàng từ localStorage khi mở lại trang
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  function updateCart(newCart: CartItem[]) {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  }

  // 🛒 Thêm vào giỏ hàng
  function addToCart(product: Product) {
    const existing = cart.find((item) => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    updateCart(newCart);
  }

  function decreaseFromCart(product: Product) {
    const existing = cart.find((item) => item.id === product.id);
    if (!existing) return;
    let newCart;
    if (existing.quantity > 1) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      );
    } else {
      newCart = cart.filter((item) => item.id !== product.id);
    }
    updateCart(newCart);
  }

  function getQuantity(productId: number) {
    const item = cart.find((c) => c.id === productId);
    return item ? item.quantity : 0;
  }

   // 👉 Tính tổng tiền giỏ hàng
  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price)*Number(item.quantity), 0);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN").format(value) + " VND";
  }

  function resetCart() {
    setCart([]);
    localStorage.removeItem("cart");
  }


  return (
    <>
      <main className="p-6 pt-0">
        <Header />
        <div className="category-bar sticky top-0 flex justify-between items-center mb-4 mt-6 p-2 rounded">
          <h1 className="text-lg font-bold">🥤 Danh sách sản phẩm</h1>
          <button
            onClick={() =>
              document.getElementById("cart-section")?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-red-500 text-xl font-bold px-4 rounded"
          >
            🛒
          </button>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="border p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <img
                src={p.image_url}
                alt={p.name}
                className="h-40 w-full object-contain rounded-lg mb-3 bg-gray-100"
              />

              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold">{p.name}</h2>
                <p className="text-green-600 w-[40%] text-right font-medium">{formatCurrency(p.price)}</p>
              </div>

              <div className="flex items-center justify-end mt-3">
                {/* <button
                  onClick={() => addToCart(p)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  ➕ Thêm vào giỏ
                </button> */}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decreaseFromCart(p)}
                    className="px-1 py-1 bg-gray-300 rounded text-xs"
                  >
                    ➖
                  </button>
                  <span>Đã chọn: {getQuantity(p.id)}</span>
                  <button
                    onClick={() => addToCart(p)}
                    className="px-1 py-1 bg-gray-300 rounded text-xs"
                  >
                    ➕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Giỏ hàng */}
        <div id="cart-section" className="mt-10 p-4 border rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">🛒 Giỏ hàng</h2>
            <button
              onClick={resetCart}
              className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
            >
              🔄 Reset
            </button>
          </div>
          
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
          <div className="flex justify-center mt-10">
            <button
              onClick={() => (window.location.href = "/checkout")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
