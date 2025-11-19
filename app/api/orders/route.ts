import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import {
  CAKE_CATEGORIES,
  CAKE_SIZES,
  EXTRA_OPTIONS,
  ORDER_STATUSES,
  type CakeCategoryCode,
  type CakeSizeCode,
  type ExtraItemCode,
  type OrderStatusCode,
  computeFees,
} from "@/lib/orderConfig";
import type { OrderRecord } from "@/types/orders";
import { uploadImage } from "@/lib/cloudinary";

const categoryValues = CAKE_CATEGORIES.map((item) => item.value);
const sizeValues = CAKE_SIZES.map((item) => item.value);
const extraValues = EXTRA_OPTIONS.map((item) => item.value);
const statusValues = ORDER_STATUSES;

const isCategory = (value: unknown): value is CakeCategoryCode =>
  typeof value === "string" && categoryValues.includes(value as CakeCategoryCode);

const isSize = (value: unknown): value is CakeSizeCode =>
  typeof value === "string" && sizeValues.includes(value as CakeSizeCode);

const isExtra = (value: unknown): value is ExtraItemCode =>
  typeof value === "string" && extraValues.includes(value as ExtraItemCode);

const isStatus = (value: unknown): value is OrderStatusCode =>
  typeof value === "string" && statusValues.includes(value as OrderStatusCode);

const toOrderRecord = (order:any): OrderRecord => ({
  ...order,
  category: order.category as CakeCategoryCode,
  size: order.size as CakeSizeCode,
  extras: order.extras.filter(isExtra),
  status: order.status as OrderStatusCode,
  createdAt: order.createdAt.toISOString(),
  updatedAt: order.updatedAt.toISOString(),
});

const uploadImageIfProvided = async (
  image: unknown,
  folder: "phoo/orders/cake-sketches" | "phoo/orders/payment-screenshots",
) => {
  if (typeof image !== "string" || image.length === 0) {
    return null;
  }

  const uploadResult = await uploadImage(image, folder);
  return uploadResult.secure_url ?? uploadResult.url;
};

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: [
        { desiredDate: "asc" },
        { desiredTime: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(orders.map(toOrderRecord));
  } catch (error) {
    console.error("Error fetching orders", error);
    return NextResponse.json(
      { message: "မှာယူမှုများ ဆွဲထုတ်ရာတွင် အမှားအယွင်းရှိခဲ့သည်။" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category,
      size,
      customerPhone,
      customerAddress,
      desiredDate,
      desiredTime,
      extras = [],
      cakeSketchImage,
      paymentScreenshot,
      remarks,
    } = body;

    if (
      !customerPhone ||
      !desiredDate ||
      !desiredTime ||
      !isCategory(category) ||
      !isSize(size)
    ) {
      return NextResponse.json(
        { message: "လိုအပ်သော မှတ်တမ်းများ မပြည့်စုံပါ။" },
        { status: 400 },
      );
    }

    const sanitizedExtras = (Array.isArray(extras) ? extras : []).filter(isExtra);
    const fees = computeFees(size, sanitizedExtras);

    const [cakeSketchUrl, paymentScreenshotUrl] = await Promise.all([
      uploadImageIfProvided(cakeSketchImage, "phoo/orders/cake-sketches"),
      uploadImageIfProvided(
        paymentScreenshot,
        "phoo/orders/payment-screenshots",
      ),
    ]);

    const newOrder = await prisma.order.create({
      data: {
        category,
        size,
        customerPhone,
        customerAddress: customerAddress?.toString() ?? null,
        desiredDate,
        desiredTime,
        extras: sanitizedExtras,
        basePrice: fees.basePrice,
        extraFee: fees.extraFee,
        totalAmount: fees.totalAmount,
        cakeSketchImage: cakeSketchUrl,
        paymentScreenshot: paymentScreenshotUrl,
        remarks: remarks?.toString() ?? null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { message: "မှာယူမှုအောင်မြင်ပါပြီ။", orderId: newOrder.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating order", error);
    return NextResponse.json(
      { message: "မှာယူမှု မှတ်တမ်းတင်ရာတွင် အမှားအယွင်းရှိခဲ့သည်။" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, updatedBy } = body;

    if (!id || !isStatus(status)) {
      return NextResponse.json(
        { message: "Order ID နှင့် Status လိုအပ်ပါသည်။" },
        { status: 400 },
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedBy: updatedBy ?? null,
      },
    });

    return NextResponse.json({
      message: "Status အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။",
      order: toOrderRecord(updatedOrder),
    });
  } catch (error) {
    console.error("Error updating order status", error);
    return NextResponse.json(
      { message: "Status ပြောင်းလဲရာတွင် အမှားအယွင်းရှိခဲ့သည်။" },
      { status: 500 },
    );
  }
}

