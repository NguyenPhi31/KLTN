import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password, role, companyName } = body;
 
    if (!email || !name || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }
 
    const exist = await prisma.user.findUnique({
      where: {
        email
      }
    });
 
    if (exist) {
      return new NextResponse("Email already exists", { status: 400 });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || "FREELANCER",
        companyName: role === "CLIENT" ? companyName : undefined
      }
    });

    // Don't return the full user object with password to the client
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
