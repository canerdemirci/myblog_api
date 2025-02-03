-- CreateTable
CREATE TABLE "Guests" (
    "ipadress" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Guests_ipadress_key" ON "Guests"("ipadress");
