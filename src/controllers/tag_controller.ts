/**
 * @module tagController
 * Get tags, get a tag, create a tag, delete a tag
 * Sanitizing, Validation and Error handling happens in middlewares and routers.
 */

import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { cacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'

import CreateTagDTO from '../dtos/tag/CreateTagDTO'
import TagDTO from '../dtos/tag/TagDTO'

import TagRepository from '../repositories/tag_repository'

const tagRepo = new TagRepository()

/**
 * * Acquires From REQUEST BODY: name
 * * Creates a Tag with CreateTagDTO
 * * Converts the Tag to Object
 * * SENDS: Tag json - 201 Created - With location
 * 
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const createTag = asyncHandler(async (req: Request, res: Response) => {
    const { name } : { name: string } = req.body
    const createTagDTO = new CreateTagDTO(name)
    const tag = await tagRepo.createTag(createTagDTO)
    const tagJson = tag.toObject()
    status201CreatedWithLocation(res, `${apiUrls.tags}/${tagJson.id}`).json(tagJson)
})

/**
 * * Fetches all tags from database or chache
 * * SENDS: Tag[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getTags = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'tags'
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const tagsData = await tagRepo.getTags()
        const tags = tagsData.map((t: TagDTO) => t.toObject())
        cacher.set(chacheKey, tags, 300)
        status200Ok(res).json(tags)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Acquires from REQUEST PARAMS: id
 * * Fetches a tag by id from database or chache
 * * SENDS: Tag json - 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getTag = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'tag-' + req.params.id
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const id: string = req.params.id

        try {
            const tagData = await tagRepo.getTag(id)
            const tag = tagData.toObject()
            cacher.set(chacheKey, tag, 300)
            status200Ok(res).json(tag)
        } catch (err) {
            throw new ApiError(404, 'Tag not found with given id')
        }
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Acquires from REQUEST PARAMS: id
 * * Deletes a tag from database by id
 * * SENDS: 204 No Content
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const deleteTag = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    try {
        await tagRepo.deleteTag(id)
        status204NoContent(res)
    } catch (err) {
        throw new ApiError(404, 'Tag not found with given id')
    }
})

export {
    createTag,
    getTags,
    getTag,
    deleteTag
}