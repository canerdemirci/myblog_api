/**
 * @module UpdatePostDTO
 * Used to update post in database.
 */

import CreatePostDTO from "./CreatePostDTO";
import joi from 'joi';

export default class UpdatePostDTO extends CreatePostDTO {
    id: string;

    constructor(id: string, title: string, content?: string) {
        super(title, content);
        this.id = id;
    }

    /**
     * Object to send prisma for update post
     */
    get prismaUpdateData() {
        return {
            id: this.id,
            title: this.title,
            content: this.content
        };
    }

    applyFilter() {
        this.id = this.id.trim();
        this.title = this.title.trim();
        this.content = this.content?.trim();
    }

    /**
     * Validate given title string
     * Throw ValidationError if it fails
     * @returns Promise<any>
     */
    async validate() : Promise<any | never> {
        const scheme = joi.object({
            id: joi.string().required(),
            title: joi.string().max(255).required()
        });

        return await scheme.validateAsync({ id: this.id, title: this.title });
    }
}