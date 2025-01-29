/**
 * @module noteController
 * Get notes, get a note, create a note, delete a note
 * Sanitizing, Validation and Error handling happens in middlewares and routers.
 */

import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { cacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'
import path from 'path'
import fs from 'fs'
import { InteractionType } from '@prisma/client'

import CreateNoteDTO from '../dtos/note/CreateNoteDTO'
import NoteDTO from '../dtos/note/NoteDTO'

import NoteRepository from '../repositories/note_repository'
import NoteInteractionRepository from '../repositories/noteInteraction_repository'
import CreateGuestNoteInteractionDTO from '../dtos/noteInteraction/CreateGuestNoteInteractionDTO'
import CreateUserNoteInteractionDTO from '../dtos/noteInteraction/CreateUserNoteInteractionDTO'

const noteRepo = new NoteRepository()
const noteInteractionRepo = new NoteInteractionRepository()

/**
 * * Acquires From REQUEST BODY: content
 * * Creates a Note with CreateNoteDTO
 * * Converts the Note to Object
 * * SENDS: Post json - 201 Created - With location
 * 
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const createNote = asyncHandler(async (req: Request, res: Response) => {
    const { content, images } : { content: string, images: string[] } = req.body
    const createNoteDTO = new CreateNoteDTO(content, images)
    const note = await noteRepo.createNote(createNoteDTO)
    const noteJson = note.toObject()
    status201CreatedWithLocation(res, `${apiUrls.notes}/${noteJson.id}`).json(noteJson)
})

/**
 * * Fetches all notes from database or chache
 * * SENDS: Note[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getNotes = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'notes'
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const notesData = await noteRepo.getNotes()
        const notes = notesData.map((n: NoteDTO) => n.toObject())
        cacher.set(chacheKey, notes, 300)
        status200Ok(res).json(notes)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Acquires from REQUEST PARAMS: id
 * * Fetches a note by id from database or chache
 * * SENDS: Note json - 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getNote = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'note-' + req.params.id
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const id: string = req.params.id

        try {
            const noteData = await noteRepo.getNote(id)
            const note = noteData.toObject()
            cacher.set(chacheKey, note, 300)
            status200Ok(res).json(note)
        } catch (err) {
            throw new ApiError(404, 'Note not found with given id')
        }
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Acquires from REQUEST PARAMS: id
 * * Deletes a note from database by id
 * * SENDS: 204 No Content
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const deleteNote = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    try {
        await noteRepo.deleteNote(id)
        status204NoContent(res)
    } catch (err) {
        throw new ApiError(404, 'Note not found with given id')
    }
})

/**
 * * Acquires from REQUEST BODY: type, noteId, questId
 * * Adds u guest interaction to NoteInteraction table
 * * The guest can't like, unlike or view a note more than one and can share a note
 * more than one time.
 * * Changes view, share or like count of a note then add record to note interactions table
 * to keep track interactions of a quest or an user.
 * * SENDS: 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const addGuestInteraction = asyncHandler(async (req: Request, res: Response) => {
    const { type, noteId, guestId }
        : { type: InteractionType, noteId: string, guestId: string } = req.body
    
    const createGuestNoteInteractionDTO =
        new CreateGuestNoteInteractionDTO(type, noteId, guestId, req.ip)
    await noteInteractionRepo.createGuestInteraction(createGuestNoteInteractionDTO)

    status200Ok(res).send()
})

/**
 * * Acquires from REQUEST BODY: type, noteId, userId
 * * Adds u user interaction to NoteInteraction table
 * * The user can't like, unlike or view a note more than one and can share a note
 * more than one time.
 * * Changes view, share or like count of a note then add record to note interactions table
 * to keep track interactions of a quest or an user.
 * * SENDS: 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const addUserInteraction = asyncHandler(async (req: Request, res: Response) => {
    const { type, noteId, userId }
        : { type: InteractionType, noteId: string, userId: string } = req.body
    
    const createUserNoteInteractionDTO =
        new CreateUserNoteInteractionDTO(type, noteId, userId)
    await noteInteractionRepo.createUserInteraction(createUserNoteInteractionDTO)

    status200Ok(res).send()
})

/**
 * * Fetches the guest note interactions.
 * * Acquires from REQUEST QUERY - type, guestId, noteId
 * * SENDS: 200 OK - GuestNoteInteractionDTO[] as json
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const getGuestInteractions = asyncHandler(async (req: Request, res: Response) => {
    const type = req.query.type as string
    const guestId = req.query.guestId as string
    const noteId = req.query.noteId as string

    const results = await noteInteractionRepo.getGuestInteractions(
        type as InteractionType, guestId + '-' + req.ip, noteId)
    
    status200Ok(res).json(results.map(r => r.toObject()))
})

/**
 * * Fetches the user note interactions.
 * * Acquires from REQUEST QUERY - type, userId, noteId
 * * SENDS: 200 OK - UserNoteInteractionDTO[] as json
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const getUserInteractions = asyncHandler(async (req: Request, res: Response) => {
    const type = req.query.type as string
    const userId = req.query.userId as string
    const noteId = req.query.noteId as string

    const results = await noteInteractionRepo.getUserInteractions(
        type as InteractionType, userId, noteId)
    
    status200Ok(res).json(results.map(r => r.toObject()))
})

/**
 * * Fetches all unused note content images
 * * SENDS: string[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getUnusedImages = asyncHandler(async (req: Request, res: Response) => {
    const directoryPath = path.join(__dirname, '../../uploads/images_of_notes');

    fs.readdir(directoryPath, async function (err, files) {
        if (err) {
            throw new ApiError(500, 'Unable to scan directory: ' + err)
        }

        const imageFileList = files.filter(f => f.startsWith('noteImages-'))
        const noteImageList = await noteRepo.getNoteImagesList()
        const unusedImages = imageFileList.filter(c => !noteImageList.includes(c))
        
        status200Ok(res).json(unusedImages)
    })
})

export {
    createNote,
    getNotes,
    getNote,
    deleteNote,
    addGuestInteraction,
    addUserInteraction,
    getGuestInteractions,
    getUserInteractions,
    getUnusedImages
}