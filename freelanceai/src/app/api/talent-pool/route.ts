import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all freelancers (for CLIENT talent pool)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if ((session.user as any).role !== "CLIENT") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const freelancers = await prisma.user.findMany({
      where: { role: "FREELANCER" },
      select: {
        id: true,
        name: true,
        email: true,
        title: true,
        bio: true,
        skills: true,
        avatar: true,
        location: true,
        hourlyRate: true,
        university: true,
        dateOfBirth: true,
        matchScore: true,
        _count: { select: { applications: true } }
      },
      orderBy: { matchScore: "desc" }
    });

    return NextResponse.json(freelancers);
  } catch (error) {
    console.error("GET_TALENT_POOL_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
