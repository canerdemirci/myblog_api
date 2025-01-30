/**
 * @module
 * @class TagRepository
 * This repository used for crud operations at tags.
 */

import prismaClient from "../utils/prismaClient"

import CreateTagDTO from "../dtos/tag/CreateTagDTO"
import TagDTO from "../dtos/tag/TagDTO"

export default class TagRepository {
    /**
     * Creates a tag in the database.
     * @param createTagDTO CreateTagDTO
     * @throws Error
     * @returns Promise < TagDTO >
     */
    async createTag(createTagDTO: CreateTagDTO) : Promise<TagDTO> {
        const tag = await prismaClient.tag.create({
            data: { name: createTagDTO.name },
            include: { _count:true }
        })
        
        return TagDTO.fromDB(tag)
    }

    /**
     * Fetches all tags from the database.
     * @throws Error
     * @returns Promise < TagDTO[] >
     */
    async getTags() : Promise<TagDTO[]> {
        const tags = await prismaClient.tag.findMany({
            orderBy: { name: 'asc' },
            include: { _count: true },
        })

        return tags.map(t => TagDTO.fromDB(t))
    }

    /**
     * Fetches a tag by id from the database.
     * @param id string
     * @throws Error
     * @returns Promise < TagDTO[] >
     */
    async getTag(id: string) : Promise<TagDTO> {
        const tag = await prismaClient.tag.findFirstOrThrow({
            where: { id: id },
            include: { _count: true }
        })
        
        return TagDTO.fromDB(tag)
    }

    /**
     * Deletes a tag by id from the database.
     * @param id string
     * @throws Error
     * @returns Promise < void >
     */
    async deleteTag(id: string) : Promise<void> {
        await prismaClient.tag.delete({ where: { id: id } })
    }
}