/**
 * @module
 ** ROUTES OF BOOKMARKS
 ** Authentication and validation middlewares are used in the following routes
 *----------------------------------------------------------------------------------------------
 * * GET:       /bookmarks/guest/:guestId              - Get guest bookmarks by guestId
 * * GET:       /bookmarks/user/:userId                - Get user bookmarks by userId
 * * GET:       /bookmarks/guest?postId&guestId        - Get a guest bookmark by postId and guestId
 * * GET:       /bookmarks/user?postId&userId          - Get a user bookmark by postId and userId
 * * POST:      /bookmarks/guest                       - Creates a guest bookmark
 * * POST:      /bookmarks/user                        - Creates a user bookmark
 * * DELETE:    /bookmarks/:id                         - Deletes a bookmark by id
 */

import express, { Router } from 'express'
import { param } from 'express-validator'

import { validationErrorMiddleware } from '../middleware/error'
import { authMiddleware } from '../middleware/auth'

import {
    createGuestBookmark,
    createUserBookmark,
    deleteBookmark,
    getGuestBookmark,
    getGuestBookmarks,
    getUserBookmark,
    getUserBookmarks
} from '../controllers/bookmark_controller'

import GuestBookmarkDTO from '../dtos/bookmark/GuestBookmarkDTO'
import UserBookmarkDTO from '../dtos/bookmark/UserBookmarkDTO'
import CreateGuestBookmarkDTO from '../dtos/bookmark/CreateGuestBookmarkDTO'
import CreateUserBookmarkDTO from '../dtos/bookmark/CreateUserBookmarkDTO'

const bookmarkRouter: Router = express.Router()

// GET: /bookmarks/guest/:guestId - Get guest bookmarks by guestId
bookmarkRouter.get(
    '/guest/:guestId',
    GuestBookmarkDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getGuestBookmarks
)
// GET: /bookmarks/user/:userId - Get user bookmarks by userId
bookmarkRouter.get(
    '/user/:userId',
    authMiddleware,
    UserBookmarkDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getUserBookmarks
)
// GET: /bookmarks/guest?postId&guestId - Get a guest bookmark by postId and guestId
bookmarkRouter.get(
    '/guest',
    GuestBookmarkDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getGuestBookmark
)
// GET: /bookmarks/user?postId&userId - Get a user bookmark by postId and userId
bookmarkRouter.get(
    '/user',
    authMiddleware,
    UserBookmarkDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getUserBookmark
)
// POST: /bookmarks/guest - Creates a guest bookmark
bookmarkRouter.post(
    '/guest',
    CreateGuestBookmarkDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createGuestBookmark
)
// POST: /bookmarks/user - Creates a user bookmark
bookmarkRouter.post(
    '/user',
    authMiddleware,
    CreateUserBookmarkDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createUserBookmark
)
// DELETE: /bookmarks/:id - Deletes a bookmark by id
bookmarkRouter.delete(
    '/:id',
    [
        param('id')
            .isString()
            .notEmpty().withMessage('Id cannot be empty')
            .trim()
            .escape(),
    ],
    validationErrorMiddleware,
    deleteBookmark
)

export default bookmarkRouter