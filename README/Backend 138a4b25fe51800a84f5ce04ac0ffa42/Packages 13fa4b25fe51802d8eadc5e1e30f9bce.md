# Packages

| **Npm Script Commands** |  |  |
| --- | --- | --- |
| **dev** | nodemon ./src/index.ts | Runs the app and restarts when a files changed |
| **build** | npm install && npm run migrate | Installs packages and deploys prisma migrations |
| **start** | tsx ./src/index.ts | Starts the app |
| **migrate** | npx prisma migrate deploy | Deploys prisma migrations to the Postgre database for production |
| **doc** | npx typedoc --options typedoc.json | Builds a code documentation with typedoc.json file to root folder named “docs” folder |

| **Dev Dependencies** |  |
| --- | --- |
| **nodemon** | Runs the app and restarts when a files changed |
| **prisma** | Prisma is an open-source database toolkit. It includes JS/Typescript ORM for NodeJS |
| **tsx** | Runs typescript code |
| **typedoc** | Documentation generator for TypeScript projects |
| **typescript** | Typescript |
| **winston** | A logger for just about everything |

| **Dependencies** |  |
| --- | --- |
| **@prisma/client** | Prisma Client JS is an auto-generated query builder that enables type-safe database access and reduces boilerplate. It is part of the Prisma ecosystem. Prisma provides database tools for data access, declarative data modeling, schema migrations and visual data management. |
| **compression** | Node.js compression middleware. The middleware will attempt to compress response bodies for all requests that traverse through the middleware, based on the given options. The compression package for Node.js is a middleware that can be used to compress HTTP responses. It is commonly used in web applications to reduce the size of the response body, which can lead to faster load times and reduced bandwidth usage. The middleware supports several compression algorithms, including gzip, deflate, and brotli. |
| **cors** | The cors package for Node.js is a middleware that enables Cross-Origin Resource Sharing (CORS) in your web applications. CORS is a security feature implemented by web browsers to prevent web pages from making requests to a different domain than the one that served the web page. The cors package simplifies handling CORS in Node.js applications, particularly when using frameworks like Express.js |
| **dotenv** | The dotenv package for Node.js is a lightweight and widely used tool for managing environment variables in your application. It allows you to load configuration settings (e.g., API keys, database credentials, or other sensitive information) from a .env file into your application's environment. |
| **express** | The Express package for Node.js is one of the most popular and widely used web frameworks. It simplifies the process of building web applications and APIs by providing a robust set of features for routing, middleware, and handling HTTP requests and responses. Express is lightweight, flexible, and highly extensible, making it a go-to choice for developers building server-side applications with Node.js. |
| **express-async-handler** | The express-async-handler package is a small but very useful utility for handling asynchronous code in Express.js route handlers. It simplifies error handling in asynchronous routes by automatically catching errors and passing them to Express's error-handling middleware. **This eliminates the need for writing repetitive try-catch blocks in your route handlers.** |
| **express-rate-limit** | The express-rate-limit package is a middleware for Express.js that helps you limit the number of requests a client can make to your API or application within a specified time window. This is particularly useful for preventing abuse, brute-force attacks, and ensuring fair usage of your resources. |
| **express-slow-down** | The express-slow-down package is a middleware for Express.js that helps you slow down requests from clients who are making too many requests in a short period of time, rather than outright blocking them. This is a more user-friendly approach compared to strict rate limiting, as it allows clients to continue making requests but at a slower pace. It’s particularly useful for preventing abuse while still providing a good user experience. |
| **express-validator** | The express-validator package is a popular middleware for validating and sanitizing incoming request data in Express.js applications. It is built on top of the validator.js library, which provides a wide range of validation and sanitization functions. express-validator makes it easy to validate user input (e.g., from forms or API requests) and sanitize it to prevent security issues like SQL injection or XSS (Cross-Site Scripting). |
| **jose** | The jose package is a modern, versatile, and efficient library for working with JSON Web Tokens (JWT), JSON Web Keys (JWK), and other related standards in Node.js and browser environments. It provides a comprehensive set of tools for creating, verifying, and manipulating JWTs, as well as handling cryptographic operations in a secure and developer-friendly way. |
| **morgan** | The morgan package is a popular HTTP request logger middleware for Node.js, commonly used with the Express.js framework. It logs details about incoming HTTP requests, such as the request method, URL, status code, response time, and more. This is incredibly useful for debugging, monitoring, and analyzing traffic in your application. |
| **multer** | The multer package is a popular middleware for Node.js, specifically designed to handle multipart/form-data, which is primarily used for uploading files in web applications. It is commonly used with the Express.js framework to process file uploads, such as images, documents, or other binary data. |
| **node-cache** | The node-cache package is a simple and efficient in-memory caching library for Node.js. It allows you to store key-value pairs in memory, making it easy to cache data and improve the performance of your application by reducing the need to repeatedly fetch or compute the same data. |
| **swagger-ui-express** | The swagger-ui-express package is a popular middleware for Node.js applications that allows you to serve Swagger UI documentation for your APIs. Swagger UI is an interactive, web-based interface that makes it easy to visualize and interact with your API's endpoints, parameters, responses, and other details. It is particularly useful for API documentation and testing. |
| **winston-daily-rotate-file** | The winston-daily-rotate-file package is a transport for the Winston logging library in Node.js. It allows you to automatically rotate log files based on a specified schedule (e.g., daily, hourly) or file size. This is particularly useful for managing log files in production environments, where logs can grow large and need to be archived or deleted periodically. |
| **yaml** | The yaml package for Node.js is a library for parsing and serializing YAML (YAML Ain't Markup Language) data. YAML is a human-readable data serialization format commonly used for configuration files, data exchange, and other purposes. The yaml package provides a simple and efficient way to work with YAML in Node.js applications. It used for creating swagger documentation. |