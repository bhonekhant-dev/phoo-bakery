// app/cakes/add/page.js
'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddCakeTypePage() {
  const [cakeData, setCakeData] = useState({
    name: '',
    size: '6 inch',
    baseCost: 0,
    basePrice: 0,
  });
  const [isLoading, setIsLoading] = useState(false); 
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'baseCost' || name === 'basePrice') {
      setCakeData({ ...cakeData, [name]: parseFloat(value) || 0 });
    } else {
      setCakeData({ ...cakeData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/cakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cakeData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`ကိတ်အမျိုးအစား "${data.name}" ကို အောင်မြင်စွာ မှတ်တမ်းတင်ပြီးပါပြီ!`);
        setCakeData({ name: '', size: '6 inch', baseCost: 0, basePrice: 0 });
        router.push('/cakes'); 
      } else {
        alert(`မှတ်တမ်းတင်ရာတွင် အမှား: ${data.error || 'အကြောင်းမသိရသော အမှား'}`);
      }
    } catch (error) {
      console.error("API Call Error:", error);
      alert('Network Error: Server ကို ဆက်သွယ်၍ မရပါ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>🎂 ကိတ်အမျိုးအစား အသစ် ထည့်သွင်းခြင်း</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
        
        <label>ကိတ်အမည်: <input type="text" name="name" value={cakeData.name} onChange={handleChange} required /></label>
        
        <label>ကိတ် Size: 
          <select name="size" value={cakeData.size} onChange={handleChange}>
            <option value="6 inch">6 inch</option>
            <option value="8 inch">8 inch</option>
            <option value="Custom">အခြား</option>
          </select>
        </label>
        
        <label>ပုံမှန် အရင်းဈေး: <input type="number" name="baseCost" value={cakeData.baseCost} onChange={handleChange} required min="0" /></label>
        
        <label>ပုံမှန် ရောင်းဈေး: <input type="number" name="basePrice" value={cakeData.basePrice} onChange={handleChange} required min="0" /></label>
        
        <button type="submit" disabled={isLoading} style={{ padding: '10px', backgroundColor: '#87CEEB', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          {isLoading ? 'မှတ်တမ်းတင်နေသည်...' : 'ကိတ်မှတ်တမ်းတင်မည်'}
        </button>
      </form>
    </div>
  );
}