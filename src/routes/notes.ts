/**
 * @module notesRouter
 * Note routes
 */

import express, { Router } from 'express'
import { validationErrorMiddleware } from '../middleware/error'
import {
    addGuestInteraction,
    addUserInteraction,
    createNote,
    deleteNote,
    getGuestInteractions,
    getNote,
    getNotes,
    getUnusedImages,
    getUserInteractions,
} from '../controllers/note_controller'
import NoteDTO from '../dtos/note/NoteDTO'
import CreateNoteDTO from '../dtos/note/CreateNoteDTO'
import CreateGuestNoteInteractionDTO from '../dtos/noteInteraction/CreateGuestNoteInteractionDTO'
import CreateUserNoteInteractionDTO from '../dtos/noteInteraction/CreateUserNoteInteractionDTO'
import GuestNoteInteractionDTO from '../dtos/noteInteraction/GuestNoteInteractionDTO'
import UserNoteInteractionDTO from '../dtos/noteInteraction/UserNoteInteractionDTO'
import { authMiddleware } from '../middleware/auth'

const noteRouter: Router = express.Router()

noteRouter.get('/', getNotes)
noteRouter.get(
    '/:id',
    NoteDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getNote
)
noteRouter.get(
    '/maintenance/unused-images',
    getUnusedImages
)
noteRouter.post(
    '/',
    authMiddleware,
    CreateNoteDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createNote
)
noteRouter.delete(
    '/:id',
    authMiddleware,
    NoteDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deleteNote
)
noteRouter.post(
    '/interactions/guest',
    CreateGuestNoteInteractionDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    addGuestInteraction
)
noteRouter.post(
    '/interactions/user',
    authMiddleware,
    CreateUserNoteInteractionDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    addUserInteraction
)
noteRouter.get(
    '/interactions/guest',
    GuestNoteInteractionDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getGuestInteractions
)
noteRouter.get(
    '/interactions/user',
    UserNoteInteractionDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getUserInteractions
)

export default noteRouter