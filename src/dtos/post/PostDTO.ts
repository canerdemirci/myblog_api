/**
 * @module PostDTO
 * To use the fetched post object from database.
 */

import CreatePostDTO from "./CreatePostDTO";

export default class PostDTO extends CreatePostDTO {
    private _id: string;
    private _createdAt: Date;
    private _updatedAt: Date;

    constructor(id: string, createdAt: Date, updatedAt: Date, title: string, content?: string) {
        super(title, content);

        this._id = id;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    get id() {
        return this._id;
    }

    get createdAt() {
        return this._createdAt;
    }

    get updatedAt() {
        return this._updatedAt;
    }

    static fromPost(post: any) : PostDTO {
        return new PostDTO(
            post.id,
            post.createdAt,
            post.updatedAt,
            post.title,
            post.content
        );
    }

    toObject() {
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            title: this.title,
            content: this.content
        }
    }
}