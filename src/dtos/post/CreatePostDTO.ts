/**
 * @module CreatePostDTO
 * Used to create post in database.
 */

import { body } from 'express-validator'

export default class CreatePostDTO {
    protected _title: string
    protected _images: string[]
    protected _content?: string
    protected _description?: string
    protected _cover?: string

    constructor(
        title: string,
        images: string[],
        content?: string,
        description?: string,
        cover?: string)
    {
        this._title = title
        this._images = images
        this._content = content
        this._description = description
        this._cover = cover
    }

    get title() {
        return this._title
    }

    get images() {
        return this._images
    }

    get content() {
        return this._content
    }

    get description() {
        return this._description
    }

    get cover() {
        return this._cover
    }

    static validationAndSanitizationSchema() {
        return [
            body('title')
                .isString()
                .notEmpty().withMessage('Post title cannot be empty')
                .isLength({max: 255}).withMessage('Post title can be 255 character long')
                .trim()
                .escape(),
            body('images')
                .isArray().withMessage('Image array is required wheter is empty or not.'),
            body('images.*')
                .trim()
                .escape(),
            body('content')
                .optional({values: 'falsy'})
                .trim()
                .isString(),
            body('description')
                .optional({values: 'falsy'})
                .isString()
                .isLength({max: 160}).withMessage(
                    'Post description cannot be longer than 160 characters.')
                .trim()
                .escape(),
            body('cover')
                .optional({values: 'falsy'})
                .isString()
                .trim()
                .escape(),
            body('tags')
                .isArray().withMessage('Tag array is required wheter is empty or not.'),
            body('tags.*')
                .isString()
                .notEmpty().withMessage('Tag name cannot be empty')
                .isLength({max: 100}).withMessage('Tag name can be 100 character long')
                .trim()
                .escape(),
        ]
    }
}