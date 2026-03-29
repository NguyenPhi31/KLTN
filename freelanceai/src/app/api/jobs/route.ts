import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true, companyName: true, avatar: true } },
        _count: { select: { applications: true } }
      }
    });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("GET_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if ((session.user as any).role !== "CLIENT") {
    return new NextResponse("Forbidden - Only clients can post jobs", { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, description, budget, requirements, jobType, experienceLevel, jobLocation, deadline } = body;

    if (!title || !description) {
      return new NextResponse("Missing title or description", { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget,
        requirements,
        jobType,
        experienceLevel,
        jobLocation,
        deadline: deadline ? new Date(deadline) : null,
        clientId: (session.user as any).id
      }
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("POST_JOB_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
