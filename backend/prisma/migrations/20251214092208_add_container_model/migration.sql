-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "allowRotation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "containerId" TEXT,
ADD COLUMN     "customHeight" DOUBLE PRECISION,
ADD COLUMN     "customLength" DOUBLE PRECISION,
ADD COLUMN     "customMaxWeight" DOUBLE PRECISION,
ADD COLUMN     "customWidth" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Container" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Container_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Container_code_key" ON "Container"("code");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE SET NULL ON UPDATE CASCADE;
