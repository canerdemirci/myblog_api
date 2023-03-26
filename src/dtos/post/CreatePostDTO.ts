import joi from 'joi';

export default class CreatePostDTO {
    title: string;
    content?: string;

    constructor(title: string, content?: string) {
        this.title = title;
        this.content = content;
    }
    
    get prismaCreateData() {
        return {
            title: this.title,
            content: this.content
        };
    }

    applyFilter() {
        this.title = this.title.trim();
        this.content = this.content?.trim();
    }

    async validate() : Promise<any | never> {
        const scheme = joi.object({
            title: joi.string().max(255).required()
        });

        return await scheme.validateAsync({ title: this.title });
    }
}