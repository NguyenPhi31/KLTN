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
  if ((session.user as any).role !== "FREELANCER") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const userId = (session.user as any).id;

    // Get freelancer profile
    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true, title: true, bio: true, skills: true,
        university: true, hourlyRate: true, location: true, cvText: true
      }
    });

    // Get all open jobs
    const jobs: any[] = await prisma.job.findMany({
      where: { status: "OPEN" },
      include: { client: { select: { name: true, companyName: true } } },
      orderBy: { createdAt: "desc" },
      take: 30
    });

    if (jobs.length === 0) {
      return NextResponse.json({ recommendations: [], message: "Hiện chưa có công việc nào." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback: simple skill-matching algorithm
      const userSkills = (user?.skills || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
      const scored = jobs.map(job => {
        const jobReqs = (job.requirements || job.title + " " + job.description).toLowerCase();
        const matchCount = userSkills.filter(s => jobReqs.includes(s)).length;
        const score = userSkills.length > 0 ? Math.round((matchCount / userSkills.length) * 100) : 50;
        return {
          jobId: job.id,
          title: job.title,
          company: job.client.companyName || job.client.name,
          budget: job.budget,
          jobType: job.jobType,
          requirements: job.requirements,
          matchScore: Math.min(99, score + 40),
          reason: score > 0
            ? `Hồ sơ của bạn có ${matchCount} kỹ năng phù hợp với yêu cầu công việc.`
            : "Công việc này phù hợp với định hướng phát triển của bạn."
        };
      });
      scored.sort((a, b) => b.matchScore - a.matchScore);
      return NextResponse.json({ recommendations: scored.slice(0, 6), source: "algorithm" });
    }

    // Use Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const jobList = jobs.map((j, i) =>
      `Job ${i + 1} [ID:${j.id}]: "${j.title}" tại ${j.client.companyName || j.client.name}. Yêu cầu: ${j.requirements || "Không cụ thể"}. Mô tả: ${j.description.slice(0, 150)}. Mức thù lao: ${j.budget || "Thỏa thuận"}.`
    ).join("\n");

    const prompt = `Bạn là chuyên gia tuyển dụng AI. Hãy phân tích hồ sơ sinh viên/freelancer sau và gợi ý TỐI ĐA 6 công việc phù hợp nhất trong danh sách.

HỒ SƠ ỨNG VIÊN:
- Tên: ${user?.name}
- Chức danh: ${user?.title || "Chưa cập nhật"}
- Kỹ năng: ${user?.skills || "Chưa cập nhật"}
- Trường đại học: ${user?.university || "Chưa cập nhật"}
- Giới thiệu: ${user?.bio || "Chưa có"}
- Mức thù lao mong muốn: ${user?.hourlyRate || "Thỏa thuận"}
- Nội dung chi tiết trong CV (PDF): ${user?.cvText ? user.cvText.slice(0, 2000) : "Chưa tải lên CV"}

DANH SÁCH CÔNG VIỆC:
${jobList}

Hãy trả về JSON hợp lệ với cấu trúc sau (KHÔNG có markdown, chỉ JSON thuần):
{
  "recommendations": [
    {
      "jobId": "id_của_job",
      "matchScore": 85,
      "reason": "Lý do ngắn gọn tại sao phù hợp (1-2 câu tiếng Việt)"
    }
  ]
}

Chỉ chọn các job thực sự phù hợp. matchScore từ 0-100.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let aiResult;
    try {
      aiResult = JSON.parse(text);
    } catch {
      return NextResponse.json({ recommendations: [], error: "AI response parse error" });
    }

    // Enrich with job details
    const jobMap = new Map(jobs.map(j => [j.id, j]));
    const enriched = (aiResult.recommendations || []).map((rec: any) => {
      const job = jobMap.get(rec.jobId);
      if (!job) return null;
      return {
        jobId: job.id,
        title: job.title,
        company: job.client.companyName || job.client.name,
        budget: job.budget,
        jobType: job.jobType,
        requirements: job.requirements,
        matchScore: rec.matchScore,
        reason: rec.reason
      };
    }).filter(Boolean);

    return NextResponse.json({ recommendations: enriched, source: "gemini" });
  } catch (error) {
    console.error("AI_RECOMMEND_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
