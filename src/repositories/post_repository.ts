/**
 * @module postRepository
 * This repository used for crud operations at posts.
 */

import prismaClient from "../utils/prismaClient"
import PostDTO from "../dtos/post/PostDTO"
import CreatePostDTO from "../dtos/post/CreatePostDTO"
import UpdatePostDTO from "../dtos/post/UpdatePostDTO"
import CreateTagDTO from "../dtos/tag/CreateTagDTO"

export default class PostRepository {
    /**
     * This function takes CreatePostDTO and CreateTagDTOS then creates a post in the database.
     * Then returns it as a PostDTO.
     * If an error occurs it throws.
     * @param createPostDTO CreatePostDTO
     * @returns Promise<PostDTO>
     */
    async createPost(createPostDTO: CreatePostDTO, createTagDTOS: CreateTagDTO[]) :         
        Promise<PostDTO> {
        const post = await prismaClient.post.create({
            data: {
                title: createPostDTO.title,
                content: createPostDTO.content,
                cover: createPostDTO.cover,
                tags: {
                    connectOrCreate: createTagDTOS.map(t => ({
                        create: { name: t.name },
                        where: { name: t.name }
                    }))
                }
            }
        })

        return PostDTO.fromDB(post)
    }

    /**
     * This function fetchs all posts from database and returns
     * them as an Array of PostDTO.
     * If an error occurs it throws.
     * @returns Promise<PostDTO[]>
     */
    async getPosts() : Promise<PostDTO[]> {
        const posts = await prismaClient.post.findMany({
            include: { tags: true },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return posts.map(p => PostDTO.fromDB(p))
    }

    /**
     * This function fetchs a post by id from database.
     * Then returns it as a PostDTO.
     * If an error occurs it throws.
     * @param id string
     * @returns Promise<PostDTO>
     */
    async getPost(id: string) : Promise<PostDTO> {
        const post = await prismaClient.post.findFirstOrThrow(
            { where: { id: id }, include: { tags: true } })
        
        return PostDTO.fromDB(post)
    }

    /**
     * This function deletes a post by given id.
     * Prisma disconnects tag to post connections when it deletes the post
     * If an error occurs it throws.
     * @param id string
     * @returns Promise<void>
     */
    async deletePost(id: string) : Promise<void> {
        await prismaClient.post.delete({ where: { id: id } })
    }

    /**
     * This function updates a post and its tags with new post (UpdatePostDTO)
     * and new tags (CreateTagDTOs)
     * If an error occurs it throws.
     * @param newPost UpdatePostDTO
     * @returns Promise<void>
     */
    async updatePost(newPost: UpdatePostDTO, createTagDTOS: CreateTagDTO[]) : Promise<void> {
        // Fetch tags of the post
        const tagsInOldPost = await prismaClient.post.findFirstOrThrow({
            where: { id: newPost.id },
            select: { tags: true }
        })

        // If there is a tag in the post which there isn't in the new post
        // remove that tag to post connection
        const tagsWillBeRemovedFromPost: {name: string}[] = []
        
        tagsInOldPost.tags.forEach(to => {
            if (!createTagDTOS.map(t => t.name).includes(to.name)) {
                tagsWillBeRemovedFromPost.push({name: to.name})
            }
        })

        await prismaClient.post.update({
            where: { id: newPost.id },
            data: {
                title: newPost.title,
                content: newPost.content,
                cover: newPost.cover,
                tags: {
                    connectOrCreate: createTagDTOS.map(t => ({
                        create: { name: t.name },
                        where: { name: t.name }
                    })),
                    disconnect: tagsWillBeRemovedFromPost
                }
            }
        })
    }
}