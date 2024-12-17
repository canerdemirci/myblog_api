/**
 * @module usersRouter
 * User routes
 */

import express, { Router } from 'express'
import { validationErrorMiddleware } from '../middleware/error'
import { createUser, deleteUser, getUser, getUserByEmailAndPassword, getUserByProviderId, getUsers } from '../controllers/user_controller'
import UserDTO from '../dtos/user/UserDTO'
import CreateUserDTO from '../dtos/user/CreateUserDTO'

const userRouter: Router = express.Router()

userRouter.use(validationErrorMiddleware)
userRouter.get('/', getUsers)
userRouter.get(
    '/search/:id',
    UserDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getUser
)
userRouter.get(
    '/search/byprovider/:providerId',
    UserDTO.validationAndSanitizationSchema3(),
    validationErrorMiddleware,
    getUserByProviderId
)
userRouter.get(
    '/search',
    UserDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getUserByEmailAndPassword
)
userRouter.post(
    '/',
    CreateUserDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createUser
)
userRouter.delete(
    '/:id',
    UserDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deleteUser
)

export default userRouter