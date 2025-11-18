// app/api/cakes/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // lib/prisma.js ကနေ import လုပ်ပါ

// ------------------------------------
// GET Request: ကိတ်အမျိုးအစားအားလုံးကို ပြန်ဆွဲယူခြင်း
// ------------------------------------
export async function GET() {
  try {
    const cakes = await prisma.cake.findMany({
      orderBy: { name: 'asc' }, 
    });
    
    return NextResponse.json(cakes, { status: 200 });

  } catch (error) {
    console.error("ကိတ်စာရင်း ဆွဲယူရာတွင် အမှား:", error);
    return NextResponse.json(
      { error: "ကိတ်စာရင်းကို ဆွဲယူနိုင်ခြင်း မရှိပါ" },
      { status: 500 }
    );
  }
}

// ------------------------------------
// POST Request: ကိတ်အမျိုးအစားအသစ် ထည့်သွင်းခြင်း
// ------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, size, baseCost, basePrice } = body;

    // validation
    if (!name || !size || baseCost === undefined || basePrice === undefined) {
      return NextResponse.json({ error: "လိုအပ်သော fields များ ပြည့်စုံရန် လိုအပ်ပါသည်" }, { status: 400 });
    }

    const newCake = await prisma.cake.create({
      data: {
        name,
        size,
        baseCost: parseFloat(baseCost), 
        basePrice: parseFloat(basePrice),
      },
    });

    return NextResponse.json(newCake, { status: 201 });

  } catch (error) {
    console.error("ကိတ်အသစ် ထည့်သွင်းရာတွင် အမှား:", error);
    return NextResponse.json(
      { error: "ကိတ်အမျိုးအစားအသစ်ကို Database တွင် သိမ်းဆည်းနိုင်ခြင်း မရှိပါ" },
      { status: 500 }
    );
  }
}