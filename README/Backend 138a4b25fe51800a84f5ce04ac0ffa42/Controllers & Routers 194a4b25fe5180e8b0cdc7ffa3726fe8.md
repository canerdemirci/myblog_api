# Controllers & Routers

The app uses **controllers** to handle incoming requests and produce responses. Controllers rely on **repository classes** to perform database operations and utilize a **NodeCache instance** for caching. Typically, controllers do not include `try-catch` blocks because error handling is centralized in a dedicated **error-handling middleware**.

**Routers** are responsible for organizing controller functions and integrating middleware such as **validation chains**, **validation middleware**, and **authentication middleware**.

### Sample from post controller

```tsx
/**
 * * Fetches all posts with optional tag and limitation from database or chache
 * * REQUEST: GET - take, skip, tagId - Query
 * * RESPONSE: 200 OK - Json - Post[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getPosts = asyncHandler(async (req: Request, res: Response) => {
    const { take, skip, tagId } = req.query as GetPostsReqQuery

    const takeNumber = take ? (isNaN(parseInt(take)) ? undefined : parseInt(take)) : undefined
    const skipNumber = skip ? (isNaN(parseInt(skip)) ? undefined : parseInt(skip)) : undefined
    if (takeNumber !== undefined && skipNumber !== undefined) {
        if (takeNumber < 1 || skipNumber < 0) {
            throw new ApiError(400, 'Invalid take or skip number')
        }
    }
    
    const chacheKey =
        (takeNumber !== undefined && skipNumber !== undefined)
            ? (`post-${takeNumber}-${skipNumber}` + (!tagId ? '' : `-${tagId}`))
            : ('post-' + (!tagId ? 'all' : `-${tagId}`))
    
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const postsData =
            (takeNumber !== undefined && skipNumber !== undefined)
                ? await postRepo.getPosts({ take: takeNumber, skip: skipNumber }, tagId)
                : await postRepo.getPosts(undefined, tagId)
                
        const posts = postsData.map((p: PostDTO) => p.toObject())
        cacher.set(chacheKey, posts, 60 * 60 * 24 * 7)
        status200Ok(res).json(posts)
    } else {
        status200Ok(res).json(chacedData)
    }
})
```

### Sample from post router

```tsx
// GET: /posts - Get posts by optional pagination and tag
postRouter.get(
    '/',
    PostDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getPosts
)
...
// POST: /posts - Creates a post
postRouter.post(
    '/',
    authMiddleware,
    CreatePostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createPost
)
```