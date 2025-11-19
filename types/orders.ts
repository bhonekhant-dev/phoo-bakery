import type {
  CakeCategoryCode,
  CakeSizeCode,
  ExtraItemCode,
  OrderStatusCode,
} from "@/lib/orderConfig";

export interface OrderRecord {
  id: string;
  category: CakeCategoryCode;
  size: CakeSizeCode;
  customerPhone: string;
  customerAddress: string | null;
  desiredDate: string;
  desiredTime: string;
  extras: ExtraItemCode[];
  basePrice: number;
  extraFee: number;
  totalAmount: number;
  status: OrderStatusCode;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  cakeSketchImage: string | null;
  paymentScreenshot: string | null;
  updatedBy: string | null;
}

