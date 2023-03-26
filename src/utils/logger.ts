/**
 * @module logger
 * For logging with winston package.
 */

import winston from 'winston';
import 'winston-daily-rotate-file';

/**
 * Log severity levels
 */
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
}

/**
 * This method set the current severity based on
 * the current NODE_ENV: show all the log levels
 * if the server was run in development mode; otherwise,
 * if it was run in production, show only warn and error messages.
 * @returns {string}
 */
const level = () : string => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';

    return isDevelopment ? 'debug' : 'warn';
}

/**
 * Colors for log levels
 */
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
}

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    winston.format.align(),
    winston.format.colorize({ all: true }),
    // Define the format of the message showing the timestamp, the level and the message
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

/**
 * Define which transports the logger must use to print out messages.
 */
const transports = [
    // Allow the use the console to print the messages
    new winston.transports.Console(),
    // Allow to print all the error level messages inside the error.log file
    new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error'
    }),
    // Allow to print all the info level messages inside the info.log file
    new winston.transports.DailyRotateFile({
        filename: 'logs/info-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info'
    }),
];

const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports
});

export default logger;