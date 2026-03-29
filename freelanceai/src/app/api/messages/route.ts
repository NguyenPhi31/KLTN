import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const otherUserId = searchParams.get("userId");

  try {
    if (otherUserId) {
      // Fetch messages between current user and otherUserId
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json(messages);
    } else {
      // Fetch all conversations (unique users we've chatted with)
      const messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
      });

      const conversations: any = [];
      const seenUsers = new Set();

      messages.forEach((msg) => {
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        if (!seenUsers.has(otherUser.id)) {
          seenUsers.add(otherUser.id);
          conversations.push({
            user: otherUser,
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt,
          });
        }
      });

      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.error("Messages API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { receiverId, content } = await req.json();

  if (!receiverId || !content) {
    return NextResponse.json({ error: "Missing receiverId or content" }, { status: 400 });
  }

  try {
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId,
        content,
      },
    });
    return NextResponse.json(message);
  } catch (error) {
    console.error("Messages API POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
