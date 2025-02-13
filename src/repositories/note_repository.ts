/**
 * @module
 * @class NoteRepository
 * This repository used for crud operations at notes.
 */

import prismaClient from "../utils/prismaClient"
import NoteDTO from "../dtos/note/NoteDTO"
import CreateNoteDTO from "../dtos/note/CreateNoteDTO"

export default class NoteRepository {
    /**
     * Creates a note in the database.
     * @param createNoteDTO CreateNoteDTO
     * @throws Error
     * @returns Promise < NoteDTO >
     */
    async createNote(createNoteDTO: CreateNoteDTO) : Promise<NoteDTO> {
        const note = await prismaClient.note.create({
            data: { content: createNoteDTO.content, images: createNoteDTO.images }
        })

        return NoteDTO.fromDB(note)
    }

    /**
     * Fetches notes at most {take} from database.
     * @param take number
     * @throws Error
     * @returns Promise < NoteDTO[] >
     */
    async getNotes(take?: number) : Promise<NoteDTO[]> {
        const notes = await prismaClient.note.findMany({
            orderBy: { createdAt: 'desc' },
            ...(take && { take: take })
        })

        return notes.map(n => NoteDTO.fromDB(n))
    }

    /**
     * Fetches a note by id from database.
     * @param id string
     * @throws Error
     * @returns Promise < NoteDTO | never >
     */
    async getNote(id: string) : Promise<NoteDTO | never> {
        const note = await prismaClient.note.findFirstOrThrow({
            where: { id: id }
        })
        
        return NoteDTO.fromDB(note)
    }

    /**
     * Deletes a note by id from database.
     * @param id string
     * @throws Error
     * @returns Promise < void >
     */
    async deleteNote(id: string) : Promise<void> {
        await prismaClient.note.delete({ where: { id: id } })
    }

    /**
     * Fetchs all note content images from database.
     * @throws Error
     * @returns Promise < string[] >
     */
    async getNoteImagesList() : Promise<string[]> {
        const images = await prismaClient.note.findMany({
            select: {
                images: true
            },
            where: {
                images: {
                    isEmpty: false
                }
            }
        })

        return images.flatMap(i => i.images)
    }
}