/**
 * @module
 * @class StatisticsRepository
 * This repository used for retrieving statistics.
 */

import { BlogStatistics } from "../types/statistics"
import prismaClient from "../utils/prismaClient"

function numToMonth(num: number): string {
    switch (num) {
        case 0: return 'Ocak';
        case 1: return 'Şubat';
        case 2: return 'Mart';
        case 3: return 'Nisan';
        case 4: return 'Mayıs';
        case 5: return 'Haziran';
        case 6: return 'Temmuz';
        case 7: return 'Ağustos';
        case 8: return 'Eylül';
        case 9: return 'Ekim';
        case 10: return 'Kasım';
        case 11: return 'Aralık';
        default: return '';
    }
}

export default class StatisticsRepository {
    /**
     * Fetches statistics from the database.
     * @throws Error
     * @returns Promise < BlogStatistics >
     */
    async getStatistics() : Promise<BlogStatistics> {
        const postCount = await prismaClient.post.count()
        const noteCount = await prismaClient.note.count()
        const userCount = await prismaClient.user.count()
        const guestCount = await prismaClient.guests.count()
        const tagCount = await prismaClient.tag.count()
        const postCommentCount = await prismaClient.comment.count()
        const postLikeCount = await prismaClient.post.aggregate({
            _sum: {
                likeCount: true
            }
        })
        const postShareCount = await prismaClient.post.aggregate({
            _sum: {
                shareCount: true
            }
        })
        const postViewCount = await prismaClient.post.aggregate({
            _sum: {
                viewCount: true
            }
        })
        const noteLikeCount = await prismaClient.note.aggregate({
            _sum: {
                likeCount: true
            }
        })
        const noteShareCount = await prismaClient.note.aggregate({
            _sum: {
                shareCount: true
            }
        })
        const noteViewCount = await prismaClient.note.aggregate({
            _sum: {
                viewCount: true
            }
        })
        const distributionOfPostsByTags = await prismaClient.tag.findMany({
            orderBy: { name: 'asc' },
            include: { _count: true },
        })
        const distributionOfUsersByMonths = await prismaClient.$transaction(async tx => {
            const data = [] as number[]
            const currentYear = new Date().getFullYear()

            for (let i=0; i<12; i++) {
                const startOfMonth = new Date(currentYear, i, 1)
                const endOfMonth = new Date(currentYear, i + 1, 0)

                let d = await tx.user.aggregate({
                    _count: { _all: true },
                    where: {
                        createdAt: {
                            gte: startOfMonth,
                            lt: endOfMonth
                        }
                    }
                })

                data.push(d._count._all)
            }

            return data
        })
        const distributionOfGuestsByMonths = await prismaClient.$transaction(async tx => {
            const data = [] as number[]
            const currentYear = new Date().getFullYear()

            for (let i=0; i<12; i++) {
                const startOfMonth = new Date(currentYear, i, 1)
                const endOfMonth = new Date(currentYear, i + 1, 0)

                let d = await tx.guests.aggregate({
                    _count: { _all: true },
                    where: {
                        createdAt: {
                            gte: startOfMonth,
                            lt: endOfMonth
                        }
                    }
                })
                data.push(d._count._all)
            }

            return data
        })

        return {
            postCount: postCount ?? 0,
            noteCount: noteCount ?? 0,
            userCount: userCount ?? 0,
            guestCount: guestCount ?? 0,
            tagCount: tagCount ?? 0,
            postCommentCount: postCommentCount ?? 0,
            postLikeCount: postLikeCount._sum.likeCount ?? 0,
            postShareCount: postShareCount._sum.shareCount ?? 0,
            postViewCount: postViewCount._sum.viewCount ?? 0,
            noteLikeCount: noteLikeCount._sum.likeCount ?? 0,
            noteShareCount: noteShareCount._sum.shareCount ?? 0,
            noteViewCount: noteViewCount._sum.viewCount ?? 0,
            distributionOfPostsByTags: distributionOfPostsByTags.map(x =>
                ({ name: x.name, sum: x._count.posts }))
                    .sort((a, b) => b.sum - a.sum)
                    .slice(0, 15),
            distributionOfUsersByMonths: distributionOfUsersByMonths.map((x, i) =>
                ({ month: numToMonth(i), sum: x })
            ),
            distributionOfGuestsByMonths: distributionOfGuestsByMonths.map((x, i) =>
                ({ month: numToMonth(i), sum: x })
            )
        }
    }

    /**
     * Adds new guest ip address to the database.
     * @throws Error
     * @returns Promise < void >
     */
    async addNewGuestIp(ip: string) : Promise<void> {
        await prismaClient.guests.create({
            data: {
                ipadress: ip
            }
        })
    }
}