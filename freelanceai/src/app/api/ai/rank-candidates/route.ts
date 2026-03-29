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
  if ((session.user as any).role !== "CLIENT") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const { jobId } = await req.json();
    if (!jobId) return new NextResponse("Missing jobId", { status: 400 });

    // Get job details
    const job: any = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return new NextResponse("Job not found", { status: 404 });

    // Get all freelancers
    const freelancers: any[] = await prisma.user.findMany({
      where: { role: "FREELANCER" },
      select: {
        id: true, name: true, title: true, bio: true, skills: true,
        university: true, hourlyRate: true, location: true, matchScore: true, avatar: true, cvText: true
      }
    });

    if (freelancers.length === 0) {
      return NextResponse.json({ rankedCandidates: [], message: "Chưa có ứng viên nào trong hệ thống." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback algorithm
      const jobReqs = (job.requirements || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
      const jobKeywords = (job.title + " " + job.description).toLowerCase();

      const scored = freelancers.map(f => {
        const fSkills = (f.skills || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
        const matchCount = jobReqs.length > 0
          ? fSkills.filter(s => jobReqs.some(r => r.includes(s) || s.includes(r))).length
          : fSkills.filter(s => jobKeywords.includes(s)).length;
        const base = jobReqs.length > 0
          ? Math.round((matchCount / Math.max(jobReqs.length, 1)) * 100)
          : Math.min(matchCount * 20, 80);
        return {
          ...f,
          aiScore: Math.min(98, base + 30),
          aiReason: matchCount > 0
            ? `Ứng viên có ${matchCount} kỹ năng phù hợp với yêu cầu công việc.`
            : "Ứng viên có thể phát triển các kỹ năng cần thiết cho vị trí này."
        };
      });
      scored.sort((a, b) => b.aiScore - a.aiScore);
      return NextResponse.json({ rankedCandidates: scored, source: "algorithm" });
    }

    // Use Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const candidateList = freelancers.map((f, i) =>
      `Ứng viên ${i + 1} [ID:${f.id}]: Tên: ${f.name}. Chức danh: ${f.title || "N/A"}. Kỹ năng: ${f.skills || "Chưa cập nhật"}. Trường: ${f.university || "N/A"}. Nội dung CV: ${f.cvText ? f.cvText.slice(0, 1000) : "N/A"}.`
    ).join("\n");

    const prompt = `Bạn là chuyên gia tuyển dụng AI. Hãy xếp hạng các ứng viên dưới đây theo mức độ phù hợp với công việc, từ cao đến thấp.

YÊU CẦU CÔNG VIỆC:
- Tiêu đề: ${job.title}
- Kỹ năng yêu cầu: ${job.requirements || "Không cụ thể"}
- Cấp độ: ${job.experienceLevel || "Không yêu cầu cụ thể"}
- Loại việc: ${job.jobType || "Không xác định"}
- Mô tả: ${job.description.slice(0, 300)}
- Ngân sách: ${job.budget || "Thỏa thuận"}

DANH SÁCH ỨNG VIÊN:
${candidateList}

Trả về JSON hợp lệ (KHÔNG có markdown):
{
  "rankedCandidates": [
    {
      "candidateId": "id_ung_vien",
      "aiScore": 88,
      "aiReason": "Lý do phù hợp ngắn gọn bằng tiếng Việt (1-2 câu)"
    }
  ]
}

Xếp hạng TẤT CẢ ứng viên theo thứ tự giảm dần của aiScore (0-100).`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let aiResult;
    try {
      aiResult = JSON.parse(text);
    } catch {
      return NextResponse.json({ rankedCandidates: [], error: "AI response parse error" });
    }

    // Enrich with freelancer details
    const fMap = new Map(freelancers.map(f => [f.id, f]));
    const enriched = (aiResult.rankedCandidates || []).map((rec: any) => {
      const f = fMap.get(rec.candidateId);
      if (!f) return null;
      return { ...f, aiScore: rec.aiScore, aiReason: rec.aiReason };
    }).filter(Boolean);

    return NextResponse.json({ rankedCandidates: enriched, source: "gemini" });
  } catch (error) {
    console.error("AI_RANK_CANDIDATES_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
