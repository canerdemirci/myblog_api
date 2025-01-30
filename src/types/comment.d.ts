export type CreateCommentReqBody = { text: string, postId: string, userId: string }
export type UpdateCommentReqBody = { id: string, text: string }