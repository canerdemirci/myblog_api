/**
 * @module tagController
 * Get tags, get a tag, create a tag, delete a tag
 */

import { apiUrls } from '../constants'
import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'
import { chacher } from '../utils/cacher'
import CreateTagDTO from '../dtos/tag/CreateTagDTO'
import TagDTO from '../dtos/tag/TagDTO'
import TagRepository from '../repositories/tag_repository'

const tagRepo = new TagRepository()

/**
 * This handler takes tag name string from request.
 * Creates a DTO
 * Apply filter it
 * Validate it
 * Creates a tag in the database
 * Converts it to js object and sends it as a response with 201 status code
 * with created post location.
 * Errors that may occur:
 *  - 500 Internal server error
 *  - 400 Bad request - Validation error
 */
const createTag = asyncHandler(async (req: Request, res: Response) => {
    const { name } : { name: string } = req.body
    const createTagDTO = new CreateTagDTO(name)
    const tag = await tagRepo.createTag(createTagDTO)
    const tagJson = tag.toObject()
    status201CreatedWithLocation(res, `${apiUrls.tags}/${tagJson.id}`).json(tagJson)
})

/**
 * This handler fetchs all tags in the database and
 * sends them as a response with 200 status code with array of tag objects
 * Errors that may occur:
 *  - 500 Internal server error
 */
const getTags = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'tags'
    const chacedData = chacher.get(chacheKey)

    if (!chacedData) {
        const tagsData = await tagRepo.getTags()
        const tags = tagsData.map((t: TagDTO) => t.toObject())
        status200Ok(res).json(tags)
        chacher.set(chacheKey, tags, 300)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * This handler fetchs a post by id then sends it as a response
 * with status code 200 with post object.
 * Errors that may occur:
 *  - 500 Internal server error
 *  - 400 Bad request
 *  - 404 Not found
 */
const getTag = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'tag-' + req.params.id
    const chacedData = chacher.get(chacheKey)

    if (!chacedData) {
        const id: string = req.params.id

        if (!id) throw new ApiError(400, 'Bad Request: Tag id required.')

        try {
            const tagData = await tagRepo.getTag(id)
            const tag = tagData.toObject()
            status200Ok(res).json(tag)
            chacher.set(chacheKey, tag, 300)
        } catch (err) {
            throw new ApiError(404, 'Tag not found with given id')
        }
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * This handler deletes a tag by id from database then response
 * 204 No Content.
 * Errors that may occur:
 *  - 500 Internal server error
 *  - 400 Bad Request
 *  - 404 Not Found
 */
const deleteTag = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    if (!id) throw new ApiError(400, 'Bad Request: Tag id required.')

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