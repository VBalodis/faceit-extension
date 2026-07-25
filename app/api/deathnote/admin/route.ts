import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url)
    const nickname = searchParams.get("nickname")
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")

    if (token?.value !== "authenticated") { 
        return Response.json({error: "Unathorized"}, {status: 401})
    } 

    const where = {
    status: "PENDING" as const,
    ...(nickname ? {
        nickname: {
            contains: nickname,
            mode: "insensitive" as const
        }
    } : {})
}

    try {
    const submissions = await prisma.deathnoteSubmission.findMany({
        where,
        select: {
            nickname: true,
            reason: true,
            submitted_by: true,
            id: true,
            clip_url: true
        }
    })
    return Response.json({submissions}, {status: 200})
} catch (error) {
    return Response.json({error:"admin not working"}, {status: 500})
}
    
}

