/**
 * @module TagDTO
 * To use the fetched tag object from database.
 */

import CreateTagDTO from "./CreateTagDTO"
import { body } from 'express-validator'

export default class TagDTO extends CreateTagDTO {
    protected _id: string
    protected _postCount: number

    constructor(id: string, name: string, postCount: number) {
        super(name)

        this._id = id
        this._postCount = postCount
    }

    get id() {
        return this._id
    }

    get postCount() {
        return this._postCount
    }

    static validationAndSanitizationSchema() {
        return [body('id').escape()]
    }

    static fromDB(tag: any) : TagDTO {
        return new TagDTO(
            tag.id,
            tag.name,
            tag._count.posts
        )
    }

    toObject() {
        return {
            id: this.id,
            name: this.name,
            postCount: this.postCount
        }
    }
}