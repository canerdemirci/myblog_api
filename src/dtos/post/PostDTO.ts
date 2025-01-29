/**
 * @module PostDTO
 * To use the fetched post object from database.
 */

import TagDTO from "../tag/TagDTO"
import CreatePostDTO from "./CreatePostDTO"
import { param, query } from 'express-validator'

function dateString(date: Date) : string {
    const pieces = date.toLocaleDateString().split('/')
    return [pieces[1], pieces[0], pieces[2]].join('.')
}

export default class PostDTO extends CreatePostDTO {
    protected _id: string
    protected _createdAt: Date
    protected _updatedAt: Date
    protected _tags: TagDTO[]
    protected _shareCount: number
    protected _likeCount: number
    protected _viewCount: number
    protected _commentCount?: number

    constructor(
        id: string,
        createdAt: Date,
        updatedAt: Date,
        title: string,
        images: string[],
        tags: TagDTO[],
        shareCount: number,
        likeCount: number,
        viewCount: number,
        commentCount?: number,
        content?: string,
        description?: string,
        cover?: string)
    {
        super(title, images, content, description, cover)

        this._id = id
        this._createdAt = createdAt
        this._updatedAt = updatedAt
        this._tags = tags
        this._shareCount = shareCount
        this._likeCount = likeCount
        this._viewCount = viewCount
        this._commentCount = commentCount
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

    get tags() {
        return this._tags
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

    get commentCount() {
        return this._commentCount
    }

    static validationAndSanitizationSchema() {
        return [
            param('id')
                .isString()
                .trim()
                .notEmpty()
                .withMessage('Post id is required').escape()
        ]
    }

    static validationAndSanitizationSchema2() {
        return [
            query('take')
                .isString()
                .optional()
                .trim()
                .escape(),
            query('skip')
                .isString()
                .optional()
                .trim()
                .escape(),
            query('tagId')
                .isString()
                .optional()
                .trim()
                .escape(),
        ]
    }

    static fromDB(post: any) : PostDTO {
        return new PostDTO(
            post.id,
            post.createdAt,
            post.updatedAt,
            post.title,
            post.images,
            post.tags,
            post.shareCount,
            post.likeCount,
            post.viewCount,
            // comment count
            post?._count?.comments,
            post.content,
            post.description,
            post.cover,
        )
    }

    toObject() {
        return {
            id: this.id,
            createdAt: dateString(this.createdAt),
            updatedAt: dateString(this.updatedAt),
            title: this.title,
            images: this.images,
            content: this.content,
            description: this.description,
            cover: this.cover,
            tags: this.tags,
            shareCount: this.shareCount,
            likeCount: this.likeCount,
            viewCount: this.viewCount,
            commentCount: this.commentCount
        }
    }
}