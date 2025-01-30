/**
 * @module
 * @class BookmarkRepository
 * This repository used for crud operations at bookmarks.
 */

import prismaClient from "../utils/prismaClient"

import CreateGuestBookmarkDTO from "../dtos/bookmark/CreateGuestBookmarkDTO"
import GuestBookmarkDTO from "../dtos/bookmark/GuestBookmarkDTO"
import CreateUserBookmarkDTO from "../dtos/bookmark/CreateUserBookmarkDTO"
import UserBookmarkDTO from "../dtos/bookmark/UserBookmarkDTO"

import { Role } from "@prisma/client"

export default class BookmarkRepository {
    /**
     * Creates a guest bookmark with related post and guest.
     * @param createGuestBookmarkDTO CreateGuestBookmarkDTO
     * @throws Error
     * @returns Promise < GuestBookmarkDTO >
     */
    async createGuestBookmark(
        createGuestBookmarkDTO: CreateGuestBookmarkDTO): Promise<GuestBookmarkDTO>
    {
        const result = await prismaClient.bookmark.create({
            data: {
                role: Role.GUEST,
                postId: createGuestBookmarkDTO.postId,
                guestId: createGuestBookmarkDTO.guestId,
                userId: undefined,
            }
        })

        return GuestBookmarkDTO.fromDB(result)
    }

    /**
     * Creates an user bookmark with related post and guest.
     * @param createUserBookmarkDTO CreateUserBookmarkDTO
     * @throws Error
     * @returns Promise < UserBookmarkDTO >
     */
    async createUserBookmark(
        createUserBookmarkDTO: CreateUserBookmarkDTO): Promise<UserBookmarkDTO>
    {
        const result = await prismaClient.bookmark.create({
            data: {
                role: Role.USER,
                postId: createUserBookmarkDTO.postId,
                guestId: undefined,
                userId: createUserBookmarkDTO.userId,
            }
        })

        return UserBookmarkDTO.fromDB(result)
    }

    /**
     * Fetches all user bookmarks.
     * @param userId string
     * @throws Error
     * @returns Promise < UserBookmarkDTO[] >
     */
    async getUserBookmarks(userId: string): Promise<UserBookmarkDTO[]> {
        const bookmarks = await prismaClient.bookmark.findMany({
            include: {
                post: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            where: {
                userId: userId,
            },
        })

        return bookmarks.map(b => UserBookmarkDTO.fromDB(b))
    }

    /**
     * Fetches all guest bookmarks.
     * @param guestId string
     * @throws Error
     * @returns Promise < GuestBookmarkDTO[] >
     */
    async getGuestBookmarks(guestId: string): Promise<GuestBookmarkDTO[]> {
        const bookmarks = await prismaClient.bookmark.findMany({
            include: {
                post: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            where: {
                guestId: guestId,
            },
        })

        return bookmarks.map(b => GuestBookmarkDTO.fromDB(b))
    }

    /**
     * Fetches a guest bookmark by postId and guestId
     * @param postId string
     * @param guestId string
     * @throws Error
     * @returns Promise < GuestBookmarkDTO >
     */
    async getGuestBookmark(postId: string, guestId: string) : Promise<GuestBookmarkDTO> {
        const result = await prismaClient.bookmark.findFirstOrThrow({
            where: { postId: postId, guestId: guestId }
        })

        return new GuestBookmarkDTO(result.id, result.postId, result.guestId!)
    }

    /**
     * Fetches a user bookmark by postId and userId
     * @param postId string
     * @param userId string
     * @throws Error
     * @returns Promise < UserBookmarkDTO >
     */
    async getUserBookmark(postId: string, userId: string) : Promise<UserBookmarkDTO> {
        const result = await prismaClient.bookmark.findFirstOrThrow({
            where: { postId: postId, userId: userId }
        })

        return new UserBookmarkDTO(result.id, result.postId, result.userId!)
    }

    /**
     * Deletes a bookmark.
     * @param id string
     * @throws Error
     * @returns Promise < void >
     */
    async deleteBookmark(id: string): Promise<void> {
        await prismaClient.bookmark.delete({ where: { id: id } })
    }
}