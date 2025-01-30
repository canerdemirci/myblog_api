/**
 * @module
 * @class PostSearchResultDTO
 * To use the fetched post search results from database.
 */

import { param } from 'express-validator'

export default class PostSearchResultDTO {
    private _id: string
    private _title: string

    constructor(id: string, title: string) {
        this._id = id
        this._title = title
    }

    get id() {
        return this._id
    }

    get title() {
        return this._title
    }

    static validationAndSanitizationSchema() {
        return [
            param('query')
                .isString()
                .trim()
                .escape()
        ]
    }

    static fromDB(post: any) : PostSearchResultDTO {
        return new PostSearchResultDTO(
            post.id,
            post.title,
        )
    }

    toObject() {
        return {
            id: this.id,
            title: this.title,
        }
    }
}