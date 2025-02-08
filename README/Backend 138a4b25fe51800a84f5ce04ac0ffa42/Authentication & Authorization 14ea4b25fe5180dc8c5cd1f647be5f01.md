# Authentication & Authorization

- Api key system used for block anonymous traffic.
- JWT tokens are utilized for authorizing both users and admins in the backend. Authentication processes such as sign-up, sign-in, and sign-out are managed collaboratively between the frontend and the backend.
    - Users stored in database.
    - Users can be authenticated email and password or providers like github, google.
- 6 digit pin used for authentication and access and refresh token used for admin authorization  in frontend.

## **The Api Key Security System for API of the Blog**

- **Backend**
    - In main file (index.ts) used a middleware: ***app.use(apiKeyAuth)***
    - /src/middleware/auth.ts contains ***apiKeyAuth*** middleware function
    - This function
        - If the key comes from client (x-api-key header) and that comes from .env file isn’t same sends 401 Unauthorized response.
        - This functions only gives permission to /api-docs (because swagger handle this) and /api/static routes without api key
    
    ### auth.ts
    
    ```jsx
    import { NextFunction, Request, Response } from 'express'
    import { status401Unauthorized } from '../controllers/responses'
    import { verifyJWT } from '../utils/jwt'
    import asyncHandler from 'express-async-handler'
    import UserRepository from '../repositories/user_repository'
    
    const userRepo = new UserRepository()
    
    /**
     * This middleware secures the api with a key
     * It compares the hashed api key which comes from .env file to hashed key which
     * comes from client side (request header) that hashed same method
     * If they are not same it sends 401 Unauthorized response.
     * It doesn't apply authentication for the route /api-docs/ because swagger handle this.
     */
    export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
        // Give permission to swagger ui
        if (req.path.includes('api-docs') || req.path.includes('/api/static/')) {
            return next()
        }
    
        const apiKey = process.env.API_KEY
        const clientApiKey = req.header('x-api-key')
    
        if (clientApiKey !== apiKey) {
            return status401Unauthorized(res).json({
                success: false,
                message: 'Unauthorized',
                stack: undefined,
            })
        }
        
        next()
    }
    
    /**
     * This middleware give permissions to some actions by looking a jwt token
     * to understand action owner is admin or a valid user.  
     */
    export const authMiddleware = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const token = req.headers['authorization']?.split(' ')[1]
            const adminToken = req.headers['x-admin'] as string
    
            if (adminToken) {
                const decoded = await verifyJWT(adminToken, process.env.USER_AUTH_SECRET!) as {
                    role: string
                }
    
                if (decoded.role === 'admin') {
                    return next()
                }
            }
            
            if (!token) {
                status401Unauthorized(res).json({
                    success: false,
                    message: 'Unauthorized',
                    stack: undefined,
                })
                return
            } else {
                const payloadData = await verifyJWT(token, process.env.USER_AUTH_SECRET!) as {
                    userId: string, email: string
                }
    
                if (!payloadData) {
                    status401Unauthorized(res).json({
                        success: false,
                        message: 'Unauthorized',
                        stack: undefined,
                    })
                    return
                } else {
                    try {
                        const user = await userRepo.getUser(payloadData.userId)
    
                        if (user.id !== payloadData.userId || user.email !== payloadData.email) {
                            status401Unauthorized(res).json({
                                success: false,
                                message: 'Unauthorized',
                                stack: undefined,
                            })
                            return
                        }
                    } catch (_) {
                        status401Unauthorized(res).json({
                            success: false,
                            message: 'Unauthorized',
                            stack: undefined,
                        })
                        return
                    }
                }
            }
    
            next()
        }
    )
    ```
    
    ### index.ts
    
    ```jsx
    // Only I can use this api with an api key
    app.use(apiKeyAuth)
    ```
    
- **Frontend**
    - In ./src/lib/custom_fetch.ts
        - Takes api key that comes from environment variables file
        - fetchBlogAPI (custom fetch function) puts a request header (x-api-key) contains api key in each request.
    
    ### ./src/lib/custom_fetch.ts
    
    ```jsx
    /**
     ** Custom fetch api function.
     ** set "x-api-key" header for blog api
     ** set "Authorization" header with user token (Bearer) for user authorization
     ** set "x-admin" header with admin token blog api for giving permission for some actions
     */
    export async function fetchBlogAPI(
        input: string | URL | globalThis.Request,
        init?: RequestInit,
        adminToken?: string,
        userTokenInfo?: UserTokenInfo
    ) : Promise<Response> {
        const _headers = new Headers()
    
        const userToken = !userTokenInfo
            ? undefined
            : await createUserToken(userTokenInfo?.userId, userTokenInfo?.email)
    
        _headers.append("x-api-key", process.env.NEXT_PUBLIC_API_KEY!)
    
        if (adminToken) _headers.append("x-admin", adminToken)
        if (userToken) _headers.append("Authorization", `Bearer ${userToken}`)
        
        const prexif = process.env.NEXT_PUBLIC_BLOG_API_BASE_URL!
    
        if (typeof input === 'string') {
            input = prexif + input
        }
    
        if (input instanceof URL) {
            input = new URL(prexif + input.pathname)
        }
    
        if (input instanceof Request) {
            input = new Request(prexif + input.url)
        }
    
        const response = await fetch(input, {
            ...init,
            headers: {
                ...Object.fromEntries(_headers.entries()),
                ...init?.headers
            }
        })
    
        if (!response.ok) {
            const j = await response.json()
    
            throw new ApiError({
                message: j.message,
                status: response.status
            })
        }
    
        return response
    }
    ```
    

## User Authentication and Authorization and Admin Authorization

User signs in, signs up, signs out. Authorization required for some actions. App gives permission to user or admin to make some actions such as commenting to a post. Backend needs to jwt token for user actions (that contains user id and email or {role: “admin”} object).

- Backend
    
    Actually, what the backend does is authorization, authentication made by frontend with **next-auth** library.
    
    ### Authentication middleware (authMiddleware): src/middleware/auth.ts
    
    ```jsx
    import { NextFunction, Request, Response } from 'express'
    import { status401Unauthorized } from '../controllers/responses'
    import { verifyJWT } from '../utils/jwt'
    import asyncHandler from 'express-async-handler'
    import UserRepository from '../repositories/user_repository'
    
    const userRepo = new UserRepository()
    
    /**
     * This middleware secures the api with a key
     * It compares the hashed api key which comes from .env file to hashed key which
     * comes from client side (request header) that hashed same method
     * If they are not same it sends 401 Unauthorized response.
     * It doesn't apply authentication for the route /api-docs/ because swagger handle this.
     */
    export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
        // Give permission to swagger ui
        if (req.path.includes('api-docs') || req.path.includes('/api/static/')) {
            return next()
        }
    
        const apiKey = process.env.API_KEY
        const clientApiKey = req.header('x-api-key')
    
        if (clientApiKey !== apiKey) {
            return status401Unauthorized(res).json({
                success: false,
                message: 'Unauthorized',
                stack: undefined,
            })
        }
        
        next()
    }
    
    /**
     * This middleware give permissions to some actions by looking a jwt token
     * to understand action owner is admin or a valid user.  
     */
    export const authMiddleware = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const token = req.headers['authorization']?.split(' ')[1]
            const adminToken = req.headers['x-admin'] as string
    
            if (adminToken) {
                const decoded = await verifyJWT(adminToken, process.env.USER_AUTH_SECRET!) as {
                    role: string
                }
    
                if (decoded.role === 'admin') {
                    return next()
                }
            }
            
            if (!token) {
                status401Unauthorized(res).json({
                    success: false,
                    message: 'Unauthorized',
                    stack: undefined,
                })
                return
            } else {
                const payloadData = await verifyJWT(token, process.env.USER_AUTH_SECRET!) as {
                    userId: string, email: string
                }
    
                if (!payloadData) {
                    status401Unauthorized(res).json({
                        success: false,
                        message: 'Unauthorized',
                        stack: undefined,
                    })
                    return
                } else {
                    try {
                        const user = await userRepo.getUser(payloadData.userId)
    
                        if (user.id !== payloadData.userId || user.email !== payloadData.email) {
                            status401Unauthorized(res).json({
                                success: false,
                                message: 'Unauthorized',
                                stack: undefined,
                            })
                            return
                        }
                    } catch (_) {
                        status401Unauthorized(res).json({
                            success: false,
                            message: 'Unauthorized',
                            stack: undefined,
                        })
                        return
                    }
                }
            }
    
            next()
        }
    )
    ```
    
    ### Using Example - comments.ts
    
    The middleware used for specific routes that is needed like [POST /comments/]
    
    ```jsx
    /**
     * @module
     ** ROUTES OF COMMENTS
     ** Authentication and validation middlewares are used in the following routes
     *----------------------------------------------------------------------------------------------
     * * GET:        /comments/bypostid/:postId          - Get comments by postId
     * * GET:        /comments/all                       - Get all comments
     * * GET:        /comments/:id                       - Get a comment by id
     * * POST:       /comments                           - Creates a comment
     * * PUT:        /comments                           - Updates a comment
     * * DELETE:     /comments/:id                       - Deletes a comment by id
     */
    
    import express, { Router } from 'express'
    
    import { validationErrorMiddleware } from '../middleware/error'
    import { authMiddleware } from '../middleware/auth'
    
    import {
        getAllComments,
        getComments,
        getComment,
        createComment,
        updateComment,
        deleteComment
    } from '../controllers/comment_controller'
    
    import CommentDTO from '../dtos/comment/CommentDTO'
    import CreateCommentDTO from '../dtos/comment/CreateCommentDTO'
    import UpdateCommentDTO from '../dtos/comment/UpdateCommentDTO'
    
    const commentRouter: Router = express.Router()
    
    // GET /comments/bypostid/:postId - Get comments by postId
    commentRouter.get(
        '/bypostid/:postId',
        CommentDTO.validationAndSanitizationSchema2(),
        validationErrorMiddleware,
        getComments
    )
    // GET  /comments/all  - Get all comments
    commentRouter.get(
        '/all',
        getAllComments
    )
    // GET    /comments/:id   - Get a comment by id
    commentRouter.get(
        '/:id',
        CommentDTO.validationAndSanitizationSchema(),
        validationErrorMiddleware,
        getComment
    )
    // POST   /comments   - Creates a comment
    commentRouter.post(
        '/',
        authMiddleware,
        CreateCommentDTO.validationAndSanitizationSchema(),
        validationErrorMiddleware,
        createComment
    )
    // PUT    /comments   - Updates a comment
    commentRouter.put(
        '/',
        authMiddleware,
        UpdateCommentDTO.validationAndSanitizationSchema(),
        validationErrorMiddleware,
        updateComment
    )
    // DELETE    /comments/:id   - Deletes a comment by id
    commentRouter.delete(
        '/:id',
        authMiddleware,
        CommentDTO.validationAndSanitizationSchema(),
        validationErrorMiddleware,
        deleteComment
    )
    
    export default commentRouter
    ```
    
- Frontend
    
    For next-auth quick setup: https://canerdemirciblog.hashnode.dev/how-to-set-up-nextauthjs-with-nextjs-14-app-router-and-typescript
    
    next-auth package used for blog users authentication.
    
    - File structure
        - Configurations: **src/app/api/auth/[…nextauth]/route.ts**
        - Register page: **src/app/(blog)/blog/register**
    
    There are providers (github, google, credentials etc.) in […nextauth]. Next-auth automatically creates siginin and signout pages. There are some constants in .env.local file: NEXTAUTH_URL (base url), NEXTAUTH_SECRET, GOOGLE_ID, GOOGLE_SECRET etc.
    
    In root layout, we wrap body content with SessionProvider for using useSession() in the app.
    
    There are two ways to use authentication session:
    
    - Client Side: **useSession()**
    - Server Side: **getServerSession()**
    
    ### useSession() Example - UserButton
    
    ```tsx
    'use client'
    
    import { useSession } from 'next-auth/react'
    import Image from 'next/image'
    import Link from 'next/link'
    import { MdAccountCircle, MdAppRegistration, MdLogin, MdLogout } from "react-icons/md"
    import { IoPersonCircle } from "react-icons/io5"
    import { routeMap } from '@/utils/routeMap'
    import { clsx } from 'clsx'
    
    export default function UserButton() {
        const { data: session } = useSession()
    
        return (
            <div className={clsx(['relative', 'group'])}>
                {/* User profile photo or Avatar icon */}
                {
                    session?.user?.image
                        ? <Image
                            width={36}
                            height={36}
                            src={session.user.image}
                            alt="Profil foto"
                            className={clsx([
                                'rounded-full', 'border-gray-400', 'border', 'cursor-pointer'
                            ])}
                        />
                        : <IoPersonCircle size={36} className={clsx(['dark:text-white'])} />
                }
                {/* Menu */}
                <div
                    className={clsx([
                        'absolute', 'hidden', 'w-28', 'left-[-7rem]', 'top-[-2px]', 'flex-col', 'group-hover:flex', 'bg-gray-300', 'shadow-xl', 'rounded-md'
                    ])}
                >
                    {/* Sign in */}
                    {
                        !session?.user &&
                        <Link
                            href="/api/auth/signin"
                            className={clsx([
                                'flex', 'justify-between', 'items-center', 'gap-2', 'p-2', 'hover:bg-gray-400', 'cursor-pointer', 'rounded-md'
                            ])}
                        >
                            <span>Giriş Yap</span>
                            <MdLogin />
                        </Link>
                    }
                    {/* Sign up */}
                    {
                        !session?.user && 
                        <Link
                            href={routeMap.blog.users.register.root}
                            className={clsx([
                                'flex', 'justify-between', 'items-center', 'gap-2', 'p-2', 'hover:bg-gray-400', 'cursor-pointer rounded-md'
                            ])}
                        >
                            <span>Üye Ol</span>
                            <MdAppRegistration />
                        </Link>
                    }
                    {/* Profile page */}
                    {
                        session?.user &&
                        <Link
                            href={routeMap.blog.users.profile.root}
                            className={clsx([
                                'flex', 'justify-between', 'items-center', 'gap-2', 'p-2', 'hover:bg-gray-400', 'cursor-pointer rounded-md'
                            ])}
                        >
                            <span>Profil</span>
                            <MdAccountCircle />
                        </Link>
                    }
                    {/* Sign out */}
                    {
                        session?.user &&
                        <Link
                            href="/api/auth/signout"
                            className={clsx([
                                'flex', 'justify-between', 'items-center', 'gap-2', 'p-2', 'hover:bg-gray-400', 'cursor-pointer', 'rounded-md'
                            ])}
                        >
                            <span>Çıkış Yap</span>
                            <MdLogout />
                        </Link>
                    }
                </div>
            </div>
        )
    }
    ```
    
    ### getServerSession() - Example - Profile Page
    
    ```tsx
    import { authOptions } from "@/utils/auth"
    import { routeMap } from "@/utils/routeMap"
    import { getServerSession } from "next-auth"
    import { redirect } from "next/navigation"
    import { getUserByEmail } from "@/blog_api_actions/user_repo"
    import UserForm from "./UserForm"
    
    export default async function ProfilePage() {
        const session = await getServerSession(authOptions)
    
        if (!session) {
            redirect(routeMap.blog.users.signin)
        }
    
        const user = await getUserByEmail(session.user!.email)
        
        return (
            <main>
                <UserForm user={user} />
            </main>
        )
    }
    ```
    
    ### […nextauth]/route.ts - NextAuth route handler
    
    ```tsx
    import { authOptions } from "@/utils/auth"
    import NextAuth from "next-auth"
    
    const handler = NextAuth(authOptions)
    
    export { handler as GET, handler as POST }
    ```
    
    ## ./src/utils/auth.ts - NextAuth options
    
    ```tsx
    import { AuthOptions } from "next-auth"
    
    // Providers
    import GoogleProvider from "next-auth/providers/google"
    import GithubProvider from "next-auth/providers/github"
    import CredentialsProvider from "next-auth/providers/credentials"
    
    import { createUser, getUser, getUserByEmailAndPassword, getUserByProviderId }
        from "@/blog_api_actions/user_repo"
    import { sha256 } from "@/utils"
    import { JWT } from "next-auth/jwt"
    
    export const authOptions: AuthOptions = {
        providers: [
            GoogleProvider({
                clientId: process.env.GOOGLE_ID!,
                clientSecret: process.env.GOOGLE_SECRET!,
            }),
            GithubProvider({
                clientId: process.env.GITHUB_ID!,
                clientSecret: process.env.GITHUB_SECRET!
            }),
            CredentialsProvider({
                id: 'credentials',
                type: 'credentials',
                name: 'credentials',
                // For next-auth to create form inputs for signin
                credentials: {
                    email: {
                        label: 'E-Posta',
                        placeholder: 'E-Posta',
                        type: 'text',
                    },
                    password: {
                        label: 'Parola',
                        type: 'password'
                    }
                },
                // If user with this credentials exists on database return user otherwise return null
                async authorize(credentials) {
                    if (credentials?.email && credentials?.password) {
                        try {
                            const hashedPassword = await sha256(credentials.password)
                            const user = await getUserByEmailAndPassword(credentials.email, hashedPassword)
                            return user
                        } catch (_) {
                            return null
                        }
                    }
    
                    return null
                }
            })
        ],
        // Session for one week
        session: {
            strategy: 'jwt',
            maxAge: 7 * 24 * 60 * 60
        },
        debug: false,
        callbacks: {
            // Add user provider id and provider to the token
            async jwt({ token, user, account }: { token: JWT, user?: any, account?: any }) {
                if (user) {
                    if (account && account.provider) {
                        token.id = account.providerAccountId
                        token.provider = account.provider
                    }
                }
    
                return token
            },
            // Fill session.user with db user with necessary information without password
            async session({ session, token }) {
                try {
                    const dbUser = token.provider === 'credentials'
                        ? await getUser(token.id!)
                        : await getUserByProviderId(token.id!)
    
                    if (session.user) {
                        session.user.id = dbUser.id
                        session.user.email = dbUser.email
                        session.user.name = dbUser.name
                        session.user.image = dbUser.image
                        session.user.provider = dbUser.provider
                        session.user.providerId = dbUser.providerId
                    }
    
                    return session
                } catch (_) {
                    throw new Error('Giriş başarısız bir hata oluştu!')
                }
            },
            // If the user is from providers then save it to the database.
            async signIn({ user, account }) {
                if (account?.provider === 'credentials') {
                    return true
                }
    
                const email = user.email! as string
                const provider = account?.provider as string
                const providerId = account?.providerAccountId as string
    
                try {
                    await getUserByProviderId(providerId)
                } catch (_) {
                    await createUser({
                        email: email,
                        name: user.name,
                        image: user.image!,
                        provider: provider,
                        providerId: providerId
                    })
                }
    
                return true
            },
            // Always redirect to base url
            async redirect() {
                return process.env.NEXTAUTH_URL!
            }
        }
    }
    ```
    
    ### fetchBlogAPI Function for Sending JWTs to Backend
    
    This custom fetch function sends Api key, admin token, user token to backend with headers.
    
    ```tsx
    /**
     ** Custom fetch api function.
     ** set "x-api-key" header for blog api
     ** set "Authorization" header with user token (Bearer) for user authorization
     ** set "x-admin" header with admin token blog api for giving permission for some actions
     */
    export async function fetchBlogAPI(
        input: string | URL | globalThis.Request,
        init?: RequestInit,
        adminToken?: string,
        userTokenInfo?: UserTokenInfo
    ) : Promise<Response> {
        const _headers = new Headers()
    
        const userToken = !userTokenInfo
            ? undefined
            : await createUserToken(userTokenInfo?.userId, userTokenInfo?.email)
    
        _headers.append("x-api-key", process.env.NEXT_PUBLIC_API_KEY!)
    
        if (adminToken) _headers.append("x-admin", adminToken)
        if (userToken) _headers.append("Authorization", `Bearer ${userToken}`)
        
        const prexif = process.env.NEXT_PUBLIC_BLOG_API_BASE_URL!
    
        if (typeof input === 'string') {
            input = prexif + input
        }
    
        if (input instanceof URL) {
            input = new URL(prexif + input.pathname)
        }
    
        if (input instanceof Request) {
            input = new Request(prexif + input.url)
        }
    
        const response = await fetch(input, {
            ...init,
            headers: {
                ...Object.fromEntries(_headers.entries()),
                ...init?.headers
            }
        })
    
        if (!response.ok) {
            const j = await response.json()
    
            throw new ApiError({
                message: j.message,
                status: response.status
            })
        }
    
        return response
    }
    ```
    
    ## Example of Sending Tokens
    
    This server action creates comment with admin and user token. Only admin or user creates comment.
    
    ```tsx
    /**
     * Creates a comment in the backend.
     * @param data CreatePostComment
     * @returns Promise < PostComment >
    */
    export async function createComment(
        data: CreatePostComment, adminToken?: string, userTokenInfo?: UserTokenInfo)
        : Promise<PostComment | never>
    {
        // Sanitize the given data
        data = {
            text: sanitizeHtml(data.text, {allowedTags: []}),
            postId: sanitizeHtml(data.postId, {allowedTags: []}),
            userId: sanitizeHtml(data.userId, {allowedTags: []}),
        }
    
        const response = await fetchBlogAPI(
            '/comments',
            {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            },
            adminToken,
            userTokenInfo
        )
    
        revalidateTag(commentCacheTag)
        revalidateTag(postsCacheTag)
        
        return await response.json() as PostComment
    }
    
    ...
    
    function handleSaveComment(event: FormEvent) {
        event.preventDefault()
    
        setCreatingEnd(false)
    
        if (user) {
            createComment({
                text: comment,
                postId: postId,
                userId: user.id
            }, undefined, { userId: user.id, email: user.email })
                .then(c => setComments(prev => [c, ...prev]))
                .catch(_ => alert('Hata! Yorum kaydedilemedi!'))
                .finally(() => {
                    setCreatingEnd(true)
                    setComment('')
                })
        }
    }
    ```
    

## The Admin Panel Authentication (Only Frontend)

For admin panel authentication used next js internal server side api routes, .env.local file for storing hashed pin code that used for admin login. Just next js used for authentication not an external api.

My hashnode article: https://canerdemirciblog.hashnode.dev/nextjs-14-admin-panel-security-using-jwt-and-pin-code-authentication-with-app-router

- JWT Tokens inside Cookies (Access token and Refresh Token)
    - Admin can browse admin routes thanks to access token cookie that lasts for 1 hour
    - If acces token cookie expires next js app router middleware requests to next js internal api route (/api/auth/refresh) for refresh token then this route creates new access token cookie for admin can continue to work. Refresh token cookie lasts for 7 days.
    - System verifies the tokens before using it always.
- Jose package for jwt
    - Jose package is compatible with Next JS Edge Runtime
- Structure
    
    /src
    
    middleware.ts.    → For protecting admin routes
    
    .env.local.            → It contains pin code (hashed) for login, secret for creating jwts
    
    /app
    
    (admin)
    
    /api.          → Next js internal api
    
    /auth
    
    /login.       → Login route
    
    /refresh.   → Route for refresh token logic
    
    /logout.    → Logout route
    
    /admin
    
    /login. → Admin Login Page Component
    
    /utils
    
    index.ts          → It contains sign jwt, verify jwt and other utility functions
    
    /lib
    
    axios.ts          → Axios instance for next js internal api and an instance for blog api
    

## Next JS Middleware - Protects Admin Panel Routes

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/utils'
import { routeMap } from './utils/routeMap'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from './app/api/auth/constants'
import { fetchNextAPI } from './lib/custom_fetch'

export async function middleware2(req: NextRequest) {
    const accessToken = await verifyJWT(
        req.cookies.get(ACCESS_TOKEN_NAME)?.value ?? '',
        process.env.SECRET! as string
    )

    if (accessToken) { return NextResponse.next() }

    const refreshToken = await verifyJWT(
        req.cookies.get(REFRESH_TOKEN_NAME)?.value ?? '',
        process.env.SECRET! as string
    )

    if (refreshToken) {
        const res = await fetchNextAPI(
            routeMap.api.refreshLogin.root,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            }
        )

        const decoded = res.headers.getSetCookie().toString().split(';')[0].split('=')[1]

        if (await verifyJWT(decoded, process.env.SECRET! as string)) {
            return NextResponse.next()
        }
    }

    return NextResponse.redirect(new URL(routeMap.admin.login.root, req.url))
}
```

## NextJS Api routes for setting access and refresh token cookies

### /api/auth/login/route.ts - Creates and responses Access and refresh tokens

```jsx
import { NextRequest, NextResponse } from 'next/server'
import { sha256, signJWT } from '@/utils'
import {
    ACCESS_TOKEN_NAME,
    REFRESH_TOKEN_NAME,
    ADMIN_ACCESS_TOKEN_PAYLOAD,
    ADMIN_ACCESS_TOKEN_EXPIRE,
    ADMIN_REFRESH_TOKEN_EXPIRE,
    ADMIN_ACCESS_COOKIE_CONFIG,
    ADMIN_REFRESH_COOKIE_CONFIG,
} from '../constants'

// Login next api route
export async function POST(req: NextRequest) {
    const { pin } = await req.json()

    const adminPin = process.env.ADMIN_PIN
    const hashedPin = await sha256(pin)

    if (hashedPin === adminPin) {
        try {
            const accessToken = await signJWT(
                ADMIN_ACCESS_TOKEN_PAYLOAD,
                process.env.SECRET! as string,
                ADMIN_ACCESS_TOKEN_EXPIRE
            )
            const refreshToken = await signJWT(
                ADMIN_ACCESS_TOKEN_PAYLOAD,
                process.env.SECRET! as string,
                ADMIN_REFRESH_TOKEN_EXPIRE
            )

            const response = NextResponse.json({ message: 'Authenticated' }, { status: 200 })

            response.cookies.set(
                ACCESS_TOKEN_NAME,
                accessToken,
                ADMIN_ACCESS_COOKIE_CONFIG
            )
            response.cookies.set(
                REFRESH_TOKEN_NAME,
                refreshToken,
                ADMIN_REFRESH_COOKIE_CONFIG
            )

            return response
        } catch (_) {
            return NextResponse.json({ message: 'Invalid PIN' }, { status: 401 })
        }
    } else {
        return NextResponse.json({ message: 'Invalid PIN' }, { status: 401 })
    }
}
```

### /api/auth/refresh/route.ts - Creates new access token with refresh token

```jsx
import { NextRequest, NextResponse } from 'next/server'
import { signJWT } from '@/utils'
import {
    ACCESS_TOKEN_NAME,
    ADMIN_ACCESS_COOKIE_CONFIG,
    ADMIN_ACCESS_TOKEN_EXPIRE
} from '../constants'

export async function POST(req: NextRequest) {
    const { refreshToken } = await req.json()

    if (refreshToken) {
        try {
            const newAccessToken = await signJWT(
                { role: (refreshToken as any).role },
                process.env.SECRET! as string,
                ADMIN_ACCESS_TOKEN_EXPIRE
            )

            const response = NextResponse.json({ message: 'Token refreshed' }, { status: 200 })

            response.cookies.set(
                ACCESS_TOKEN_NAME,
                newAccessToken,
                ADMIN_ACCESS_COOKIE_CONFIG
            )

            return response
        } catch (_) {
            return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 })
        }
    } else {
        return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 })
    }
}
```

### /api/auth/logout/route.ts - Clears access and refresh token cookies

```jsx
import { NextResponse } from 'next/server'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '../constants'

export async function GET() {
    try {
        const response = NextResponse.json({ message: 'Logged out.' }, { status: 200 })

        response.cookies.set(ACCESS_TOKEN_NAME, '', { maxAge: 0 })
        response.cookies.set(REFRESH_TOKEN_NAME, '', { maxAge: 0 })
    
        return response
    } catch (_) {
        return NextResponse.json({ message: 'Logout failed' }, { status: 500 })
    }
}
```