/**
 * @module NoteDTO
 * To use the fetched note object from database.
 */

import CreateNoteDTO from "./CreateNoteDTO"
import { param } from 'express-validator'

function dateString(date: Date) : string {
    const pieces = date.toLocaleDateString().split('/')
    return [pieces[1], pieces[0], pieces[2]].join('.')
}

export default class NoteDTO extends CreateNoteDTO {
    protected _id: string
    protected _createdAt: Date
    protected _updatedAt: Date
    protected _shareCount: number
    protected _likeCount: number
    protected _viewCount: number

    constructor(id: string, createdAt: Date, updatedAt: Date, content: string,
        images: string[], shareCount: number, likeCount: number, viewCount: number)
    {
        super(content, images)

        this._id = id
        this._createdAt = createdAt
        this._updatedAt = updatedAt
        this._shareCount = shareCount
        this._likeCount = likeCount
        this._viewCount = viewCount
    }

    get id() {
        return this._id
    }

    get createdAt() {
        return this._createdAt
    }

    get updatedAt() {
        return this._updatedAt
    }

    get shareCount() {
        return this._shareCount
    }

    get likeCount() {
        return this._likeCount
    }

    get viewCount() {
        return this._viewCount
    }

    static validationAndSanitizationSchema() {
        return [
            param('id')
                .isString()
                .trim()
                .notEmpty()
                .escape()
        ]
    }

    static fromDB(note: any) : NoteDTO {
        return new NoteDTO(
            note.id,
            note.createdAt,
            note.updatedAt,
            note.content,
            note.images,
            note.shareCount,
            note.likeCount,
            note.viewCount,
        )
    }

    toObject() {
        return {
            id: this.id,
            createdAt: dateString(this.createdAt),
            updatedAt: dateString(this.updatedAt),
            content: this.content,
            images: this.images,
            shareCount: this.shareCount,
            likeCount: this.likeCount,
            viewCount: this.viewCount
        }
    }
}