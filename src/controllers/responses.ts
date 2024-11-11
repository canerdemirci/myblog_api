/**
 * @module responses
 * Response functions like 200, 201, 500...
 * To remember status codes as name.
 */

import { Response } from 'express';

type ResFunc = (res: Response) => Response<any, Record<string, any>>
type ResFuncWithLocation = (res: Response, location: string) => Response<any, Record<string, any>>

export const status200Ok: ResFunc = (res) => res.status(200);
export const status201Created: ResFunc = (res) => res.status(201);
export const status201CreatedWithLocation: ResFuncWithLocation = (res, location) => {
    res.location(location);
    return res.status(201);
}
export const status204NoContent: ResFunc = (res) => res.status(204).send();
export const status500ServerError: ResFunc = (res) => res.status(500);
export const status400BadRequest: ResFunc = (res) => res.status(400);
export const status401Unauthorized: ResFunc = (res) => res.status(401);
export const status404NotFound: ResFunc = (res) => res.status(404);