export type GetUserEmailAndPasswordReqQuery = { email: string, password: string }
export type CreateUserReqBody = {
    email: string,
    name?: string,
    image?: string,
    password?: string,
    provider?: string,
    providerId?: string
}
export type UpdateUserReqBody = { id: string, image?: string, name?: string }