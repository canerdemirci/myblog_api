/**
 * @module postRepository
 * This repository used for crud operations at posts.
 */

import prismaClient from "../utils/prismaClient"
import PostDTO from "../dtos/post/PostDTO"
import CreatePostDTO from "../dtos/post/CreatePostDTO"
import UpdatePostDTO from "../dtos/post/UpdatePostDTO"
import CreateTagDTO from "../dtos/tag/CreateTagDTO"
import PostSearchResultDTO from "../dtos/post/PostSearchResultDTO"
import RelatedPostDTO from "../dtos/post/RelatedPostDTO"
import PostOfTagDTO from "../dtos/post/PostOfTagDTO"

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
                images: createPostDTO.images,
                content: createPostDTO.content,
                description: createPostDTO.description,
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
     * This function fetchs all posts with optional tag and limitation from database and returns
     * them as an Array of PostDTO.
     * If an error occurs it throws.
     * @returns Promise<PostDTO[]>
     */
    async getPosts(
        pagination?: { take: number, skip: number },
        byTagId?: string
    ) : Promise<PostDTO[]> {
        const posts = await prismaClient.post.findMany({
            include: {
                tags: true,
                _count: {
                    select: {
                        comments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            ...(byTagId && {
                where: {
                    tags: {
                        some: {
                            id: byTagId,
                        },
                    }
                },
            }),
            ...(pagination && { take: pagination.take, skip: pagination.skip })
        })

        return posts.map(p => PostDTO.fromDB(p))
    }

    /**
     * This function fetchs post search results.
     * If an error occurs it throws.
     * @param searchString string
     * @returns Promise < PostSearchResultDTO[] >
     */
    async getPostSearchResults(searchString: string) : Promise<PostSearchResultDTO[]> {
        const posts = await prismaClient.post.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: searchString,
                            mode: 'insensitive'
                        }
                    },
                    {
                        tags: {
                            some: {
                                name: searchString,
                            },
                        }
                    },
                    {
                        description: {
                            contains: searchString,
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            select: {
                id: true,
                title: true,
            }
        })

        return posts.map(p => PostSearchResultDTO.fromDB(p))
    }

    /**
     * This function fetchs related posts by tags maximum 6 piece.
     * If an error occurs it throws.
     * @param tags string[]
     * @returns Promise < RelatedPostDTO[] >
     */
    async getRelatedPosts(tags: string[]) : Promise<RelatedPostDTO[]> {
        const posts = await prismaClient.post.findMany({
            where: {
                tags: {
                    some: {
                        name: {
                            in: tags,
                        },
                    },
                }
            },
            select: {
                id: true,
                cover: true,
                createdAt: true,
                title: true,
            },
            take: 6,
        })

        return posts.map(p => RelatedPostDTO.fromDB(p))
    }

    /**
     * This function fetchs posts that belongs a tag.
     * If an error occurs it throws.
     * @param tag string
     * @returns Promise < PostOfTagDTO[] >
     */
    async getPostsOfTag(tag: string) : Promise<PostOfTagDTO[]> {
        const posts = await prismaClient.tag.findMany({
            where: {
                name: {
                    equals: tag,
                    mode: 'insensitive'
                }
            },
            select: {
                posts: {
                    select: {
                        id: true,
                        cover: true,
                        createdAt: true,
                        title: true,
                    }
                }
            }
        })

        return posts.at(0)?.posts.map(p => PostOfTagDTO.fromDB(p)) || [] as PostOfTagDTO[]
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
                images: newPost.images,
                content: newPost.content,
                description: newPost.description,
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

    /**
     * This function fetchs all post covers
     * If an error occurs it throws.
     * @returns Promise < string[] >
     */
    async getPostCoversList() : Promise<string[]> {
        const covers = await prismaClient.post.findMany({
            select: {
                cover: true
            },
            where: {
                cover: {
                    not: null
                }
            }
        })

        return covers
            .filter((c): c is { cover: string } => c.cover !== null && c.cover !== '')
            .map(c => c.cover)
    }

    /**
     * This function fetchs all post content images
     * If an error occurs it throws.
     * @returns Promise < string[] >
     */
    async getPostImagesList() : Promise<string[]> {
        const images = await prismaClient.post.findMany({
            select: {
                images: true
            },
            where: {
                images: {
                    isEmpty: false
                }
            }
        })

        return images.flatMap(i => i.images)
    }
}