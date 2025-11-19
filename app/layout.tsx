import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phoo Bakery Order System",
  description:
    "Customer ordering form and staff dashboard for Phoo Bakery orders.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="my">
    <body>{children}</body>
  </html>
);

export default RootLayout;

