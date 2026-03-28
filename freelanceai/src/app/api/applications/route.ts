import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if ((session.user as any).role !== "FREELANCER") {
      return new NextResponse("Forbidden - Only freelancers can apply", { status: 403 });
  }

  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return new NextResponse("Missing jobId", { status: 400 });
    }

    // Checking if already applied
    const existingApplication = await prisma.application.findFirst({
        where: {
            jobId,
            freelancerId: (session.user as any).id
        }
    });

    if (existingApplication) {
        return new NextResponse("Already applied", { status: 400 });
    }

    const matchScore = Math.floor(Math.random() * (99 - 50 + 1) + 50);

    const application = await prisma.application.create({
      data: {
        jobId,
        freelancerId: (session.user as any).id,
        matchScore
      }
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("POST_APPLICATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    let applications;

    if (role === "FREELANCER") {
      applications = await prisma.application.findMany({
        where: { freelancerId: userId },
        include: {
          job: {
            select: { title: true, client: { select: { name: true } } }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    } else {
      // Client
      applications = await prisma.application.findMany({
        where: {
          job: { clientId: userId }
        },
        include: {
          job: { select: { title: true } },
          freelancer: { select: { name: true, title: true, skills: true } }
        },
        orderBy: { matchScore: "desc" }
      });
    }

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET_APPLICATIONS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
