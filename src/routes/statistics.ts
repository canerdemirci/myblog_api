/**
 * @module
 ** ROUTES OF STATISTICS
 ** Authentication and validation middlewares are used in the following routes
 *----------------------------------------------------------------------------------------------
 * * GET:       /statistics                              - Get statistics
 * * GET:       /statistics/addnewguestip                - Add new guest ip
 */

 import express, { Router } from 'express'
 
import { addNewGuestIp, getStatistics } from '../controllers/statistics_controller'
import { param } from 'express-validator'
import { validationErrorMiddleware } from '../middleware/error'
 
 const statisticsRouter: Router = express.Router()
 
 // GET   /statistics   -   Get statistics
 statisticsRouter.get('/', getStatistics)
 // GET    /statistics/addnewguestip  -  Add new guest ip
 statisticsRouter.get(
    '/addnewguestip/:ip',
    [
        param('ip')
            .isString()
            .trim()
            .notEmpty().withMessage('Ip adress cannot be empty')
            .escape()
    ],
    validationErrorMiddleware,
    addNewGuestIp
)
 
 export default statisticsRouter