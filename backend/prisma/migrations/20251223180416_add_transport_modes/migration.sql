-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('SEA', 'AIR', 'ROAD', 'RAIL');

-- CreateEnum
CREATE TYPE "ContainerUsage" AS ENUM ('MOST_COMMON', 'COMMON', 'SPECIALIZED', 'LAST_MILE');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "totalContainers" INTEGER,
ADD COLUMN     "transportMode" "TransportMode";
