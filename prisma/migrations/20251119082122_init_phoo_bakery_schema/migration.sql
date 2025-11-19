/*
  Warnings:

  - You are about to drop the `Cake` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SaleRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CakeCategory" AS ENUM ('VANILLA', 'CHOCOLATE', 'RED_VELVET', 'COCONUT', 'THAI_TEA', 'CHEESE_LAVA', 'RAINBOW_CREPE');

-- CreateEnum
CREATE TYPE "CakeSize" AS ENUM ('SIX_INCH', 'SEVEN_INCH', 'EIGHT_INCH', 'NINE_INCH', 'TEN_INCH', 'TWELVE_INCH', 'FOURTEEN_INCH');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'DONE', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "SaleRecord" DROP CONSTRAINT "SaleRecord_cakeId_fkey";

-- DropTable
DROP TABLE "Cake";

-- DropTable
DROP TABLE "SaleRecord";

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "desiredDate" TEXT NOT NULL,
    "desiredTime" TEXT NOT NULL,
    "category" "CakeCategory" NOT NULL,
    "size" "CakeSize" NOT NULL,
    "extras" TEXT[],
    "basePrice" INTEGER NOT NULL,
    "extraFee" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "updatedBy" TEXT,
    "remarks" TEXT,
    "cakeSketchImage" TEXT,
    "paymentScreenshot" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_customerPhone_idx" ON "Order"("customerPhone");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");
