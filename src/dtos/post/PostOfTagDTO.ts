/**
 * @module PostOfTagDTO
 * To use the fetched posts belongs the a tag comes from database.
 */

import { param } from 'express-validator'

function dateString(date: Date) : string {
    const pieces = date.toLocaleDateString().split('/')
    return [pieces[1], pieces[0], pieces[2]].join('.')
}

export default class PostOfTagDTO {
    private _id: string
    private _title: string
    private _createdAt: Date
    private _cover?: string

    constructor(id: string, title: string, createdAt: Date, cover?: string) {
        this._id = id
        this._title = title
        this._createdAt = createdAt
        this._cover = cover
    }

    get id() {
        return this._id
    }

    get title() {
        return this._title
    }

    get createdAt() {
        return this._createdAt
    }

    get cover() {
        return this._cover
    }

    static validationAndSanitizationSchema() {
        return [
            param('tag')
                .isString()
                .trim()
                .notEmpty().withMessage('Tag is required')
                .escape(),
        ]
    }

    static fromDB(post: any) : PostOfTagDTO {
        return new PostOfTagDTO(
            post.id,
            post.title,
            post.createdAt,
            post.cover,
        )
    }

    toObject() {
        return {
            id: this.id,
            title: this.title,
            createdAt: dateString(this.createdAt),
            cover: this.cover
        }
    }
}