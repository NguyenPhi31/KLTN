import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
const pdf = require("pdf-parse");

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
        matchScore: true,
        avatar: true,
        companyName: true,
        companyDescription: true,
        companyWebsite: true,
        location: true,
        hourlyRate: true,
        dateOfBirth: true,
        university: true,
        cvUrl: true,
        cvText: true,
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

  const userId = (session.user as any).id;

  try {
    const contentType = req.headers.get("content-type") || "";
    let dataToUpdate: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      
      const getString = (key: string) => {
        const val = formData.get(key);
        return val !== null ? String(val) : undefined;
      };

      dataToUpdate = {
        name: getString("name"),
        title: getString("title"),
        bio: getString("bio"),
        skills: getString("skills"),
        companyName: getString("companyName"),
        companyDescription: getString("companyDescription"),
        companyWebsite: getString("companyWebsite"),
        location: getString("location"),
        hourlyRate: getString("hourlyRate"),
        university: getString("university"),
      };

    // Parse dateOfBirth safely
    const dobStr = getString("dateOfBirth");
    if (dobStr && dobStr.trim() !== "") {
      const parsedDate = new Date(dobStr);
      if (!isNaN(parsedDate.getTime())) {
        dataToUpdate.dateOfBirth = parsedDate;
      }
    }

    // Handle Avatar upload
    const avatarFile = formData.get("avatar") as File | null;
    if (avatarFile && avatarFile.size > 0 && typeof avatarFile.name === "string" && avatarFile.name !== "undefined") {
      try {
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const safeName = avatarFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const filename = `${userId}-avatar-${Date.now()}-${safeName}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        dataToUpdate.avatar = `/uploads/avatars/${filename}`;
      } catch (err) {
        console.error("Avatar upload failed:", err);
      }
    }

    // Handle CV (PDF) upload
    const cvFile = formData.get("cv") as File | null;
    if (cvFile && cvFile.size > 0 && typeof cvFile.name === "string" && cvFile.name !== "undefined") {
      try {
        const bytes = await cvFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Extract text for AI
        try {
          const pdfData = await pdf(buffer);
          dataToUpdate.cvText = pdfData.text || "";
        } catch (pdfErr) {
          console.error("PDF Parsing Error:", pdfErr);
        }

        const safeName = cvFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const filename = `${userId}-cv-${Date.now()}-${safeName}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "cvs");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        dataToUpdate.cvUrl = `/uploads/cvs/${filename}`;
      } catch (err) {
        console.error("CV upload failed:", err);
      }
    }
  } else {
    try {
      const body = await req.json();
      dataToUpdate = { ...body };
    } catch (e) {
      // Not JSON
    }
  }

  // Remove undefined fields
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key] === undefined) {
      delete dataToUpdate[key];
    }
  });

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Prisma update error:", error);
    return new NextResponse(`Database error: ${error.message || "Unknown error"}`, { status: 500 });
  }
} catch (error: any) {
  console.error("Form handling error:", error);
  return new NextResponse(`Form error: ${error.message || "Unknown error"}`, { status: 500 });
}
}
