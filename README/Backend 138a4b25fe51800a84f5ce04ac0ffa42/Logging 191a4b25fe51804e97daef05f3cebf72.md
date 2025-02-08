# Logging

**Morgan** and **Winston** packages used for logging.

Morgan middleware used in app main code file: **app.use(morganMiddleware)**

## Morgan - ./src/middleware/morgan.ts

This module sets up HTTP request logging using morgan and a custom `winston` logger. It logs detailed request information and conditionally skips logging in non-development environments.

### **Stream Configuration**

```tsx
const stream = {
    // Use the http severity
    write: (message: unknown) => logger.http(message)
}
```

**stream:** An object that defines a write method. This method takes a message and logs it using the http severity level of the logger. **logger** is a custom logger module using `winston` for logging.

### **Skip Function**

```tsx
const skip = () => {
    const env = process.env.NODE_ENV || 'development'
    return env !== 'development'
}
```

**skip:** A function that checks the NODE_ENV environment variable. If the environment is not `development`, it returns `true`, indicating that logging should be skipped.

### **Morgan Middleware Configuration**

```tsx
const morganMiddleware = morgan(
    ":remote-addr :method :url :status :res[content-length] - :response-time ms",
    { stream, skip }
)
```

- **morganMiddleware**: Configures morgan to log HTTP requests with a specific format:
    - `:remote-addr`: IP address of the request.
    - `:method`: HTTP method (GET, POST, etc.).
    - `:url`: URL of the request.
    - `:status`: HTTP status code of the response.
    - `:res[content-length]`: Content length of the response.
    - `:response-time ms`: Time taken to handle the request in milliseconds.
- The configuration object `{ stream, skip }`:
    - stream: Uses the custom stream defined earlier to log messages.
    - skip: Uses the skip function to conditionally skip logging based on the environment.

## Winston - ./src/utils/logger.ts

**winston:** A popular logging library for Node.js.

**winston-daily-rotate-file:** An extension for winston that allows log files to be rotated daily.

### **Determine Log Level Based on Environment**

```tsx
const level = () : string => {
    const env = process.env.NODE_ENV || 'development'
    const isDevelopment = env === 'development'

    return isDevelopment ? 'debug' : 'warn'
}
```

- This function determines the current logging level based on the NODE_ENV environment variable.
- In development mode, it logs all levels (debug).
- In production mode, it logs only warn and error levels.

### **Log Transports**

```tsx
const transports = [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error'
    }),
    new winston.transports.DailyRotateFile({
        filename: 'logs/info-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info'
    }),
]
```

Defines where the log messages should be sent:

- Console transport: Logs messages to the console.
- DailyRotateFile transport: Logs error messages to daily rotated files (error-%DATE%.log).
- DailyRotateFile transport: Logs info messages to daily rotated files (info-%DATE%.log).

## Summary

This system ensures that logs are appropriately formatted, colorized, and stored both in the console and in daily rotated files, with different levels of logging based on the environment.