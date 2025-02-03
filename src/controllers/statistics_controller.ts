/**
 * @module
 * Authorization, Sanitizing, Validation and Error handling made in routers by middlewares.
 *----------------------------------------------------------------------------------------------
 * * GET:       /statistics                              - Get statistics
 * * GET:       /statistics/addnewguestip                - Add new guest ip
 */

import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { status200Ok } from './responses'

import StatisticsRepository from '../repositories/statistics'

const statisticsRepository = new StatisticsRepository()

/**
 * * Fetches statistics from database or chache
 * * REQUEST: GET
 * * RESPONSE: 200 OK - Json - BlogStatistics
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getStatistics = asyncHandler(async (req: Request, res: Response) => {
    const statistics = await statisticsRepository.getStatistics()
    status200Ok(res).json(statistics)
})

/**
 * * Adds new guest ip addres to the database
 * * REQUEST: GET - ip - Path
 * * RESPONSE: 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad Request
 * @throws 500 Internal server error
 */
const addNewGuestIp = asyncHandler(async (req: Request, res: Response) => {
    try {
        const ip = req.params.ip as string
        await statisticsRepository.addNewGuestIp(ip)
        status200Ok(res).send()
    } catch (_) {
        status200Ok(res).send()
    }
})

export {
    getStatistics,
    addNewGuestIp
}