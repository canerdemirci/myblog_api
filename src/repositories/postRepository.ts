import prismaClient from "../utils/prismaClient";
import PostDTO from "../dtos/post/PostDTO";
import CreatePostDTO from "../dtos/post/CreatePostDTO";
import UpdatePostDTO from "../dtos/post/UpdatePostDTO";

const createPost = async (createPostDTO: CreatePostDTO) : Promise<PostDTO> => {
    const post = await prismaClient.post.create({ data: createPostDTO.prismaCreateData });
    const postDTO = PostDTO.fromPost(post);

    return postDTO;
}

const getPosts = async () => {
    const posts = await prismaClient.post.findMany();
    const postDTOs = posts.map(p => PostDTO.fromPost(p));

    return postDTOs;
}

const getPost = async (id: string) =>
    PostDTO.fromPost(await prismaClient.post.findFirstOrThrow({
        where: {
            id: id
        }
    }));

const deletePost = async (id: string) =>
    await prismaClient.post.delete({
        where: {
            id: id
        }
    });

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