export type BlogStatistics = {
    postCount: number
    noteCount: number
    userCount: number
    guestCount: number
    tagCount: number
    postCommentCount: number
    postLikeCount: number
    postShareCount: number
    postViewCount: number
    noteLikeCount: number
    noteShareCount: number
    noteViewCount: number
    distributionOfPostsByTags: { name: string, sum: number }[]
    distributionOfUsersByMonths: { month: string, sum: number }[]
    distributionOfGuestsByMonths: { month: string, sum: number }[]
}