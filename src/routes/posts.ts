/**
 * @module postsRouter
 * Post routes
 */

import express, { Router } from 'express';
import { createPost, getPosts, getPost, deletePost, updatePost } from '../controllers/postController';

const router: Router = express.Router();

router.post('/', createPost);
router.get('/', getPosts);
router.get('/:id', getPost);
router.delete('/:id', deletePost);
router.put('/', updatePost);

export default router;