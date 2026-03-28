import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        bio: true,
        skills: true,
        matchScore: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, bio, skills } = body;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        title,
        bio,
        skills,
        // Mocking AI Evaluation Score dynamically upon profile update
        matchScore: Math.floor(Math.random() * (99 - 70 + 1) + 70) 
      },
      select: {
        id: true,
        name: true,
        role: true,
        title: true,
        bio: true,
        skills: true,
        matchScore: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
