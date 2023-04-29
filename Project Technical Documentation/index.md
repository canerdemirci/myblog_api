# My Blog - Project Technical Notes
---
##### Preparation Typescript with linter and code documentation tools (tsdoc, typedoc)

> **In this project EsLint isn't included**

> [Instructions](./Creating-TypeScript-Project-with-Linter-and-Code-Documentation-Tools.md)

##### Technologies
- Backend
    - NodeJS with TypeScript
    - Express
    - PostgreSQL with Prisma ORM
- Frontend

##### Folder Structure

- docs - Documentation output files (html)
- logs - Daily log files
- prisma - Prisma migrations, schemas etc...
- src - Code files
    - controllers
        - postController.ts
        - responses.ts
    - dtos
        - post
            - CreatePostDTO.ts
            - PostDTO.ts
            - UpdatePostDTO.ts
    - middleware
        - error.middleware.ts
        - morgan.middleware.ts
    - repositories
        - postRepository.ts
    - routes
        - posts.ts
    - utils
        - logger.ts
        - prismaClient.ts
    - index.ts
- swagger
    - swagger.yaml
- .env
- .gitignore
- LICENSE
- package-lock.json
- package.json
- README.md
- tsconfig.json
- tsdoc.json
- typedoc.json



##### Routes

/api/posts/
/api/posts/:id

##### Error Handling in Express Server

Error handling in Express server accomplished with a middleware. There is a function called errorHandler in the error.middleware.ts file. Errors is thrown in the controllers (with status code 500, 400, 404 etc...) then this function logs errors and send response with error info. This function catchs ApiError (our custom error class) and all Errors.

##### Logging

Logging is made with winston and morgan libraries. There is a middleware called morgan.middleware.ts
Used winston-daily-rotate-file pacakge for daily log files.

> https://betterprogramming.pub/a-complete-guide-to-node-js-logging-1ba70a4a346d

* In the Logging
    - PRODUCTION
        - warn level logs
        - error level logs
    - DEVELOPMENT
        - all level logs
        - morgan request logs

##### Validation

Validations are made in DTOs with joi library. Throwns ValidationError if validation isn't successfull.

##### Filtering

Filtering are made in DTOs.

##### Code Documentation

Code documentation is made with tsdoc and typedoc.

##### Api Documentation

Api documentation is made with swagger.
There's a yaml file ./swagger/swagger.yaml for api documentation/swagger that includes endpoints, tags, schemas etc...
This api is testable in this route: /api-docs
Packages: swagger-ui-express

> https://dev.to/kabartolo/how-to-document-an-express-api-with-swagger-ui-and-jsdoc-50do