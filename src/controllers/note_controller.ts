/**
 * @module
 * @class NoteController
 * Authorization, Sanitizing, Validation and Error handling made in routers by middlewares.
 *----------------------------------------------------------------------------------------------
 * * GET:       /notes                              - Get all notes
 * * GET:       /notes/:id                          - Get a note by id
 * * GET:       /notes/interactions/guest?type&guestId&noteId   - Get guest interactions
 * * GET:       /notes/interactions/user?type&userId&noteId     - Get user interactions
 * * GET:       /notes/maintenance/unused-images    - Get unused note content images
 * * POST:      /notes                              - Creates a note
 * * POST:      /notes/interactions/guest           - Creates guest interaction for a note
 * * POST:      /notes/interactions/user            - Creates user interaction for a note
 * * DELETE:    /notes/:id                          - Deletes a note by id
 */

import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { cacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'
import path from 'path'
import fs from 'fs'

import CreateNoteDTO from '../dtos/note/CreateNoteDTO'
import NoteDTO from '../dtos/note/NoteDTO'
import CreateGuestNoteInteractionDTO from '../dtos/noteInteraction/CreateGuestNoteInteractionDTO'
import CreateUserNoteInteractionDTO from '../dtos/noteInteraction/CreateUserNoteInteractionDTO'

import NoteRepository from '../repositories/note_repository'
import NoteInteractionRepository from '../repositories/noteInteraction_repository'

import type { InteractionType } from '@prisma/client'
import { AddGuestInteractionReqBody, AddUserInteractionReqBody, CreateNoteReqBody, GetGuestInteractionReqQuery, GetUserInteractionReqQuery } from '../types/note'

const noteRepo = new NoteRepository()
const noteInteractionRepo = new NoteInteractionRepository()

/**
 * * Fetches all notes from database or chache
 * * REQUEST: GET
 * * RESPONSE: 200 OK - Json - Note[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
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
 * * Fetches a note by id from database or chache
 * * REQUEST: GET - id - Path
 * * RESPONSE: 200 OK - Json - Note
 * @throws 401 Unauthorized
 * @throws 404 Not found
 * @throws 400 Bad request
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
 * * Fetches the guest note interactions.
 * * REQUEST: POST - type, noteId, guestId - Query
 * * RESPONSE: 200 OK - Json - GuestNoteInteraction[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getGuestInteractions = asyncHandler(async (req: Request, res: Response) => {
    const { type, guestId, noteId } = req.query as GetGuestInteractionReqQuery

    const results = await noteInteractionRepo.getGuestInteractions(
        type as InteractionType, guestId + '-' + req.ip, noteId)
    
    status200Ok(res).json(results.map(r => r.toObject()))
})

/**
 * * Fetches the user note interactions.
 * * REQUEST: POST - type, noteId, userId - Query
 * * RESPONSE: 200 OK - Json - UserNoteInteraction[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getUserInteractions = asyncHandler(async (req: Request, res: Response) => {
    const { type, userId, noteId } = req.query as GetUserInteractionReqQuery

    const results = await noteInteractionRepo.getUserInteractions(
        type as InteractionType, userId, noteId)
    
    status200Ok(res).json(results.map(r => r.toObject()))
})

/**
 * * Fetches all unused note content images
 * * REQUEST: GET
 * * RESPONSE: 200 OK - Json - string[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
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

/**
 * * Creates a note in database.
 * * REQUEST: POST - content, images - Body
 * * RESPONSE: 201 Created with Location - Json - Note
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const createNote = asyncHandler(async (req: Request, res: Response) => {
    const { content, images } : CreateNoteReqBody = req.body
    const createNoteDTO = new CreateNoteDTO(content, images)
    const note = await noteRepo.createNote(createNoteDTO)
    const noteJson = note.toObject()
    status201CreatedWithLocation(res, `${apiUrls.notes}/${noteJson.id}`).json(noteJson)
})

/**
 * * Creates a guest interaction for a note in note interactions table.
 * * The guest can't like, unlike or view a note more than one time but can share a note
 * * Changes view, share or like count of a note.
 * * REQUEST: POST - type, noteId, guestId - Body
 * * RESPONSE: 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const addGuestInteraction = asyncHandler(async (req: Request, res: Response) => {
    const { type, noteId, guestId } : AddGuestInteractionReqBody = req.body
    
    const createGuestNoteInteractionDTO = 
        new CreateGuestNoteInteractionDTO(type, noteId, guestId, req.ip)
    await noteInteractionRepo.createGuestInteraction(createGuestNoteInteractionDTO)

    status200Ok(res).send()
})

/**
 * * Creates a user interaction for a note in note interactions table.
 * * The user can't like, unlike or view a note more than one time but can share a note
 * * Changes view, share or like count of a note.
 * * REQUEST: POST - type, noteId, userId - Body
 * * RESPONSE: 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const addUserInteraction = asyncHandler(async (req: Request, res: Response) => {
    const { type, noteId, userId } : AddUserInteractionReqBody = req.body
    
    const createUserNoteInteractionDTO = new CreateUserNoteInteractionDTO(type, noteId, userId)
    await noteInteractionRepo.createUserInteraction(createUserNoteInteractionDTO)

    status200Ok(res).send()
})

/**
 * * Deletes a note from database by id
 * * REQUEST: GET - id - Path
 * * RESPONSE: 200 OK - Json - Note
 * @throws 401 Unauthorized
 * @throws 404 Not found
 * @throws 400 Bad request
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

export {
    getNotes,
    getNote,
    getGuestInteractions,
    getUserInteractions,
    getUnusedImages,
    createNote,
    addGuestInteraction,
    addUserInteraction,
    deleteNote
}