/**
 * @module
 ** ROUTES OF USERS
 ** Authentication and validation middlewares are used in the following routes
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

import express, { Router } from 'express'
import { validationErrorMiddleware } from '../middleware/error'
import { authMiddleware } from '../middleware/auth'

import {
    getUsers,
    getUser,
    getUserByEmail,
    getUserByEmailAndPassword,
    getUserByProviderId,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/user_controller'

import UserDTO from '../dtos/user/UserDTO'
import CreateUserDTO from '../dtos/user/CreateUserDTO'
import UpdateUserDTO from '../dtos/user/UpdateUserDTO'

const userRouter: Router = express.Router()

// GET: /users - Get all users
userRouter.get('/', getUsers)
// GET: /users/search/:id - Get a user by id
userRouter.get(
    '/search/:id',
    UserDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getUser
)
// GET: /users/search/byemail/:email - Get a user by email
userRouter.get(
    '/search/byemail/:email',
    UserDTO.validationAndSanitizationSchema4(),
    validationErrorMiddleware,
    getUserByEmail
)
// GET: /users/search/byprovider/:providerId - Get a user by provider id
userRouter.get(
    '/search/byprovider/:providerId',
    UserDTO.validationAndSanitizationSchema3(),
    validationErrorMiddleware,
    getUserByProviderId
)
// GET: /users/search - Get a user by email and password
userRouter.get(
    '/search',
    UserDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getUserByEmailAndPassword
)
// POST: /users - Creates a user
userRouter.post(
    '/',
    CreateUserDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createUser
)
// PUT: /users - Updates a user
userRouter.put(
    '/',
    authMiddleware,
    UpdateUserDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    updateUser
)
// DELETE: /users/:id - Deletes a user by id
userRouter.delete(
    '/:id',
    authMiddleware,
    UserDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deleteUser
)

export default userRouter