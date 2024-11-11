/**
 * @module tagRepository
 * This repository used for crud operations at tags.
 */

import prismaClient from "../utils/prismaClient"
import CreateTagDTO from "../dtos/tag/CreateTagDTO"
import TagDTO from "../dtos/tag/TagDTO"

export default class TagRepository {
    /**
     * This function takes CreateTagDTO then creates a tag in the database.
     * Then returns it as a TagDTO.
     * If an error occurs it throws.
     * @param createTagDTO CreateTagDTO
     * @returns Promise<TagDTO>
     */
    async createTag(createTagDTO: CreateTagDTO) : Promise<TagDTO> {
        const tag = await prismaClient.tag.create({
            data: { name: createTagDTO.name },
            include: { _count:true }
        })
        
        return TagDTO.fromDB(tag)
    }

    /**
     * This function fetchs all tags from database and returns
     * them as an Array of TagDTO.
     * If an error occurs it throws.
     * @returns Promise<TagDTO[]>
     */
    async getTags() : Promise<TagDTO[]> {
        const tags = await prismaClient.tag.findMany({
            orderBy: { name: 'asc' },
            include: { _count: true },
        })

        return tags.map(t => TagDTO.fromDB(t))
    }

    /**
     * This function fetchs a tag by id from database.
     * Then returns it as a TagDTO.
     * If an error occurs it throws.
     * @param id string
     * @returns Promise<TagDTO>
     */
    async getTag(id: string) : Promise<TagDTO> {
        const tag = await prismaClient.tag.findFirstOrThrow({
            where: { id: id },
            include: { _count: true }
        })
        
        return TagDTO.fromDB(tag)
    }

    /**
     * This function deletes a tag by given id.
     * Prisma disconnects tag to post connections when it deletes the tag
     * If an error occurs it throws.
     * @param id string
     * @returns Promise<void>
     */
    async deleteTag(id: string) : Promise<void> {
        await prismaClient.tag.delete({ where: { id: id } })
    }
}