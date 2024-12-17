-- CreateTable
CREATE TABLE "GuestPostInteraction" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "GuestPostInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestPostInteraction_guestId_key" ON "GuestPostInteraction"("guestId");

-- AddForeignKey
ALTER TABLE "GuestPostInteraction" ADD CONSTRAINT "GuestPostInteraction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
