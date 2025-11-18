// app/cakes/page.js
// ဤသည်မှာ Server Component ဖြစ်ပါသည် (Data Fetching ကို Server တွင် လုပ်ဆောင်သည်)

import Link from 'next/link';
import prisma from '@/lib/prisma'; // Database ကို တိုက်ရိုက် ခေါ်ယူ

// ကိတ်အားလုံးကို Database မှ ဆွဲထုတ်ပါမည်။
async function getCakes() {
  // Database Query ကို တိုက်ရိုက် ရေးသားခြင်း
  const cakes = await prisma.cake.findMany({
    orderBy: { name: 'asc' }, 
  });
  return cakes;
}

export default async function CakesPage() {
  const cakes = await getCakes(); // Server ဘက်မှ Data ကို စောင့်ဆိုင်းယူပါမည်

  return (
    <div style={{ maxWidth: '800px', margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🎂 ကိတ်အမျိုးအစား စာရင်း ({cakes.length} မျိုး)</h1>
        <Link 
          href="/cakes/add" 
          style={{ padding: '8px 15px', backgroundColor: '#87CEEB', color: 'white', textDecoration: 'none', borderRadius: '5px' }}
        >
          + ကိတ်အသစ်ထည့်ရန်
        </Link>
      </header>

      {cakes.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '50px' }}>မှတ်တမ်းတင်ထားသော ကိတ်အမျိုးအစား မရှိသေးပါ။</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px 0' }}>အမည်</th>
              <th>Size</th>
              <th>အရင်းဈေး (Base Cost)</th>
              <th>ရောင်းဈေး (Base Price)</th>
            </tr>
          </thead>
          <tbody>
            {cakes.map((cake) => (
              <tr key={cake.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{cake.name}</td>
                <td>{cake.size}</td>
                <td style={{ color: '#E9573E' }}>{cake.baseCost.toLocaleString()} ကျပ်</td>
                <td style={{ color: '#00A854', fontWeight: 'bold' }}>{cake.basePrice.toLocaleString()} ကျပ်</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}