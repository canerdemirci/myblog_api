/**
 * @module
 * Authorization, Sanitizing, Validation and Error handling made in routers by middlewares.
 *----------------------------------------------------------------------------------------------
 * * GET:       /users                                      - Get all users
 * * GET:       /users/search/:id                           - Get a user by id
 * * GET:       /users/search/byemail/:email                - Get a user by email
 * * GET:       /users/search/byprovider/:providerId        - Get a user by provider id
 * * GET:       /users/search?email&password                - Get a user by email and password
 * * POST:      /users                                      - Creates a user
 * * PUT:       /users                                      - Updates a user
 * * DELETE:    /users/:id                                  - Deletes a user by id
 */

import asyncHandler from 'express-async-handler'
import { cacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'
import crypto from 'crypto'

import CreateUserDTO from '../dtos/user/CreateUserDTO'
import UpdateUserDTO from '../dtos/user/UpdateUserDTO'
import UserDTO from '../dtos/user/UserDTO'

import UserRepository from '../repositories/user_repository'

import { Request, Response } from 'express'
import { CreateUserReqBody, GetUserEmailAndPasswordReqQuery, UpdateUserReqBody } from '../types/user'

const userRepo = new UserRepository()

/**
 * * Fetches all users from database or chache
 * * REQUEST: GET
 * * RESPONSE: 200 OK - Json - User[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'users'
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const usersData = await userRepo.getUsers()
        const users = usersData.map((u: UserDTO) => u.toObject())
        cacher.set(chacheKey, users, 300)
        status200Ok(res).json(users)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Fetches a users by id from database
 * * REQUEST: GET - id - Path
 * * RESPONSE: 200 OK - Json - User
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getUser = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    try {
        const userData = await userRepo.getUser(id)
        const user = userData.toObject()
        status200Ok(res).json(user)
    } catch (err) {
        throw new ApiError(404, 'User not found with given id')
    }
})

/**
 * * Fetches a users by email from database
 * * REQUEST: GET - email - Path
 * * RESPONSE: 200 OK - Json - User
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getUserByEmail = asyncHandler(async (req: Request, res: Response) => {
    const email: string = req.params.email

    try {
        const userData = await userRepo.getUserByEmail(email)
        const user = userData.toObject()
        status200Ok(res).json(user)
    } catch (err) {
        throw new ApiError(404, 'User not found with given email')
    }
})

/**
 * * Fetches a users by provider id from database
 * * REQUEST: GET - providerId - Path
 * * RESPONSE: 200 OK - Json - User
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getUserByProviderId = asyncHandler(async (req: Request, res: Response) => {
    const providerId: string = req.params.providerId

    try {
        const userData = await userRepo.getUserByProviderId(providerId)
        const user = userData.toObject()
        status200Ok(res).json(user)
    } catch (err) {
        throw new ApiError(404, 'User not found with given providerId')
    }
})

/**
 * * Fetches a users by email and password from database
 * * REQUEST: GET - email, password - Query
 * * RESPONSE: 200 OK - Json - User
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getUserByEmailAndPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.query as GetUserEmailAndPasswordReqQuery

    if (!email || !password) throw new ApiError(
        400, 'Bad Request: User email and password required.')

    try {
        const userData = await userRepo.getUserByEmailAndPassword(email, password)
        const user = userData.toObject()
        status200Ok(res).json(user)
    } catch (err) {
        throw new ApiError(404, 'User not found with given email and password')
    }
})

/**
 * * Creates a user in database
 * * REQUEST: POST - email, name, image, password, provider, providerId - Body
 * * RESPONSE: 201 Created with location - Json - User
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, image, password, provider, providerId } : CreateUserReqBody = req.body
    const hashedPassword = 
        password ? crypto.createHash('sha256').update(password).digest('hex') : undefined
    const createUserDTO = new CreateUserDTO(
        email, name, image, hashedPassword, provider, providerId)
    const user = await userRepo.createUser(createUserDTO)
    const userJson = user.toObject()
    status201CreatedWithLocation(res, `${apiUrls.users}/${userJson.id}`).json(userJson)
})

/**
 * * Updates a user in database
 * * REQUEST: PUT - id, image, name - Body
 * * RESPONSE: 204 No content
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id, image, name } : UpdateUserReqBody = req.body
    const updateUserDTO = new UpdateUserDTO(id, name, image)
    await userRepo.updateUser(updateUserDTO.id, updateUserDTO.image, updateUserDTO.name)
    status204NoContent(res)
})

/**
 * * Deletes a user by id from database
 * * REQUEST: PUT - id - Path
 * * RESPONSE: 204 No content
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    try {
        await userRepo.deleteUser(id)
        status204NoContent(res)
    } catch (err) {
        throw new ApiError(404, 'User not found with given id')
    }
})

export {
    getUsers,
    getUser,
    getUserByEmail,
    getUserByProviderId,
    getUserByEmailAndPassword,
    createUser,
    updateUser,
    deleteUser
}