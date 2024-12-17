/**
 * @module CreateUserPostInteractionDTO
 * Used to create user post interactions in database.
 */

import { InteractionType, Role } from '@prisma/client'
import { body } from 'express-validator'
import CreatePostInteractionDTO from './CreatePostInteractionDTO'

export default class CreateUserPostInteractionDTO extends CreatePostInteractionDTO {
    constructor(type: InteractionType, postId: string, userId: string) {
        super(Role.USER, type, postId, undefined, userId)
    }

    static validationAndSanitizationSchema() {
        return [
            body('type')
                .isString()
                .notEmpty().withMessage('Interaction type cannot be empty')
                .trim()
                .escape(),
            body('postId')
                .isString()
                .notEmpty().withMessage('Post Id cannot be empty.')
                .trim()
                .escape(),
            body('userId')
                .isString()
                .notEmpty().withMessage('userId cannot be empty.')
                .trim()
                .escape()
        ]
    }
}