/**
 * @module
 * @class UpdatePostDTO
 * Used to update post in database.
 */

import CreatePostDTO from "./CreatePostDTO"

export default class UpdatePostDTO extends CreatePostDTO {
    protected _id: string

    constructor(
        id: string,
        title: string,
        images: string[],
        content?: string,
        description?: string,
        cover?: string)
    {
        super(title, images, content, description, cover)
        this._id = id
    }

    get id() {
        return this._id
    }
}