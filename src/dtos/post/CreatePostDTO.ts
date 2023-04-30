/**
 * @module CreatePostDTO
 * Used to create post in database.
 */

import joi from 'joi';

export default class CreatePostDTO {
    title: string;
    content?: string;

    constructor(title: string, content?: string) {
        this.title = title;
        this.content = content;
    }
    
    /**
     * Object to send prisma for create post
     */
    get prismaCreateData() {
        return {
            title: this.title,
            content: this.content
        };
    }

    /**
     * Trim title and content
     */
    applyFilter() {
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
            title: joi.string().max(255).required()
        });

        return await scheme.validateAsync({ title: this.title });
    }
}