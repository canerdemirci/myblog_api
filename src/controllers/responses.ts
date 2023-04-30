/**
 * @module responses
 * Response functions like 200, 201, 500...
 * To remember status codes as name.
 */

import { Response } from 'express';

export const status200Ok = (res: Response): Response<unknown, Record<string, unknown>> => res.status(200);
export const status201Created = (res: Response): Response<unknown, Record<string, unknown>> => res.status(201);
export const status201CreatedWithLocation = (res: Response, location: string): Response<unknown, Record<string, unknown>> => {
    res.location(location);
    return res.status(201);
}
export const status204NoContent = (res: Response): Response<unknown, Record<string, unknown>> => res.status(204).send();
export const status500ServerError = (res: Response): Response<unknown, Record<string, unknown>> => res.status(500);
export const status400BadRequest = (res: Response): Response<unknown, Record<string, unknown>> => res.status(400);
export const status404NotFound = (res: Response): Response<unknown, Record<string, unknown>> => res.status(404);