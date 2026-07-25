import { prisma } from "@/lib/prisma"

export async function GET(req: Request, {params}: {params: Promise<{playerId: string}>}) {
    const {playerId} = await params
    if (!playerId) return Response.json({error:"playerId = null"}, {status: 400})

        try {
        const count = await prisma.deathnoteSubmission.count({
            where: {
                player_id: playerId,
                status: "APPROVED"
            },
})
        const memeScore = Math.min(count * 5, 100)
        const lastReport = await prisma.deathnoteSubmission.findMany({
        where: {
            player_id: playerId,
            status: "APPROVED"
        },
        take: 3,
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            nickname: true,
            reason: true,
            submitted_by: true,
            createdAt: true
        }
})
        return Response.json({count, memeScore,lastReport})
} catch(error) {
    console.error("player stats error:", error)
    const message = error instanceof Error ? error.message : "unknown error"
    return Response.json({ error: message }, { status: 500 })
}
}
