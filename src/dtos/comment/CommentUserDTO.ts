/**
 * @module CommentUserDTO
 * An object that contains some user infos for comments.
 */

export default class CommentUserDTO {
    private _id: string
    private _email: string
    private _name?: string
    private _image?: string

    constructor(id: string, email: string, name?: string, image?: string) {
        this._id = id
        this._email = email
        this._name = name
        this._image = image
    }

    get id() {
        return this._id
    }

    get email() {
        return this._email
    }

    get name() {
        return this._name
    }

    get image() {
        return this._image
    }

    static fromDB(user: any) : CommentUserDTO {
        return new CommentUserDTO(
            user.id,
            user.email,
            user.name,
            user.image,
        )
    }

    toObject() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            image: this.image,
        }
    }
}