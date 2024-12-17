/**
 * @module userController
 * Get users, get an user, create an user, delete an user
 * Sanitizing, Validation and Error handling happens in middlewares and routers.
 */

import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { chacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'
import CreateUserDTO from '../dtos/user/CreateUserDTO'
import UserRepository from '../repositories/user_repository'
import UserDTO from '../dtos/user/UserDTO'
import crypto from 'crypto'

const userRepo = new UserRepository()

/**
 * * Acquires From REQUEST BODY: email, password
 * * Creates an User with CreateUserDTO
 * * Converts the User to Object
 * * SENDS: User json - 201 Created - With location
 * 
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, image, password, provider, providerId } :
        { email: string, name?: string, image?: string, password?: string,
            provider?: string, providerId?: string } = req.body
    const hashedPassword = 
        password ? crypto.createHash('sha256').update(password).digest('hex') : undefined
    const createUserDTO = new CreateUserDTO(
        email, name, image, hashedPassword, provider, providerId)
    const user = await userRepo.createUser(createUserDTO)
    const userJson = user.toObject()
    status201CreatedWithLocation(res, `${apiUrls.users}/${userJson.id}`).json(userJson)
})

/**
 * * Fetches all users from database or chache
 * * SENDS: User[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'users'
    const chacedData = chacher.get(chacheKey)

    if (!chacedData) {
        const usersData = await userRepo.getUsers()
        const users = usersData.map((u: UserDTO) => u.toObject())
        status200Ok(res).json(users)
        chacher.set(chacheKey, users, 300)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Acquires from REQUEST PARAMS: id
 * * Fetches an user by id from database
 * * SENDS: Tag json - 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getUser = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    if (!id) throw new ApiError(400, 'Bad Request: User id required.')

    try {
        const userData = await userRepo.getUser(id)
        const user = userData.toObject()
        status200Ok(res).json(user)
    } catch (err) {
        throw new ApiError(404, 'User not found with given id')
    }
})

/**
 * * Acquires from REQUEST PARAMS: providerId
 * * Fetches an user by providerId from database
 * * SENDS: Tag json - 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getUserByProviderId = asyncHandler(async (req: Request, res: Response) => {
    const providerId: string = req.params.providerId

    if (!providerId) throw new ApiError(400, 'Bad Request: User providerId required.')

    try {
        const userData = await userRepo.getUserByProviderId(providerId)
        const user = userData.toObject()
        status200Ok(res).json(user)
    } catch (err) {
        throw new ApiError(404, 'User not found with given providerId')
    }
})

/**
 * * Acquires from REQUEST PARAMS: email, password
 * * Fetches an user by email and password from database or chache
 * * SENDS: Tag json - 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getUserByEmailAndPassword = asyncHandler(async (req: Request, res: Response) => {
    const email: string = req.query.email as string
    const password: string = req.query.password as string

    if (!email || !password) throw new ApiError(400,
        'Bad Request: User email and password required.')

    try {
        const userData = await userRepo.getUserByEmailAndPassword(email, password)
        const user = userData.toObject()
        status200Ok(res).json(user)
    } catch (err) {
        throw new ApiError(404, 'User not found with given email and password')
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
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    if (!id) throw new ApiError(400, 'Bad Request: User id required.')

    try {
        await userRepo.deleteUser(id)
        status204NoContent(res)
    } catch (err) {
        throw new ApiError(404, 'User not found with given id')
    }
})

export {
    createUser,
    getUsers,
    getUser,
    getUserByProviderId,
    getUserByEmailAndPassword,
    deleteUser
}