/**
 * @module CreateGuestPostInteractionDTO
 * Used to create post interactions in database.
 */

import { InteractionType, Role } from '@prisma/client'
import { body } from 'express-validator'
import CreatePostInteractionDTO from './CreatePostInteractionDTO'

export default class CreateGuestPostInteractionDTO extends CreatePostInteractionDTO {
    protected _requesterIp: string

    constructor(type: InteractionType, postId: string, guestId: string, requesterIp: string) {
        super(Role.GUEST, type, postId, guestId + '-' + requesterIp, undefined)

        this._requesterIp = requesterIp
    }

    get requesterIp() {
        return this._requesterIp
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
            body('guestId')
                .isString()
                .notEmpty().withMessage('guestId cannot be empty.')
                .trim()
                .escape()
        ]
    }
}