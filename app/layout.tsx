// app/layout.js

import Link from 'next/link';
// Style တွေလည်း ဒီမှာ import လုပ်နိုင်ပါတယ် (ဥပမာ- Tailwind CSS)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="my">
      <body>
        <header style={{ padding: '15px 30px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
          <nav style={{ display: 'flex', gap: '20px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
              🍰 Phoo Bakery Dashboard
            </Link>
            <Link href="/cakes" style={{ textDecoration: 'none', color: '#333' }}>
              🎂 ကိတ်အမျိုးအစားများ
            </Link>
            <Link href="/sales/add" style={{ textDecoration: 'none', color: '#333' }}>
              💸 ရောင်းအားမှတ်တမ်းထည့်ရန်
            </Link>
          </nav>
        </header>
        <main style={{ padding: '20px' }}>
          {children} {/* ⬅️ Page content ဝင်ရောက်မည့်နေရာ */}
        </main>
      </body>
    </html>
  );
}