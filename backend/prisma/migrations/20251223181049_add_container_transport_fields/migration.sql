/*
  Warnings:

  - Added the required column `mode` to the `Container` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Container" ADD COLUMN     "contoured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "doorHeight" DOUBLE PRECISION,
ADD COLUMN     "doorWidth" DOUBLE PRECISION,
ADD COLUMN     "isRefrigerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mode" "TransportMode" NOT NULL,
ADD COLUMN     "tareWeight" DOUBLE PRECISION,
ADD COLUMN     "usage" "ContainerUsage" NOT NULL DEFAULT 'COMMON';
