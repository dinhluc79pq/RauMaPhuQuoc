import React from "react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white">
      <div className="container conatiner-theme mx-auto flex items-center justify-between py-4">
        {/* Logo + Tên cửa hàng */}
        <div className="flex items-center space-x-3">
          {/* Logo (bạn thay /logo.png bằng logo thật trong /public) */}
          <Image className="rounded-full shadow" src="/logo.jpg" alt="Rau Má PQ" width={50} height={50} />
          <div>
            <h1 className="text-xl font-bold text-green-700">Rau Má Ngon</h1>
            <p className="text-sm text-gray-600 italic">
              Ngon - Bổ - Rẻ<br />
              Quan trọng là chất lượng
            </p>
          </div>
        </div>
        <div>
            <Image className=" shadow" src="/ship_logo.jpg" alt="Ship Logo" width={120} height={100}/>
        </div>
      </div>
    </header>
  );
}
