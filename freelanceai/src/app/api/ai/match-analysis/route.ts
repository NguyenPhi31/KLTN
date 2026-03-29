import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { jobId } = await req.json();
    if (!jobId) return new NextResponse("Missing jobId", { status: 400 });

    const userId = (session.user as any).id;

    // Get user profile + CV
    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true, title: true, bio: true, skills: true,
        university: true, cvText: true
      }
    });

    // Get job details
    const job: any = await prisma.job.findUnique({
      where: { id: jobId },
      include: { 
        client: { 
          select: { 
            companyName: true, 
            name: true,
            companyDescription: true,
            companyWebsite: true,
            avatar: true,
            location: true
          } 
        },
        _count: { select: { applications: true } }
      }
    });

    if (!job) return new NextResponse("Job not found", { status: 404 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        score: 70,
        breakdown: "Vui lòng cấu hình API Key để nhận phân tích chi tiết từ AI.",
        tips: ["Cập nhật đầy đủ kỹ năng", "Tải lên CV bản PDF"]
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Bạn là chuyên gia phân tích nhân sự AI. Hãy phân tích độ phù hợp giữa Ứng viên và Công việc sau đây.

CÔNG VIỆC:
- Tiêu đề: ${job.title}
- Công ty: ${job.client.companyName || job.client.name}
- Yêu cầu kỹ năng: ${job.requirements || "Không cụ thể"}
- Mô tả: ${job.description}

ỨNG VIÊN:
- Tên: ${user?.name}
- Chức danh: ${user?.title || "N/A"}
- Kỹ năng trên web: ${user?.skills || "N/A"}
- Nội dung CV (tóm tắt): ${user?.cvText ? user.cvText.slice(0, 3000) : "Chưa có CV"}

Hãy trả về một báo cáo phân tích bằng tiếng Việt theo định dạng JSON (KHÔNG có markdown):
{
  "score": 85,
  "matchStatus": "Rất phù hợp | Phù hợp | Tiềm năng | Cần bổ sung",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "weaknesses": ["Điểm yếu/Kỹ năng còn thiếu 1", "Điểm yếu 2"],
  "detailedAnalysis": "Phân tích chuyên sâu về sự tương quan giữa kinh nghiệm và yêu cầu (2-3 câu).",
  "tips": ["Lời khuyên 1 để tăng tỷ lệ trúng tuyển", "Lời khuyên 2"]
}

Phân tích một cách khách quan dựa trên dữ liệu.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "AI analysis failed to parse" });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI_MATCH_ANALYSIS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
