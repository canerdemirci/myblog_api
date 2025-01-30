/**
 * @module
 ** ROUTES OF NOTES
 ** Authentication and validation middlewares are used in the following routes
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

import express, { Router } from 'express'
import { validationErrorMiddleware } from '../middleware/error'
import { authMiddleware } from '../middleware/auth'

import {
    getNotes,
    getNote,
    getGuestInteractions,
    getUserInteractions,
    getUnusedImages,
    createNote,
    addGuestInteraction,
    addUserInteraction,
    deleteNote,
} from '../controllers/note_controller'

import NoteDTO from '../dtos/note/NoteDTO'
import CreateNoteDTO from '../dtos/note/CreateNoteDTO'
import CreateGuestNoteInteractionDTO from '../dtos/noteInteraction/CreateGuestNoteInteractionDTO'
import CreateUserNoteInteractionDTO from '../dtos/noteInteraction/CreateUserNoteInteractionDTO'
import GuestNoteInteractionDTO from '../dtos/noteInteraction/GuestNoteInteractionDTO'
import UserNoteInteractionDTO from '../dtos/noteInteraction/UserNoteInteractionDTO'

const noteRouter: Router = express.Router()

// GET /notes - Get all notes
noteRouter.get('/', getNotes)
// GET /notes/:id - Get a note by id
noteRouter.get(
    '/:id',
    NoteDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getNote
)
// GET /notes/interactions/guest - Get guest interactions
noteRouter.get(
    '/interactions/guest',
    GuestNoteInteractionDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getGuestInteractions
)
// GET /notes/interactions/user - Get user interactions
noteRouter.get(
    '/interactions/user',
    UserNoteInteractionDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getUserInteractions
)
// GET /notes/maintenance/unused-images - Get unused note content images
noteRouter.get(
    '/maintenance/unused-images',
    getUnusedImages
)
// POST /notes - Creates a note
noteRouter.post(
    '/',
    authMiddleware,
    CreateNoteDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createNote
)
// POST /notes/interactions/guest - Creates guest interaction for a note
noteRouter.post(
    '/interactions/guest',
    CreateGuestNoteInteractionDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    addGuestInteraction
)
// POST /notes/interactions/user - Creates user interaction for a note
noteRouter.post(
    '/interactions/user',
    authMiddleware,
    CreateUserNoteInteractionDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    addUserInteraction
)
// DELETE /notes/:id - Deletes a note by id
noteRouter.delete(
    '/:id',
    authMiddleware,
    NoteDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deleteNote
)

export default noteRouter