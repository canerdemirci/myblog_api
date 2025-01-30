export type CreatePostReqBody = {
    title: string,
    images: string[],
    content?: string,
    description?: string,
    cover?: string,
    tags: string[]
}
export type UpdatePostReqBody = {
    id: string,
    title: string,
    images: string[],
    content?: string,
    description?: string,
    cover?: string,
    tags: string[]
}
export type GetPostsReqQuery = { take?: string, skip?: string, tagId?: string }
export type GetRelatedPostsReqBody = { tags: string[]}
export type AddGuestInteractionReqBody = { type: InteractionType, postId: string, guestId: string }
export type AddUserInteractionReqBody = { type: InteractionType, postId: string, userId: string }
export type GetGuestInteractionReqQuery = { type: string, guestId: string, postId: string}
export type GetUserInteractionReqQuery = { type: string, userId: string, postId: string}