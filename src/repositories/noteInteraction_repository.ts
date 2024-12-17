/**
 * @module noteInteractionRepository
 * This repository used for note interactions.
 */

import CreateGuestNoteInteractionDTO from "../dtos/noteInteraction/CreateGuestNoteInteractionDTO"
import CreateNoteInteractionDTO from "../dtos/noteInteraction/CreateNoteInteractionDTO"
import CreateUserNoteInteractionDTO from "../dtos/noteInteraction/CreateUserNoteInteractionDTO"
import GuestNoteInteractionDTO from "../dtos/noteInteraction/GuestNoteInteractionDTO"
import UserNoteInteractionDTO from "../dtos/noteInteraction/UserNoteInteractionDTO"
import prismaClient from "../utils/prismaClient"
import { InteractionType, Role } from "@prisma/client"

export default class NoteInteractionRepository {
    /**
     ** Creates note interaction and increases note's like, view or share counts. (by transaction)
     ** If the interaction is UNLIKE it finds the like belongs to user or guest
     * and deletes then decrements like count of the note (by using transaction - same time).
     ** If there was a LIKE or VIEW belongs to user or guest it doesn't do anything because
     * it prevents multiple like or view that belongs a user or guest.
     * @param createNoteInteractionDTO CreateNoteInteractionDTO
     * @returns Promise <void>
     * @throws Error
     */
    private async createInteraction(createNoteInteractionDTO: CreateNoteInteractionDTO)
        : Promise<void>
    {
        if (createNoteInteractionDTO.type === InteractionType.UNLIKE) {
            const existing = await prismaClient.noteInteraction.findFirst({
                where: {
                    noteId: createNoteInteractionDTO.noteId,
                    type: InteractionType.LIKE,
                    ...(createNoteInteractionDTO.role === Role.GUEST &&
                        { guestId: createNoteInteractionDTO.guestId }),
                    ...(createNoteInteractionDTO.role === Role.USER &&
                        { userId: createNoteInteractionDTO.userId }),
                }
            })

            await prismaClient.$transaction(async (tx) => {
                await tx.noteInteraction.delete({
                    where: {
                        id: existing?.id,
                    }
                })

                await tx.note.update({
                    where: {
                        id: createNoteInteractionDTO.noteId
                    },
                    data: {
                        likeCount: { decrement: 1 }
                    }
                })
            })

            return
        }

        if (createNoteInteractionDTO.type === InteractionType.LIKE
            || createNoteInteractionDTO.type === InteractionType.VIEW)
        {
            const existing = await prismaClient.noteInteraction.findFirst({
                where: {
                    noteId: createNoteInteractionDTO.noteId,
                    type: createNoteInteractionDTO.type,
                    ...(createNoteInteractionDTO.role === Role.GUEST &&
                        { guestId: createNoteInteractionDTO.guestId }),
                    ...(createNoteInteractionDTO.role === Role.USER &&
                        { userId: createNoteInteractionDTO.userId }),
                }
            })

            if (existing) return
        }

        await prismaClient.$transaction(async (tx) => {
            await tx.noteInteraction.create({
                data: {
                    role: createNoteInteractionDTO.role,
                    type: createNoteInteractionDTO.type,
                    noteId: createNoteInteractionDTO.noteId,
                    ...(createNoteInteractionDTO.role === Role.GUEST &&
                        { guestId: createNoteInteractionDTO.guestId }),
                    ...(createNoteInteractionDTO.role === Role.USER &&
                        { userId: createNoteInteractionDTO.userId }),
                }
            })

            await tx.note.update({
                where: {
                    id: createNoteInteractionDTO.noteId
                },
                data: {
                    ...(createNoteInteractionDTO.type === InteractionType.LIKE &&
                        { likeCount : { increment: 1 } }),
                    ...(createNoteInteractionDTO.type === InteractionType.VIEW &&
                        { viewCount : { increment: 1 } }),
                    ...(createNoteInteractionDTO.type === InteractionType.SHARE &&
                        { shareCount : { increment: 1 } }),
                }
            })
        })
    }
    
    /**
     ** Creates note interaction for a guest and increases note's like, view or share counts.
     * (by transaction) 
     * @param type InteractionType - 'VIEW' | 'LIKE' | 'UNLIKE' | 'SHARE'
     * @param noteId string
     * @param guestId string
     * @returns Promise<void>
     * @throws Error
     */
    async createGuestInteraction(createGuestNoteInteractionDTO: CreateGuestNoteInteractionDTO)
        :Promise<void>
    {
        await this.createInteraction(new CreateNoteInteractionDTO(
            createGuestNoteInteractionDTO.role,
            createGuestNoteInteractionDTO.type,
            createGuestNoteInteractionDTO.noteId,
            createGuestNoteInteractionDTO.guestId,
            undefined
        ))
    }

    /**
     ** Creates note interaction for a user and increases note's like, view or share counts.
     * (by transaction) 
     * @param type InteractionType - 'VIEW' | 'LIKE' | 'UNLIKE' | 'SHARE'
     * @param noteId string
     * @param userId string
     * @returns Promise <void>
     * @throws Error
     */
    async createUserInteraction(createUserNoteInteractionDTO: CreateUserNoteInteractionDTO)
        :Promise<void>
    {
        await this.createInteraction(new CreateNoteInteractionDTO(
            createUserNoteInteractionDTO.role,
            createUserNoteInteractionDTO.type,
            createUserNoteInteractionDTO.noteId,
            undefined,
            createUserNoteInteractionDTO.userId
        ))
    }

    /**
     * Retrievies note interactions belgons to the guest by the type.
     * @param type InteractionType - 'VIEW' | 'LIKE' | 'UNLIKE' | 'SHARE' 
     * @param guestId string
     * @param noteId string
     * @returns Promise <GuestNoteInteractionDTO[]>
     * @throws Error
     */
    async getGuestInteractions(
        type: InteractionType,
        guestId: string,
        noteId: string) : Promise<GuestNoteInteractionDTO[]>
    {
        const interactions = await prismaClient.noteInteraction.findMany({
            where: {
                role: Role.GUEST,
                noteId: noteId,
                guestId: guestId,
                type: type,
            }
        })

        return interactions.map(i => new GuestNoteInteractionDTO(
            i.id,
            i.type,
            i.noteId,
            i.guestId!
        ))
    }

    /**
     * Retrievies note interactions belgons to the user by the type.
     * @param type InteractionType - 'VIEW' | 'LIKE' | 'UNLIKE' | 'SHARE' 
     * @param userId string
     * @param noteId string
     * @returns Promise <UserNoteInteractionDTO[]>
     * @throws Error
     */
    async getUserInteractions(
        type: InteractionType,
        userId: string,
        noteId: string) : Promise<UserNoteInteractionDTO[]>
    {
        const interactions = await prismaClient.noteInteraction.findMany({
            where: {
                role: Role.USER,
                noteId: noteId,
                userId: userId,
                type: type,
            }
        })

        return interactions.map(i => new UserNoteInteractionDTO(
            i.id,
            i.type,
            i.noteId,
            i.userId!
        ))
    }
}