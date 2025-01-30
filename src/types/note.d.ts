export type CreateNoteReqBody = { content: string, images: string[] }
export type AddGuestInteractionReqBody = { type: InteractionType, noteId: string, guestId: string }
export type AddUserInteractionReqBody = { type: InteractionType, noteId: string, userId: string }
export type GetGuestInteractionReqQuery = { type: string, guestId: string, noteId: string}
export type GetUserInteractionReqQuery = { type: string, userId: string, noteId: string}