/**
 * @module
 * Authorization, Sanitizing, Validation and Error handling made in routers by middlewares.
 *----------------------------------------------------------------------------------------------
 * * GET:       /tags                              - Get all tags
 * * GET:       /tags/:id                          - Get a tag by id
 * * POST:      /tags                              - Create a tag
 * * DELETE:    /tags/:id                          - Deletes a tag by id
 */

import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { cacher, delCacheKeys } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'

import CreateTagDTO from '../dtos/tag/CreateTagDTO'
import TagDTO from '../dtos/tag/TagDTO'

import TagRepository from '../repositories/tag_repository'

const tagRepo = new TagRepository()

/**
 * * Fetches all tags from database or chache
 * * REQUEST: GET
 * * RESPONSE: 200 OK - Json - Tag[]
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getTags = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'tag-all'
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const tagsData = await tagRepo.getTags()
        const tags = tagsData.map((t: TagDTO) => t.toObject())
        cacher.set(chacheKey, tags, 60 * 60 * 24 * 7)
        status200Ok(res).json(tags)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Fetches a tag by id from database or chache
 * * REQUEST: GET - id - Path
 * * RESPONSE: 200 OK - Json - Tag
 * @throws 401 Unauthorized
 * @throws 400 Bad request
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
            cacher.set(chacheKey, tag, 60 * 60 * 24 * 7)
            status200Ok(res).json(tag)
        } catch (err) {
            throw new ApiError(404, 'Tag not found with given id')
        }
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Creates a tag with name
 * * REQUEST: POST - name - Body
 * * RESPONSE: 201 Created with Location - Json - Post[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const createTag = asyncHandler(async (req: Request, res: Response) => {
    const { name } : { name: string } = req.body
    const createTagDTO = new CreateTagDTO(name)
    const tag = await tagRepo.createTag(createTagDTO)
    const tagJson = tag.toObject()
    delCacheKeys(['tag-'])
    status201CreatedWithLocation(res, `${apiUrls.tags}/${tagJson.id}`).json(tagJson)
})

/**
 * * Deletes a tag by id
 * * REQUEST: GET - id - Path
 * * RESPONSE: 204 No content
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const deleteTag = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    try {
        await tagRepo.deleteTag(id)
        delCacheKeys(['tag-'])
        status204NoContent(res)
    } catch (err) {
        throw new ApiError(404, 'Tag not found with given id')
    }
})

export {
    getTags,
    getTag,
    createTag,
    deleteTag
}