"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Fragment,
} from "react";
import Image from "next/image";

import {
  CAKE_CATEGORIES,
  CAKE_SIZES,
  EXTRA_OPTIONS,
  ORDER_STATUSES,
  computeFees,
  formatEnumLabel,
  type CakeCategoryCode,
  type CakeSizeCode,
  type ExtraItemCode,
  type OrderStatusCode,
  EXTRA_PRICE_TABLE,
} from "@/lib/orderConfig";
import type { OrderRecord } from "@/types/orders";

interface NewOrderInput {
  category: CakeCategoryCode;
  size: CakeSizeCode;
  customerPhone: string;
  customerAddress: string;
  desiredDate: string;
  desiredTime: string;
  extras: ExtraItemCode[];
  remarks: string;
  cakeSketchImage: string | null;
  paymentScreenshot: string | null;
}

const createDefaultForm = (): NewOrderInput => ({
  category: "VANILLA",
  size: "SIX_INCH",
  customerPhone: "",
  customerAddress: "",
  desiredDate: "",
  desiredTime: "10:00",
  extras: [],
  remarks: "",
  cakeSketchImage: null,
  paymentScreenshot: null,
});

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const formatDateLabel = (dateValue: string) => {
  if (!dateValue) {
    return "ရက်စွဲ မသတ်မှတ်ရသေးပါ";
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }
  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const useOrders = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error(
          "API မှ မှာယူမှုများ ဆွဲထုတ်ရာတွင် အမှားအယွင်းရှိခဲ့ပါသည်။",
        );
      }
      const data: OrderRecord[] = await response.json();
      setOrders(data);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Order များ ဆွဲထုတ်ရာတွင် ပြဿနာရှိသည်။";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return { orders, loading, error, fetchOrders };
};

const OrderForm = () => {
  const [form, setForm] = useState<NewOrderInput>(() => createDefaultForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const fees = useMemo(
    () => computeFees(form.size, form.extras),
    [form.size, form.extras],
  );

  const handleSelectChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
  
    // 1. Check if it's an HTMLInputElement AND a checkbox
    if (
      e.target instanceof HTMLInputElement && // Type guard: narrows e.target to HTMLInputElement
      e.target.type === "checkbox" &&      // Checks the type is 'checkbox'
      name === "extras"                     // Your existing logic check
    ) {
      // TypeScript now knows e.target is an HTMLInputElement, and since the
      // type is 'checkbox', it knows 'checked' exists.
      const { checked } = e.target;
  
      setForm((prev) => ({
        ...prev,
        extras: checked
          ? [...prev.extras, value as ExtraItemCode]
          : prev.extras.filter((extra) => extra !== value),
      }));
      return;
    }
  
    // Handle Select/Text/other Input changes
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "cakeSketchImage" | "paymentScreenshot",
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        text: "ဖိုင်အရွယ်အစား ကြီးလွန်းပါသည်။ (5MB အောက်သာ တင်ပါ)",
        type: "error",
      });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setForm((prev) => ({ ...prev, [field]: base64 }));
      setMessage(null);
    } catch {
      setMessage({
        text: "ပုံတင်ရာတွင် အမှားအယွင်းရှိခဲ့သည်။",
        type: "error",
      });
      setForm((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      form.customerPhone.trim().length < 5 ||
      !form.desiredDate ||
      !form.size ||
      !form.category
    ) {
      setMessage({
        text: "လိုအပ်သော အချက်အလက်များကို ဖြည့်စွက်ပါ။",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });

      if (!response.ok) {
        throw new Error("Server error during submission.");
      }

      setMessage({
        text: "မှာယူမှုအောင်မြင်ပါပြီ။ သိပ်မကြာခင် ဆက်သွယ်ပါမယ်။",
        type: "success",
      });
      setForm(createDefaultForm());
    } catch (error) {
      console.error("Order Submission Error:", error);
      setMessage({
        text: "မှာယူမှု မှတ်တမ်းတင်ရာတွင် အမှားအယွင်းရှိခဲ့သည်။",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const MessageDisplay = () => {
    if (!message) return null;
    let baseClasses =
      "p-3 rounded-xl font-medium mb-4 transition-all duration-300";
    if (message.type === "success") {
      baseClasses += " bg-green-100 text-green-800 border border-green-300";
    }
    if (message.type === "error") {
      baseClasses += " bg-red-100 text-red-800 border border-red-300";
    }
    if (message.type === "info") {
      baseClasses += " bg-blue-100 text-blue-800 border border-blue-300";
    }

    return <div className={baseClasses}>{message.text}</div>;
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto">
      <h2 className="text-2xl font-bold text-green-600 mb-6 text-center border-b pb-3">
        🎂 ကိတ်မှာယူမှု ဖောင်
      </h2>
      <MessageDisplay />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label
            htmlFor="category"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            ကိတ်အမျိုးအစား (Category)
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleSelectChange}
            className="p-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition"
          >
            {CAKE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="size"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            ကိတ်အရွယ်အစား (Size)
          </label>
          <select
            id="size"
            name="size"
            value={form.size}
            onChange={handleSelectChange}
            className="p-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition"
          >
            {CAKE_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">
            အပိုပစ္စည်းများ (Extra Fees)
          </h3>
          {EXTRA_OPTIONS.map((extra) => (
            <div
              key={extra.value}
              className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
            >
              <label
                htmlFor={extra.value}
                className="text-sm text-gray-800 cursor-pointer flex-grow"
              >
                {extra.label} (+{EXTRA_PRICE_TABLE[extra.value].toLocaleString()}{" "}
                ကျပ်)
              </label>
              <input
                type="checkbox"
                id={extra.value}
                name="extras"
                value={extra.value}
                checked={form.extras.includes(extra.value)}
                onChange={handleSelectChange}
                className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            ဖုန်းနံပါတ် (Phone No.) *
          </label>
          <input
            type="tel"
            id="phone"
            name="customerPhone"
            value={form.customerPhone}
            onChange={handleSelectChange}
            required
            placeholder="09..."
            className="p-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="address"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            လိပ်စာ (Delivery Address) - Optional
          </label>
          <textarea
            id="address"
            name="customerAddress"
            value={form.customerAddress}
            onChange={handleSelectChange}
            rows={3}
            placeholder="အိမ်နံပါတ်၊ လမ်း၊ မြို့..."
            className="p-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 resize-none"
          ></textarea>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex flex-col flex-1">
            <label
              htmlFor="date"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              လိုချင်သည့် ရက်စွဲ *
            </label>
            <input
              type="date"
              id="date"
              name="desiredDate"
              value={form.desiredDate}
              onChange={handleSelectChange}
              required
              className="p-3 border text-gray-700 placeholder:text-gray-500 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex flex-col flex-1">
            <label
              htmlFor="time"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              လိုချင်သည့် အချိန်
            </label>
            <input
              type="time"
              id="time"
              name="desiredTime"
              value={form.desiredTime}
              onChange={handleSelectChange}
              className="p-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col">
            <label
              htmlFor="cakeSketch"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              ကိတ်ပုံစံ (Simple Cake Image)
            </label>
            <input
              type="file"
              id="cakeSketch"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "cakeSketchImage")}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
            />
            {form.cakeSketchImage && (
              <p className="text-xs text-green-600 mt-1">
                ပုံစံပုံ တင်ပြီးပါပြီ။
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="paymentSS"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              ငွေလွှဲပြေစာ (Payment Screenshot)
            </label>
            <input
              type="file"
              id="paymentSS"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "paymentScreenshot")}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
            />
            {form.paymentScreenshot && (
              <p className="text-xs text-green-600 mt-1">
                ငွေလွှဲပြေစာ တင်ပြီးပါပြီ။
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="remarks"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            အထူးအကြံပြုချက်များ (Remarks) - Optional
          </label>
          <textarea
            id="remarks"
            name="remarks"
            value={form.remarks}
            onChange={handleSelectChange}
            rows={3}
            placeholder="ဖန်ရွက်ပေါ်တွင် စာရေးပေးရန်၊ အရောင်သတ်မှတ်ချက်များ ..."
            className="p-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 resize-none"
          ></textarea>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-xl flex justify-between items-center">
          <span className="text-lg font-bold text-gray-800">
            စုစုပေါင်း (Total):
          </span>
          <span className="text-2xl font-extrabold text-green-600">
            {fees.totalAmount.toLocaleString()} ကျပ်
          </span>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-2 rounded-xl font-bold transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "မှာယူနေသည်..." : "မှာယူရန် (Place Order)"}
        </button>
      </form>
    </div>
  );
};

const StatusBadge = ({ status }: { status: OrderStatusCode }) => {
  const colorMap: Record<OrderStatusCode, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 ring-yellow-500/20",
    CONFIRMED: "bg-blue-100 text-blue-800 ring-blue-500/20",
    PROCESSING: "bg-indigo-100 text-indigo-800 ring-indigo-500/20",
    DONE: "bg-green-100 text-green-800 ring-green-500/20",
    CANCELLED: "bg-red-100 text-red-800 ring-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${colorMap[status]}`}
    >
      {status}
    </span>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-100">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-900 text-right">
      {value}
    </span>
  </div>
);

const OrderDetailsModal = ({
  order,
  onClose,
  onStatusUpdate,
}: {
  order: OrderRecord;
  onClose: () => void;
  onStatusUpdate: (id: string, newStatus: OrderStatusCode) => Promise<void>;
}) => {
  const [newStatus, setNewStatus] = useState<OrderStatusCode>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const isDataUri = (value: string) => value.startsWith("data:");

  const handleStatusChange = async () => {
    if (newStatus === order.status) {
      onClose();
      return;
    }
    setIsUpdating(true);
    await onStatusUpdate(order.id, newStatus);
    setIsUpdating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-green-600 border-b pb-3 mb-4">
              Order No:{" "}
              <span className="text-gray-800">{order.id.substring(0, 10)}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <DetailItem label="ဖုန်းနံပါတ်" value={order.customerPhone} />
              {order.customerAddress && (
                <DetailItem label="လိပ်စာ" value={order.customerAddress} />
              )}
              <DetailItem
                label="လိုချင်သည့်ရက်/အချိန်"
                value={`${order.desiredDate} @ ${order.desiredTime}`}
              />
              <DetailItem
                label="ကိတ်အမျိုးအစား"
                value={formatEnumLabel(order.category)}
              />
              <DetailItem
                label="အရွယ်အစား"
                value={formatEnumLabel(order.size)}
              />
              <DetailItem
                label="အခြေခံစျေးနှုန်း"
                value={`${order.basePrice.toLocaleString()} ကျပ်`}
              />
              <DetailItem
                label="အပိုကြေး"
                value={`${order.extraFee.toLocaleString()} ကျပ်`}
              />
            </div>
          </div>

          {order.remarks && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-700 mb-1">
                အထူးအကြံပြုချက်များ (Customer Remarks)
              </p>
              <p className="text-sm text-gray-800 whitespace-pre-line">
                {order.remarks}
              </p>
            </div>
          )}

          <DetailItem
            label="စုစုပေါင်း (Total)"
            value={
              <span className="text-green-600 text-xl font-extrabold">
                {order.totalAmount.toLocaleString()} ကျပ်
              </span>
            }
          />

          <div className="mt-6 border-t pt-4">
            <h4 className="text-lg font-bold text-gray-700 mb-2">
              ရွေးချယ်ထားသော Extra များ:
            </h4>
            <div className="flex flex-wrap gap-2">
              {order.extras.length > 0 ? (
                order.extras.map((extra) => (
                  <span
                    key={extra}
                    className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full"
                  >
                    {formatEnumLabel(extra)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">
                  အပိုပစ္စည်းများ မပါဝင်ပါ။
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                ကိတ်ပုံစံ (Sketch Image)
              </h4>
              {order.cakeSketchImage ? (
                <Image
                  src={order.cakeSketchImage}
                  alt="Cake Sketch"
                  width={640}
                  height={480}
                  className="rounded-lg w-full h-auto max-h-60 object-contain border p-1"
                  unoptimized={isDataUri(order.cakeSketchImage)}
                />
              ) : (
                <div className="text-xs text-gray-500 text-center py-4 border rounded-lg">
                  ပုံစံပုံ တင်ထားခြင်းမရှိပါ။
                </div>
              )}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                ငွေလွှဲပြေစာ (Payment Proof)
              </h4>
              {order.paymentScreenshot ? (
                <Image
                  src={order.paymentScreenshot}
                  alt="Payment Screenshot"
                  width={640}
                  height={480}
                  className="rounded-lg w-full h-auto max-h-60 object-contain border p-1"
                  unoptimized={isDataUri(order.paymentScreenshot)}
                />
              ) : (
                <div className="text-xs text-gray-500 text-center py-4 border rounded-lg">
                  ငွေလွှဲပြေစာ တင်ထားခြင်းမရှိပါ။
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-md font-bold text-gray-700">
                Order Status:
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatusCode)}
                className="p-2 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500"
                disabled={isUpdating}
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleStatusChange}
              className="px-6 py-2 rounded-xl font-bold transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              disabled={isUpdating}
            >
              {isUpdating ? "အပ်ဒိတ်လုပ်နေသည်..." : "Status အပ်ဒိတ်"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  color,
  text,
}: {
  title: string;
  value: string | number;
  color: string;
  text: string;
}) => (
  <div className={`p-5 rounded-2xl shadow-md ${color}`}>
    <p className={`text-sm font-medium ${text}`}>{title}</p>
    <p className={`text-3xl font-extrabold mt-1 ${text}`}>{value}</p>
  </div>
);

const OrderManagementSystem = ({
  orders,
  loading,
  error,
  fetchOrders,
}: ReturnType<typeof useOrders>) => {
  const [filterStatus, setFilterStatus] =
    useState<OrderStatusCode | "ALL">("PENDING");
  const [showModal, setShowModal] = useState<OrderRecord | null>(null);

  const updateOrderStatus = useCallback(
    async (id: string, newStatus: OrderStatusCode) => {
      try {
        const response = await fetch("/api/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            status: newStatus,
            updatedBy: "Staff_User_ID",
          }),
        });

        if (!response.ok) {
          throw new Error("Status ပြောင်းလဲရာတွင် server error ရှိခဲ့သည်။");
        }

        fetchOrders();
      } catch (err) {
        console.error(err);
        alert("Status update failed. Check console for details.");
      }
    },
    [fetchOrders],
  );

  const filteredOrders = useMemo(() => {
    if (filterStatus === "ALL") {
      return orders;
    }
    return orders.filter((order) => order.status === filterStatus);
  }, [orders, filterStatus]);

  const groupedOrders = useMemo(() => {
    if (filteredOrders.length === 0) {
      return [];
    }
    const groups = filteredOrders.reduce(
      (acc, order) => {
        const key = order.desiredDate || "UNSCHEDULED";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(order);
        return acc;
      },
      {} as Record<string, OrderRecord[]>,
    );

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, groupOrders]) => ({
        dateKey,
        label:
          dateKey === "UNSCHEDULED"
            ? "ရက်စွဲ မသတ်မှတ်ရသေးပါ"
            : formatDateLabel(dateKey),
        orders: groupOrders.sort((a, b) =>
          `${a.desiredTime}${a.createdAt}`.localeCompare(
            `${b.desiredTime}${b.createdAt}`,
          ),
        ),
      }));
  }, [filteredOrders]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
      done: orders.filter((o) => o.status === "DONE").length,
      totalSales: orders.reduce(
        (sum, o) => sum + (o.status === "DONE" ? o.totalAmount : 0),
        0,
      ),
    }),
    [orders],
  );

  if (loading) {
    return (
      <div className="text-center p-12 text-green-600 font-semibold text-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
        Order များ ဆွဲထုတ်နေသည်...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-100 text-red-700 rounded-xl mt-8">
        <p>Database Connection Error: {error}</p>
        <p className="mt-2 text-sm">
          Prisma Migration လုပ်ထားခြင်း သို့မဟုတ် `.env` ထဲတွင် `DATABASE_URL`
          မှန်ကန်စွာ ထည့်သွင်းထားခြင်း မရှိနိုင်ပါ။
        </p>
      </div>
    );
  }

  return (
    <Fragment>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
        Order စီမံခန့်ခွဲမှု Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="စုစုပေါင်း Order"
          value={stats.total}
          color="bg-indigo-100"
          text="text-indigo-800"
        />
        <StatCard
          title="စောင့်ဆိုင်းဆဲ (Pending)"
          value={stats.pending}
          color="bg-yellow-100"
          text="text-yellow-800"
        />
        <StatCard
          title="အတည်ပြုပြီး (Confirmed)"
          value={stats.confirmed}
          color="bg-blue-100"
          text="text-blue-800"
        />
        <StatCard
          title="ပြီးစီး (Done) ရောင်းရငွေ"
          value={`${stats.totalSales.toLocaleString()} ကျပ်`}
          color="bg-green-100"
          text="text-green-800"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-lg font-semibold text-gray-700">
          Status ဖြင့် စစ်ထုတ်ရန်:
        </span>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as OrderStatusCode | "ALL")
          }
          className="p-2 border border-gray-300 rounded-xl bg-white focus:ring-green-500 focus:border-green-500 shadow-sm"
        >
          <option value="ALL">အားလုံး (All)</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          onClick={fetchOrders}
          className="bg-gray-100 text-gray-700 p-2 rounded-xl hover:bg-gray-200 transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m15.356-2H15V4"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 20v-5h-.581m-15.357-2a8.001 8.001 0 0014.15-2.218l.195-.494"
            ></path>
          </svg>
        </button>
      </div>

      {groupedOrders.length > 0 ? (
        groupedOrders.map(({ dateKey, label, orders: ordersForDate }) => (
          <section key={dateKey} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-800">{label}</h3>
              <span className="text-sm text-gray-500">
                {ordersForDate.length} orders
              </span>
            </div>
            <div className="shadow-lg overflow-hidden border border-gray-200 sm:rounded-2xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ဖုန်းနံပါတ်
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ကိတ်အမျိုးအစား/Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      အချိန်
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      စုစုပေါင်း
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordersForDate.map((order) => (
                    <tr
                      key={order.id}
                      className="bg-white hover:bg-green-50 transition duration-150 cursor-pointer border-b"
                      onClick={() => setShowModal(order)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerPhone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {`${formatEnumLabel(order.category)} (${formatEnumLabel(order.size)})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.desiredTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        {order.totalAmount.toLocaleString()} ကျပ်
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      ) : (
        <div className="px-6 py-12 text-center text-gray-500 font-medium border border-dashed border-gray-300 rounded-2xl">
          ယခု Status ဖြင့် Order မရှိပါ။
        </div>
      )}

      {showModal && (
        <OrderDetailsModal
          order={showModal}
          onClose={() => setShowModal(null)}
          onStatusUpdate={updateOrderStatus}
        />
      )}
    </Fragment>
  );
};

const Page = () => {
  const [view, setView] = useState<"order" | "oms">("oms");
  const orderHooks = useOrders();

  return (
    <div className="min-h-screen bg-gray-50 font-[Inter]">
      <div className="p-4 bg-gray-600 shadow-xl">
        <h1 className="text-3xl font-extrabold text-white mb-6 text-center shadow-lg p-2 rounded-lg bg-green-700/80 backdrop-blur-sm">
          PHOO BAKERY
        </h1>
        <div className="flex justify-center flex-wrap gap-4">
  <button
    onClick={() => setView("oms")}
    className={`w-40 px-6 py-2 rounded-xl font-bold transition duration-300 bg-white/90 text-green-600 border border-white hover:bg-white ${
      view === "oms" ? "shadow-lg border-2 border-green-800" : ""
    }`}
  >
    Dashboard
  </button>

  <button
    onClick={() => setView("order")}
    className={`w-40 px-6 py-2 rounded-xl font-bold transition duration-300 bg-white/90 text-green-600 border border-white hover:bg-white ${
      view === "order" ? "shadow-lg border-2 border-green-800" : ""
    }`}
  >
    ကိတ်မှာယူမှု
  </button>
</div>

      </div>

      <main className="container mx-auto py-8 px-4">
        {view === "order" && <OrderForm />}
        {view === "oms" && <OrderManagementSystem {...orderHooks} />}
      </main>
    </div>
  );
};

export default Page;

