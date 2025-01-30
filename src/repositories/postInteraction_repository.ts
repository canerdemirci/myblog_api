/**
 * @module
 * @class PostInteractionRepository
 * This repository used for post interactions.
 */

import prismaClient from "../utils/prismaClient"

import CreateGuestPostInteractionDTO from "../dtos/postInteraction/CreateGuestPostInteractionDTO"
import CreatePostInteractionDTO from "../dtos/postInteraction/CreatePostInteractionDTO"
import CreateUserPostInteractionDTO from "../dtos/postInteraction/CreateUserPostInteractionDTO"
import GuestPostInteractionDTO from "../dtos/postInteraction/GuestPostInteractionDTO"
import UserPostInteractionDTO from "../dtos/postInteraction/UserPostInteractionDTO"

import { InteractionType, Role } from "@prisma/client"

export default class PostInteractionRepository {
    /**
     ** Creates post interaction and increases post's like, view or share counts. (by transaction)
     ** If the interaction is UNLIKE it finds the like belongs to user or guest
     * and deletes then decrements like count of the post (by using transaction - same time).
     ** If there was a LIKE or VIEW belongs to user or guest it doesn't do anything because
     * it prevents multiple like or view that belongs a user or guest.
     * @param createPostInteractionDTO CreatePostInteractionDTO
     * @returns Promise < void >
     * @throws Error
     */
    private async createInteraction(
        createPostInteractionDTO: CreatePostInteractionDTO) : Promise<void>
    {
        if (createPostInteractionDTO.type === InteractionType.UNLIKE) {
            const existing = await prismaClient.postInteraction.findFirst({
                where: {
                    postId: createPostInteractionDTO.postId,
                    type: InteractionType.LIKE,
                    ...(createPostInteractionDTO.role === Role.GUEST &&
                        { guestId: createPostInteractionDTO.guestId }),
                    ...(createPostInteractionDTO.role === Role.USER &&
                        { userId: createPostInteractionDTO.userId }),
                }
            })

            await prismaClient.$transaction(async (tx) => {
                await tx.postInteraction.delete({
                    where: {
                        id: existing?.id,
                    }
                })

                await tx.post.update({
                    where: {
                        id: createPostInteractionDTO.postId
                    },
                    data: {
                        likeCount: { decrement: 1 }
                    }
                })
            })

            return
        }

        if (createPostInteractionDTO.type === InteractionType.LIKE
            || createPostInteractionDTO.type === InteractionType.VIEW)
        {
            const existing = await prismaClient.postInteraction.findFirst({
                where: {
                    postId: createPostInteractionDTO.postId,
                    type: createPostInteractionDTO.type,
                    ...(createPostInteractionDTO.role === Role.GUEST &&
                        { guestId: createPostInteractionDTO.guestId }),
                    ...(createPostInteractionDTO.role === Role.USER &&
                        { userId: createPostInteractionDTO.userId }),
                }
            })

            if (existing) return
        }

        await prismaClient.$transaction(async (tx) => {
            await tx.postInteraction.create({
                data: {
                    role: createPostInteractionDTO.role,
                    type: createPostInteractionDTO.type,
                    postId: createPostInteractionDTO.postId,
                    ...(createPostInteractionDTO.role === Role.GUEST &&
                        { guestId: createPostInteractionDTO.guestId }),
                    ...(createPostInteractionDTO.role === Role.USER &&
                        { userId: createPostInteractionDTO.userId }),
                }
            })

            await tx.post.update({
                where: {
                    id: createPostInteractionDTO.postId
                },
                data: {
                    ...(createPostInteractionDTO.type === InteractionType.LIKE &&
                        { likeCount : { increment: 1 } }),
                    ...(createPostInteractionDTO.type === InteractionType.VIEW &&
                        { viewCount : { increment: 1 } }),
                    ...(createPostInteractionDTO.type === InteractionType.SHARE &&
                        { shareCount : { increment: 1 } }),
                }
            })
        })
    }
    
    /**
     ** Creates post interaction for a guest and increases post's like, view or share counts.
     * (by transaction) 
     * @param createGuestPostInteractionDTO CreateGuestPostInteractionDTO
     * @returns Promise < void >
     * @throws Error
     */
    async createGuestInteraction(
        createGuestPostInteractionDTO: CreateGuestPostInteractionDTO) : Promise<void>
    {
        await this.createInteraction(new CreatePostInteractionDTO(
            createGuestPostInteractionDTO.role,
            createGuestPostInteractionDTO.type,
            createGuestPostInteractionDTO.postId,
            createGuestPostInteractionDTO.guestId,
            undefined
        ))
    }

    /**
     ** Creates post interaction for a user and increases post's like, view or share counts.
     * (by transaction) 
     * @param createUserPostInteractionDTO CreateUserPostInteractionDTO
     * @returns Promise < void >
     * @throws Error
     */
    async createUserInteraction(
        createUserPostInteractionDTO: CreateUserPostInteractionDTO) : Promise<void>
    {
        await this.createInteraction(new CreatePostInteractionDTO(
            createUserPostInteractionDTO.role,
            createUserPostInteractionDTO.type,
            createUserPostInteractionDTO.postId,
            undefined,
            createUserPostInteractionDTO.userId
        ))
    }

    /**
     * Retrievies post interactions belgons to the guest by the type.
     * @param type InteractionType - 'VIEW' | 'LIKE' | 'UNLIKE' | 'SHARE' 
     * @param guestId string
     * @param postId string
     * @returns Promise < GuestPostInteractionDTO[] >
     * @throws Error
     */
    async getGuestInteractions(
        type: InteractionType,
        guestId: string,
        postId: string) : Promise<GuestPostInteractionDTO[]>
    {
        const interactions = await prismaClient.postInteraction.findMany({
            where: {
                role: Role.GUEST,
                postId: postId,
                guestId: guestId,
                type: type,
            }
        })

        return interactions.map(i => new GuestPostInteractionDTO(
            i.id,
            i.type,
            i.postId,
            i.guestId!
        ))
    }

    /**
     * Retrievies post interactions belgons to the user by the type.
     * @param type InteractionType - 'VIEW' | 'LIKE' | 'UNLIKE' | 'SHARE' 
     * @param userId string
     * @param postId string
     * @returns Promise < UserPostInteractionDTO[] >
     * @throws Error
     */
    async getUserInteractions(
        type: InteractionType,
        userId: string,
        postId: string) : Promise<UserPostInteractionDTO[]>
    {
        const interactions = await prismaClient.postInteraction.findMany({
            where: {
                role: Role.USER,
                postId: postId,
                userId: userId,
                type: type,
            }
        })

        return interactions.map(i => new UserPostInteractionDTO(
            i.id,
            i.type,
            i.postId,
            i.userId!
        ))
    }
}