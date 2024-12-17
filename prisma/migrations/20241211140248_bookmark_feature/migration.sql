/*
  Warnings:

  - You are about to drop the `GuestBookmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserBookmark` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GuestBookmark" DROP CONSTRAINT "GuestBookmark_postId_fkey";

-- DropForeignKey
ALTER TABLE "UserBookmark" DROP CONSTRAINT "UserBookmark_postId_fkey";

-- DropForeignKey
ALTER TABLE "UserBookmark" DROP CONSTRAINT "UserBookmark_userId_fkey";

-- DropTable
DROP TABLE "GuestBookmark";

-- DropTable
DROP TABLE "UserBookmark";

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "guestId" TEXT,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
