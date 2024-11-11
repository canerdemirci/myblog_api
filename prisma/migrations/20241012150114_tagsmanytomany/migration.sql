/*
  Warnings:

  - You are about to drop the column `post_id` on the `Tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_post_id_fkey";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "post_id";

-- CreateTable
CREATE TABLE "PostsAndTags" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PostsAndTags_pkey" PRIMARY KEY ("postId","tagId")
);

-- AddForeignKey
ALTER TABLE "PostsAndTags" ADD CONSTRAINT "PostsAndTags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostsAndTags" ADD CONSTRAINT "PostsAndTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
