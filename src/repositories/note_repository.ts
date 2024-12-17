/**
 * @module noteRepository
 * This repository used for crud operations at notes.
 */

import prismaClient from "../utils/prismaClient"
import NoteDTO from "../dtos/note/NoteDTO"
import CreateNoteDTO from "../dtos/note/CreateNoteDTO"

export default class NoteRepository {
    /**
     * Creates a note.
     * @param createNoteDTO CreateNoteDTO
     * @returns Promise<NoteDTO>
     * @throws Error
     */
    async createNote(createNoteDTO: CreateNoteDTO) : Promise<NoteDTO> {
        const note = await prismaClient.note.create({
            data: { content: createNoteDTO.content }
        })

        return NoteDTO.fromDB(note)
    }

    /**
     * Fetches all notes
     * @returns Promise<NoteDTO[]>
     * @throws Error
     */
    async getNotes() : Promise<NoteDTO[]> {
        const notes = await prismaClient.note.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return notes.map(n => NoteDTO.fromDB(n))
    }

    /**
     * Fetches a note by id
     * @param id string
     * @returns Promise<NoteDTO>
     * @throws Error
     */
    async getNote(id: string) : Promise<NoteDTO | never> {
        const note = await prismaClient.note.findFirstOrThrow({
            where: { id: id }
        })
        
        return NoteDTO.fromDB(note)
    }

    /**
     * Deletes a note by id
     * @param id string
     * @returns Promise<void>
     * @throws Error
     */
    async deleteNote(id: string) : Promise<void> {
        await prismaClient.note.delete({ where: { id: id } })
    }
}