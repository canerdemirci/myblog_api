/**
 * @module postController
 * Get posts, get a post, search post, create a post, update a post, delete a post.
 * Sanitizing, Validation and Error handling happens in middlewares and routers.
 */

import type { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { cacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'
import fs from 'fs'
import path from 'path'

import CreatePostDTO from '../dtos/post/CreatePostDTO'
import CreateTagDTO from '../dtos/tag/CreateTagDTO'
import UpdatePostDTO from '../dtos/post/UpdatePostDTO'
import PostDTO from '../dtos/post/PostDTO'

import PostRepository from '../repositories/post_repository'
import { InteractionType } from '@prisma/client'
import PostInteractionRepository from '../repositories/postInteraction_repository'
import CreateGuestPostInteractionDTO from '../dtos/postInteraction/CreateGuestPostInteractionDTO'
import CreateUserPostInteractionDTO from '../dtos/postInteraction/CreateUserPostInteractionDTO'
import PostSearchResultDTO from '../dtos/post/PostSearchResultDTO'
import RelatedPostDTO from '../dtos/post/RelatedPostDTO'
import PostOfTagDTO from '../dtos/post/PostOfTagDTO'

const postRepo = new PostRepository()
const postInteractionRepo = new PostInteractionRepository()

/**
 * * Acquires From REQUEST BODY: title, content, cover, tags.
 * * Creates a Post with CreatePostDTO and CreateTagDTO s.
 * * Converts the Post to Object
 * * SENDS: Post json - 201 Created - With location
 * 
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const createPost = asyncHandler(async (req: Request, res: Response) => {
    const {
        title,
        images,
        content,
        description,
        cover,
        tags
    } : 
    {
        title: string,
        images: string[],
        content?: string,
        description?: string,
        cover?: string,
        tags: string[]
    } = req.body

    const createPostDTO = new CreatePostDTO(title, images, content, description, cover)
    const createTagDTOS = tags.map(t => new CreateTagDTO(t))
    const post = await postRepo.createPost(createPostDTO, createTagDTOS)
    const postJson = post.toObject()
    status201CreatedWithLocation(res, `${apiUrls.posts}/${postJson.id}`).json(postJson)
})

/**
 * * Fetches all posts with optional tag and limitation from database or chache
 * * SENDS: Post[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getPosts = asyncHandler(async (req: Request, res: Response) => {
    const take = req.query.take as string
    const skip = req.query.skip as string
    const tagId = req.query.tagId as string || undefined

    const takeNumber = parseInt(take)
    const skipNumber = parseInt(skip)

    const chacheKey =
        (!isNaN(takeNumber) && !isNaN(skipNumber))
            ? (`posts-${takeNumber}-${skipNumber}` + (!tagId ? '' : `-${tagId}`))
            : ('posts' + (!tagId ? '' : `-${tagId}`))

    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const postsData =
            (!isNaN(takeNumber) && !isNaN(skipNumber))
                ? await postRepo.getPosts({ take: takeNumber, skip: skipNumber }, tagId)
                : await postRepo.getPosts(undefined, tagId)
                
        const posts = postsData.map((p: PostDTO) => p.toObject())
        cacher.set(chacheKey, posts, 300)
        status200Ok(res).json(posts)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Acquires from REQUEST PARAMS: query
 * * Fetches post search results from database
 * * SENDS: Post[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getPostSearchResults = asyncHandler(async (req: Request, res: Response) => {
    const query = req.params.query as string

    const postsData = await postRepo.getPostSearchResults(query)
    const posts = postsData.map((p: PostSearchResultDTO) => p.toObject())
    status200Ok(res).json(posts)
})

/**
 * * Acquires from REQUEST BODY: tags
 * * Fetches related posts by tags from database maximum 6 piece
 * * SENDS: RelatedPost[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getRelatedPosts = asyncHandler(async (req: Request, res: Response) => {
    const { tags } : { tags: string[] } = req.body

    const postsData = await postRepo.getRelatedPosts(tags)
    const posts = postsData.map((p: RelatedPostDTO) => p.toObject())
    status200Ok(res).json(posts)
})

/**
 * * Acquires from REQUEST PARAMS: tag
 * * Fetches posts that belongs to a tag from database.
 * * SENDS: PostOfTagDTO[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getPostsOfTag = asyncHandler(async (req: Request, res: Response) => {
    const tag: string = req.params.tag

    const chacheKey = 'postsoftag-' + tag
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const postsData = await postRepo.getPostsOfTag(tag)
        const posts = postsData.map((p: PostOfTagDTO) => p.toObject())
        cacher.set(chacheKey, posts, 300)
        status200Ok(res).json(posts)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Acquires from REQUEST PARAMS: id
 * * Fetches a post by id from database or chache
 * * SENDS: Post json - 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getPost = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'post-' + req.params.id
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const id: string = req.params.id

        try {
            const postData = await postRepo.getPost(id)
            const post = postData.toObject()
            cacher.set(chacheKey, post, 300)
            status200Ok(res).json(post)
        } catch (err) {
            throw new ApiError(404, 'Post not found with given id')
        }
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Acquires from REQUEST PARAMS: id
 * * Deletes a post from database by id
 * * SENDS: 204 No Content
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const deletePost = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    await postRepo.deletePost(id)
    status204NoContent(res)
})

/**
 * * Acquires from REQUEST BODY: id, title, content, cover, tags
 * * Updates a Post with UpdatePostDTO
 * * SENDS: 204 No Content
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const updatePost = asyncHandler(async (req: Request, res: Response) => {
    const {
        id,
        title,
        images,
        content,
        description,
        cover,
        tags
    } : 
    {
        id: string,
        title: string,
        images: string[],
        content?: string,
        description?: string,
        cover?: string,
        tags: string[]
    } = req.body

    const updatePostDTO = new UpdatePostDTO(id, title, images, content, description, cover)
    const createTagDTOS = tags.map(t => new CreateTagDTO(t))
    await postRepo.updatePost(updatePostDTO, createTagDTOS)
    status204NoContent(res)
})

/**
 * * Acquires from REQUEST BODY: type, postId, questId
 * * Adds u guest interaction to PostInteraction table
 * * The guest can't like, unlike or view a post more than one and can share a post
 * more than one time.
 * * Changes view, share or like count of a post then add record to post interactions table
 * to keep track interactions of a quest or an user.
 * * SENDS: 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const addGuestInteraction = asyncHandler(async (req: Request, res: Response) => {
    const { type, postId, guestId }
        : { type: InteractionType, postId: string, guestId: string } = req.body
    
    const createGuestPostInteractionDTO =
        new CreateGuestPostInteractionDTO(type, postId, guestId, req.ip)
    await postInteractionRepo.createGuestInteraction(createGuestPostInteractionDTO)

    status200Ok(res).send()
})

/**
 * * Acquires from REQUEST BODY: type, postId, userId
 * * Adds u user interaction to PostInteraction table
 * * The user can't like, unlike or view a post more than one and can share a post
 * more than one time.
 * * Changes view, share or like count of a post then add record to post interactions table
 * to keep track interactions of a quest or an user.
 * * SENDS: 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const addUserInteraction = asyncHandler(async (req: Request, res: Response) => {
    const { type, postId, userId }
        : { type: InteractionType, postId: string, userId: string } = req.body
    
    const createUserPostInteractionDTO =
        new CreateUserPostInteractionDTO(type, postId, userId)
    await postInteractionRepo.createUserInteraction(createUserPostInteractionDTO)

    status200Ok(res).send()
})

/**
 * * Fetches the guest post interactions.
 * * Acquires from REQUEST QUERY - type, guestId, postId
 * * SENDS: 200 OK - GuestPostInteractionDTO[] as json
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const getGuestInteractions = asyncHandler(async (req: Request, res: Response) => {
    const type = req.query.type as string
    const guestId = req.query.guestId as string
    const postId = req.query.postId as string

    const results = await postInteractionRepo.getGuestInteractions(
        type as InteractionType, guestId + '-' + req.ip, postId)
    
    status200Ok(res).json(results.map(r => r.toObject()))
})

/**
 * * Fetches the user post interactions.
 * * Acquires from REQUEST QUERY - type, userId, postId
 * * SENDS: 200 OK - UserPostInteractionDTO[] as json
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const getUserInteractions = asyncHandler(async (req: Request, res: Response) => {
    const type = req.query.type as string
    const userId = req.query.userId as string
    const postId = req.query.postId as string

    const results = await postInteractionRepo.getUserInteractions(
        type as InteractionType, userId, postId)
    
    status200Ok(res).json(results.map(r => r.toObject()))
})

/**
 * * Fetches all unused post covers
 * * SENDS: string[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getUnusedCovers = asyncHandler(async (req: Request, res: Response) => {
    const directoryPath = path.join(__dirname, '../../uploads');

    fs.readdir(directoryPath, async function (err, files) {
        if (err) {
            throw new ApiError(500, 'Unable to scan directory: ' + err)
        }

        const coverFileList = files.filter(f => f.startsWith('coverImage-'))
        const postCoverList = await postRepo.getPostCoversList()
        const unusedCovers = coverFileList.filter(c => !postCoverList.includes(c))
        
        status200Ok(res).json(unusedCovers)
    })
})

/**
 * * Fetches all unused post content images
 * * SENDS: string[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getUnusedImages = asyncHandler(async (req: Request, res: Response) => {
    const directoryPath = path.join(__dirname, '../../uploads/images_of_posts');

    fs.readdir(directoryPath, async function (err, files) {
        if (err) {
            throw new ApiError(500, 'Unable to scan directory: ' + err)
        }

        const imageFileList = files.filter(f => f.startsWith('postImages-'))
        const postImageList = await postRepo.getPostImagesList()
        const unusedImages = imageFileList.filter(c => !postImageList.includes(c))
        
        status200Ok(res).json(unusedImages)
    })
})

export {
    createPost,
    getPosts,
    getPostSearchResults,
    getRelatedPosts,
    getPostsOfTag,
    getPost,
    deletePost,
    updatePost,
    addGuestInteraction,
    addUserInteraction,
    getGuestInteractions,
    getUserInteractions,
    getUnusedCovers,
    getUnusedImages
}