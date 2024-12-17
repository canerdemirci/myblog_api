/*
  Warnings:

  - You are about to drop the `GuestNoteInteraction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuestPostInteraction` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'USER');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('LIKE', 'SHARE', 'VIEW');

-- DropForeignKey
ALTER TABLE "GuestNoteInteraction" DROP CONSTRAINT "GuestNoteInteraction_noteId_fkey";

-- DropForeignKey
ALTER TABLE "GuestPostInteraction" DROP CONSTRAINT "GuestPostInteraction_postId_fkey";

-- DropTable
DROP TABLE "GuestNoteInteraction";

-- DropTable
DROP TABLE "GuestPostInteraction";

-- CreateTable
CREATE TABLE "PostInteraction" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "guestId" TEXT,
    "userId" TEXT,
    "type" "InteractionType" NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "PostInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteInteraction" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "guestId" TEXT,
    "userId" TEXT,
    "type" "InteractionType" NOT NULL,
    "noteId" TEXT NOT NULL,

    CONSTRAINT "NoteInteraction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostInteraction" ADD CONSTRAINT "PostInteraction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteInteraction" ADD CONSTRAINT "NoteInteraction_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
