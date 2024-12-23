/**
 * @module bookmarkRouter
 * Bookmark routes
 */

import express, { Router } from 'express'
import { validationErrorMiddleware } from '../middleware/error'
import { createGuestBookmark, createUserBookmark, deleteBookmark, getGuestBookmark, getGuestBookmarks, getUserBookmark, getUserBookmarks } from '../controllers/bookmark_controller'
import GuestBookmarkDTO from '../dtos/bookmark/GuestBookmarkDTO'
import UserBookmarkDTO from '../dtos/bookmark/UserBookmarkDTO'
import CreateGuestBookmarkDTO from '../dtos/bookmark/CreateGuestBookmarkDTO'
import CreateUserBookmarkDTO from '../dtos/bookmark/CreateUserBookmarkDTO'
import { param } from 'express-validator'

const bookmarkRouter: Router = express.Router()

bookmarkRouter.get(
    '/guest/:guestId',
    GuestBookmarkDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getGuestBookmarks
)
bookmarkRouter.get(
    '/user/:userId',
    UserBookmarkDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getUserBookmarks
)
bookmarkRouter.get(
    '/guest',
    GuestBookmarkDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getGuestBookmark
)
bookmarkRouter.get(
    '/user',
    UserBookmarkDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getUserBookmark
)
bookmarkRouter.post(
    '/guest',
    CreateGuestBookmarkDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createGuestBookmark
)
bookmarkRouter.post(
    '/user',
    CreateUserBookmarkDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createUserBookmark
)
bookmarkRouter.delete(
    '/:id',
    [param('id').isString().notEmpty().trim().escape()],
    validationErrorMiddleware,
    deleteBookmark
)

export default bookmarkRouter