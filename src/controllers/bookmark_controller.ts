/**
 * @module
 * Authorization, Sanitizing, Validation and Error handling made in routers by middlewares.
 *----------------------------------------------------------------------------------------------
 * * GET:       /bookmarks/guest/:guestId              - Get guest bookmarks by guestId
 * * GET:       /bookmarks/user/:userId                - Get user bookmarks by userId
 * * GET:       /bookmarks/guest?postId&guestId        - Get a guest bookmark by postId and guestId
 * * GET:       /bookmarks/user?postId&userId          - Get a user bookmark by postId and userId
 * * POST:      /bookmarks/guest                       - Creates a guest bookmark
 * * POST:      /bookmarks/user                        - Creates a user bookmark
 * * DELETE:    /bookmarks/:id                         - Deletes a bookmark by id
 */

import asyncHandler from 'express-async-handler'
import { cacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'

import CreateGuestBookmarkDTO from '../dtos/bookmark/CreateGuestBookmarkDTO'
import CreateUserBookmarkDTO from '../dtos/bookmark/CreateUserBookmarkDTO'
import UserBookmarkDTO from '../dtos/bookmark/UserBookmarkDTO'
import GuestBookmarkDTO from '../dtos/bookmark/GuestBookmarkDTO'

import BookmarkRepository from '../repositories/bookmark_repository'

import type { Request, Response } from 'express'
import { CreateGuestBookmarkReqBody, CreateUserBookmarkReqBody, GetGuestBookmarkReqQuery, GetUserBookmarkReqQuery } from '../types/bookmark'

const bookmarkRepo = new BookmarkRepository()

/**
 * * Fetches all guest bookmarks from database or chache
 * * REQUEST: GET - guestId - Path
 * * RESPONSE: 200 OK - Json - GuestBookmark[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getGuestBookmarks = asyncHandler(async (req: Request, res: Response) => {
    const guestId = req.params.guestId as string
    
    const chacheKey = 'guestbookmarks-' + guestId
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const bookmarksData = await bookmarkRepo.getGuestBookmarks(guestId + '-' + req.ip)
        const bookmarks = bookmarksData.map((b: GuestBookmarkDTO) => b.toObject())
        cacher.set(chacheKey, bookmarks, 300)
        status200Ok(res).json(bookmarks)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Fetches all user bookmarks from database or chache
 * * REQUEST: GET - userId - Path
 * * RESPONSE: 200 OK - Json - UserBookmark[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getUserBookmarks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId as string
    
    const chacheKey = 'userbookmarks-' + userId
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const bookmarksData = await bookmarkRepo.getUserBookmarks(userId)
        const bookmarks = bookmarksData.map((b: UserBookmarkDTO) => b.toObject())
        cacher.set(chacheKey, bookmarks, 300)
        status200Ok(res).json(bookmarks)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Fetches a guest bookmark from database or cache
 * * REQUEST: GET - guestId, postId - Query
 * * RESPONSE: 200 OK - Json - GuestBookmark
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getGuestBookmark = asyncHandler(async (req: Request, res: Response) => {
    const { postId, guestId } = req.query as GetGuestBookmarkReqQuery

    const chacheKey = 'guest-bookmark-' + guestId + '-' + postId
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        try {
            const bookmark = await bookmarkRepo.getGuestBookmark(postId, guestId + '-' + req.ip)
            const bookmarkJson = bookmark.toObject()
            status200Ok(res).json(bookmarkJson)
        } catch (_) {
            throw new ApiError(404, 'Bookmark not found with given id')
        }
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Fetches a user bookmark from database or cache
 * * REQUEST: GET - userId, postId - Query
 * * RESPONSE: 200 OK - Json - UserBookmark
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getUserBookmark = asyncHandler(async (req: Request, res: Response) => {
    const { postId, userId } = req.query as GetUserBookmarkReqQuery

    const chacheKey = 'user-bookmark-' + userId + '-' + postId
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        try {
            const bookmark = await bookmarkRepo.getUserBookmark(postId, userId)
            const bookmarkJson = bookmark.toObject()
            status200Ok(res).json(bookmarkJson)
        } catch (_) {
            throw new ApiError(404, 'Bookmark not found with given id')
        }
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Creates a guest bookmark in database
 * * REQUEST: POST - guestId, postId - Body
 * * RESPONSE: 201 Created with location - Json - GuestBookmark
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const createGuestBookmark = asyncHandler(async (req: Request, res: Response) => {
    const { postId, guestId } : CreateGuestBookmarkReqBody = req.body
    const createDTO = new CreateGuestBookmarkDTO(postId, guestId + '-' + req.ip)
    const bookmark = await bookmarkRepo.createGuestBookmark(createDTO)
    const bookmarkJson = bookmark.toObject()
    status201CreatedWithLocation(res, `${apiUrls.bookmarks}/${bookmarkJson.id}`).json(bookmarkJson)
})

/**
 * * Creates a user bookmark in database
 * * REQUEST: POST - userId, postId - Body
 * * RESPONSE: 201 Created with location - Json - UserBookmark
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const createUserBookmark = asyncHandler(async (req: Request, res: Response) => {
    const { postId, userId } : CreateUserBookmarkReqBody = req.body
    const createDTO = new CreateUserBookmarkDTO(postId, userId)
    const bookmark = await bookmarkRepo.createUserBookmark(createDTO)
    const bookmarkJson = bookmark.toObject()
    status201CreatedWithLocation(res, `${apiUrls.bookmarks}/${bookmarkJson.id}`).json(bookmarkJson)
})

/**
 * * Deletes a bookmark by id from database
 * * REQUEST: DELETE - id - Path
 * * RESPONSE: 204 No Content
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const deleteBookmark = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    try {
        await bookmarkRepo.deleteBookmark(id)
        status204NoContent(res)
    } catch (err) {
        throw new ApiError(404, 'Bookmark not found with given id')
    }
})

export {
    getGuestBookmarks,
    getUserBookmarks,
    getGuestBookmark,
    getUserBookmark,
    createGuestBookmark,
    createUserBookmark,
    deleteBookmark
}