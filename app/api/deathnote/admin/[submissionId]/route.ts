import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function PATCH(req: Request, {params}: {params: Promise<{submissionId: string}>}) {
    const rawData = await req.json()
    const status = rawData.status
    const {submissionId} = await params
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")

    if (token?.value !== "authenticated") {
        return Response.json({error: "Unauthorized"}, {status: 401})
    }
     
    try {
    if (status === "APPROVED" || status === "REJECTED") {
        const submissionUpdate = await prisma.deathnoteSubmission.update({
            where: {id: submissionId},
            data: {status: status}
    })
    return Response.json(submissionUpdate)
    } else {
        return Response.json({error: 'Some error'}, {status: 400})
    }} catch(error) {
        return Response.json({error},{status: 500})
    }

}