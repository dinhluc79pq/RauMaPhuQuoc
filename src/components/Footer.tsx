import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-green-50 border-t mt-10 rounded">
      <div className="max-w-6xl mx-auto px-6 py-2 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        
        {/* Logo + Tên cửa hàng */}
        <div className="flex flex-col justify-center items-center">
          <Image
            src="/logo.jpg" // file logo nằm trong public/logo.png
            alt="Rau Má PQ"
            width={80}
            height={80}
            className="rounded-full shadow"
          />
          <span className="text-xl font-bold text-green-700">Rau Má Ngon</span>
        </div>

        {/* Thông tin liên hệ */}
        <div className="text-gray-700">
          <p>📍 Đường Cáp Treo - KP 6 - An Thới - Phú Quốc</p>
          <p>📞 Hotline: 0368 568 895</p>
          <p>📧 Mail: dinhluc79pq@gmail.com</p>
        </div>

        {/* Nút Zalo + Mail */}
        <div className="flex space-x-4 justify-center md:justify-end">
          <a
            href={`https://zalo.me/0368568895`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
          >
            <Image
              src="/zalo.png"
              alt="Zalo"
              width={20}
              height={20}
              className="mr-2"
            />
            Chat Zalo
          </a>
          <a
            href="mailto:dinhluc79pq@gmail.com"
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600"
          >
            <Image
              src="/mail.png"
              alt="Mail"
              width={20}
              height={20}
              className="mr-2"
            />
            Gửi Mail
          </a>
        </div>
      </div>

      <div className="bg-green-100 text-center py-3 text-sm text-gray-600">
        © {new Date().getFullYear()} Rau Má PQ - All Rights Reserved
      </div>
    </footer>
  );
}
