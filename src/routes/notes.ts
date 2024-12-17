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
    getUserInteractions,
} from '../controllers/note_controller'
import NoteDTO from '../dtos/note/NoteDTO'
import CreateNoteDTO from '../dtos/note/CreateNoteDTO'
import CreateGuestNoteInteractionDTO from '../dtos/noteInteraction/CreateGuestNoteInteractionDTO'
import CreateUserNoteInteractionDTO from '../dtos/noteInteraction/CreateUserNoteInteractionDTO'
import GuestNoteInteractionDTO from '../dtos/noteInteraction/GuestNoteInteractionDTO'
import UserNoteInteractionDTO from '../dtos/noteInteraction/UserNoteInteractionDTO'

const noteRouter: Router = express.Router()

noteRouter.get('/', getNotes)
noteRouter.get(
    '/:id',
    NoteDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getNote
)
noteRouter.post(
    '/',
    CreateNoteDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createNote
)
noteRouter.delete(
    '/:id',
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