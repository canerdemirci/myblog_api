/**
 * @module usersRouter
 * User routes
 */

import express, { Router } from 'express'
import { validationErrorMiddleware } from '../middleware/error'
import {
    createUser,
    deleteUser,
    getUser,
    getUserByEmail,
    getUserByEmailAndPassword,
    getUserByProviderId,
    getUsers,
    updateUser
} from '../controllers/user_controller'
import UserDTO from '../dtos/user/UserDTO'
import CreateUserDTO from '../dtos/user/CreateUserDTO'
import UpdateUserDTO from '../dtos/user/UpdateUserDTO'
import { authMiddleware } from '../middleware/auth'

const userRouter: Router = express.Router()

userRouter.get('/', getUsers)
userRouter.get(
    '/search/:id',
    UserDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getUser
)
userRouter.get(
    '/search/byemail/:email',
    UserDTO.validationAndSanitizationSchema4(),
    validationErrorMiddleware,
    getUserByEmail
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
userRouter.put(
    '/',
    authMiddleware,
    UpdateUserDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    updateUser
)
userRouter.delete(
    '/:id',
    authMiddleware,
    UserDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deleteUser
)

export default userRouter