// src/components/AdminLayout.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const menu = [
    { label: "📦 Sản phẩm", path: "/admin/products" },
    { label: "🛒 Đơn hàng", path: "/admin/orders" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 text-xl font-bold border-b">Admin Panel</div>
        <nav className="flex-1">
          {menu.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-4 py-3 hover:bg-gray-200 ${
                pathname === item.path ? "bg-gray-300 font-semibold" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t text-sm text-gray-500">© 2025 Admin</div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
