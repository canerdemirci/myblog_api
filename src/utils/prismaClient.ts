/**
 * @module prismaClient
 * For using prisma orm database functions.
 */

import { PrismaClient } from '@prisma/client'

const prismaClient = new PrismaClient()

export default prismaClient