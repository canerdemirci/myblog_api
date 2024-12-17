-- CreateTable
CREATE TABLE "GuestNoteInteraction" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,

    CONSTRAINT "GuestNoteInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestNoteInteraction_guestId_key" ON "GuestNoteInteraction"("guestId");

-- AddForeignKey
ALTER TABLE "GuestNoteInteraction" ADD CONSTRAINT "GuestNoteInteraction_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
