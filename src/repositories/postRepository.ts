/**
 * @module postRepository
 * This repository used for crud operations at posts.
 */

import prismaClient from "../utils/prismaClient";
import PostDTO from "../dtos/post/PostDTO";
import CreatePostDTO from "../dtos/post/CreatePostDTO";
import UpdatePostDTO from "../dtos/post/UpdatePostDTO";

/**
 * This function takes CreatePostDTO then creates a post in the database.
 * Then returns it as a PostDTO.
 * If an error occurs it throws.
 * @param createPostDTO CreatePostDTO
 * @returns PostDTO
 */
const createPost = async (createPostDTO: CreatePostDTO) : Promise<PostDTO> => {
    const post = await prismaClient.post.create({ data: createPostDTO.prismaCreateData });
    const postDTO = PostDTO.fromPost(post);

    return postDTO;
}

/**
 * This function fetchs all posts from database and returns
 * them as an Array of PostDTO.
 * If an error occurs it throws.
 * @returns PostDTO[]
 */
const getPosts = async () => {
    const posts = await prismaClient.post.findMany();
    const postDTOs = posts.map(p => PostDTO.fromPost(p));

    return postDTOs;
}

/**
 * This function fetchs a post by id from database.
 * Then returns it as a PostDTO.
 * If an error occurs it throws.
 * @param id string
 * @returns PostDTO
 */
const getPost = async (id: string) =>
    PostDTO.fromPost(await prismaClient.post.findFirstOrThrow({
        where: {
            id: id
        }
    }));

/**
 * This function deletes a post by given id.
 * If an error occurs it throws.
 * @param id string
 * @returns void
 */
const deletePost = async (id: string) =>
    await prismaClient.post.delete({
        where: {
            id: id
        }
    });

/**
 * This function updates a post with new post (UpdatePostDTO)
 * If an error occurs it throws.
 * @param newPost UpdatePostDTO
 * @returns void
 */
const updatePost = async (newPost: UpdatePostDTO) =>
    await prismaClient.post.update({
        where: {
            id: newPost.id
        },
        data: newPost.prismaUpdateData
    });

export {
    createPost,
    getPosts,
    getPost,
    deletePost,
    updatePost
}