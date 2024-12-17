/**
 * @module bookmarkController
 * Get bookmarks, get a bookmark, create a bookmark, update a bookmark, delete a bookmark.
 * Sanitizing, Validation and Error handling happens in middlewares and routers.
 */

import type { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { chacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'
import CreateGuestBookmarkDTO from '../dtos/bookmark/CreateGuestBookmarkDTO'
import BookmarkRepository from '../repositories/bookmark_repository'
import CreateUserBookmarkDTO from '../dtos/bookmark/CreateUserBookmarkDTO'
import UserBookmarkDTO from '../dtos/bookmark/UserBookmarkDTO'
import GuestBookmarkDTO from '../dtos/bookmark/GuestBookmarkDTO'

const bookmarkRepo = new BookmarkRepository()

/**
 * * Acquires From REQUEST BODY: postId, guestId.
 * * Creates a bookmark with CreateGuestBookmarkDTO.
 * * Converts the bookmark to Object
 * * SENDS: GuestBookmark json - 201 Created - With location
 * 
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const createGuestBookmark = asyncHandler(async (req: Request, res: Response) => {
    const { postId, guestId } : 
        { postId: string, guestId: string } = req.body
    const createDTO = 
        new CreateGuestBookmarkDTO(postId, guestId + '-' + req.ip)
    const bookmark = await bookmarkRepo.createGuestBookmark(createDTO)
    const bookmarkJson = bookmark.toObject()
    status201CreatedWithLocation(res, `${apiUrls.bookmarks}/${bookmarkJson.id}`).json(bookmarkJson)
})

/**
 * * Acquires From REQUEST BODY: postId, userId.
 * * Creates a bookmark with CreateUserBookmarkDTO.
 * * Converts the bookmark to Object
 * * SENDS: UserBookmark json - 201 Created - With location
 * 
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const createUserBookmark = asyncHandler(async (req: Request, res: Response) => {
    const { postId, userId } : 
        { postId: string, userId: string } = req.body
    const createDTO = 
        new CreateUserBookmarkDTO(postId, userId)
    const bookmark = await bookmarkRepo.createUserBookmark(createDTO)
    const bookmarkJson = bookmark.toObject()
    status201CreatedWithLocation(res, `${apiUrls.bookmarks}/${bookmarkJson.id}`).json(bookmarkJson)
})

/**
 * * Acquires from REQUEST QUERY: userId
 * * Fetches all user bookmarks from database or chache
 * * SENDS: UserBookmarkDTO[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getUserBookmarks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId as string
    
    const chacheKey = 'userbookmarks-' + userId
    const chacedData = chacher.get(chacheKey)

    if (!chacedData) {
        const bookmarksData = await bookmarkRepo.getUserBookmarks(userId)
        const bookmarks = bookmarksData.map((b: UserBookmarkDTO) => b.toObject())
        status200Ok(res).json(bookmarks)
        chacher.set(chacheKey, bookmarks, 300)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Acquires from REQUEST QUERY: userId
 * * Fetches all user bookmarks from database or chache
 * * SENDS: UserBookmarkDTO[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getGuestBookmarks = asyncHandler(async (req: Request, res: Response) => {
    const guestId = req.params.guestId as string
    
    const chacheKey = 'guestbookmarks-' + guestId
    const chacedData = chacher.get(chacheKey)

    if (!chacedData) {
        const bookmarksData = await bookmarkRepo.getGuestBookmarks(guestId + '-' + req.ip)
        const bookmarks = bookmarksData.map((b: GuestBookmarkDTO) => b.toObject())
        status200Ok(res).json(bookmarks)
        chacher.set(chacheKey, bookmarks, 300)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Acquires from REQUEST QUERY: postId, questId
 * * Fetches a guest bookmark from database
 * * SENDS: GuestBookmarkDTO json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getGuestBookmark = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.query.postId as string
    const guestId = req.query.guestId as string

    const bookmark = await bookmarkRepo.getGuestBookmark(postId, guestId + '-' + req.ip)
    const bookmarkJson = bookmark.toObject()

    status200Ok(res).json(bookmarkJson)
})

/**
 * * Acquires from REQUEST QUERY: postId, userId
 * * Fetches a user bookmark from database
 * * SENDS: UserBookmarkDTO json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getUserBookmark = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.query.postId as string
    const userId = req.query.userId as string

    const bookmark = await bookmarkRepo.getUserBookmark(postId, userId)
    const bookmarkJson = bookmark.toObject()

    status200Ok(res).json(bookmarkJson)
})

/**
 * * Acquires from REQUEST PARAMS: id
 * * Deletes a bookmark from database by id
 * * SENDS: 204 No Content
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const deleteBookmark = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    if (!id) throw new ApiError(400, 'Bad Request: Bookmark id required.')

    try {
        await bookmarkRepo.deleteBookmark(id)
        status204NoContent(res)
    } catch (err) {
        throw new ApiError(404, 'Bookmark not found with given id')
    }
})

export {
    createGuestBookmark,
    createUserBookmark,
    getGuestBookmarks,
    getUserBookmarks,
    getGuestBookmark,
    getUserBookmark,
    deleteBookmark
}