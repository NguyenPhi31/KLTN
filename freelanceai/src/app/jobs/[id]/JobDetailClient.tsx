"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ApplyButton from "@/components/ApplyButton";

interface JobDetailClientProps {
  job: any;
  role: string;
}

export default function JobDetailClient({ job, role }: JobDetailClientProps) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setAnalyzing(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await fetch("/api/ai/match-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError("Không thể phân tích lúc này. Vui lòng thử lại.");
    } finally {
      setAnalyzing(false);
    }
  }

  const jobTypeLabel: Record<string, string> = {
    FULL_TIME: "Toàn thời gian", PART_TIME: "Bán thời gian",
    INTERNSHIP: "Thực tập", REMOTE: "Remote", CONTRACT: "Ngắn hạn"
  };
  const expLabel: Record<string, string> = {
    INTERN: "Thực tập sinh", FRESHER: "Fresher", JUNIOR: "Junior", SENIOR: "Senior"
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit group">
        <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="text-sm font-bold uppercase tracking-wider">Quay lại</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Job Info */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm p-8">
            <header className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                {job.jobType && (
                  <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {jobTypeLabel[job.jobType] || job.jobType}
                  </span>
                )}
                {job.experienceLevel && (
                  <span className="bg-surface-container text-on-surface-variant text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-outline-variant/10">
                    {expLabel[job.experienceLevel] || job.experienceLevel}
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-black text-on-surface leading-tight mb-2">{job.title}</h1>
              <p className="text-xl font-medium text-primary mb-6">{job.budget || "Thỏa thuận"}</p>
              
              <div className="flex flex-wrap gap-6 text-on-surface-variant border-y border-outline-variant/10 py-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <span className="text-sm font-bold">{job.jobLocation || "Chưa xác định"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">event</span>
                  <span className="text-sm font-bold">Hạn: {job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">group</span>
                  <span className="text-sm font-bold">{job._count?.applications || 0} ứng tuyển</span>
                </div>
              </div>
            </header>

            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-bold text-on-surface mb-2 mt-8">Mô tả công việc</h3>
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{job.description}</p>

              {job.requirements && (
                <>
                  <h3 className="text-lg font-bold text-on-surface mb-3 mt-8">Yêu cầu kỹ năng</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.split(",").map((s: string) => (
                      <span key={s} className="bg-surface-container-high text-on-surface px-4 py-2 rounded-xl text-sm font-medium border border-outline-variant/10">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* AI Match Breakdown Section */}
          {role === "FREELANCER" && (
            <section className="bg-surface-container-highest rounded-3xl border border-primary/20 shadow-lg p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
               <div className="flex items-center justify-between mb-6 relative z-10">
                 <div className="flex items-center gap-3">
                   <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                   <div>
                     <h2 className="text-xl font-black text-on-surface">AI Match Breakdown</h2>
                     <p className="text-sm text-on-surface-variant">Phân tích khả năng trúng tuyển của bạn</p>
                   </div>
                 </div>
                 {!analysis && !analyzing && (
                   <button 
                     onClick={handleAnalyze}
                     className="bg-primary text-on-primary font-black px-6 py-3 rounded-full hover:bg-primary-container hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2"
                   >
                     <span className="material-symbols-outlined text-base">auto_awesome</span>
                     Phân tích ngay
                   </button>
                 )}
               </div>

               {analyzing && (
                 <div className="flex flex-col items-center py-12 gap-4">
                   <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                   <p className="font-bold text-primary animate-pulse">Gemini đang phân tích hồ sơ & CV của bạn...</p>
                 </div>
               )}

               {error && (
                 <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl flex items-center gap-3">
                   <span className="material-symbols-outlined">error</span>
                   {error}
                 </div>
               )}

               {analysis && (
                 <div className="flex flex-col gap-6 relative z-10">
                   <div className="flex flex-col md:flex-row items-center gap-8 bg-surface/50 p-6 rounded-2xl border border-outline-variant/10">
                      <div className="relative w-32 h-32 shrink-0">
                        <svg viewBox="0 0 120 120" className="-rotate-90 w-full h-full">
                          <circle cx="60" cy="60" r="50" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                          <circle cx="60" cy="60" r="50" stroke={analysis.score >= 80 ? "#00BFA5" : "#6366f1"} strokeWidth="10" fill="none"
                            strokeDasharray={`${(analysis.score / 100) * 314} 314`}
                            strokeLinecap="round" className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-primary">{analysis.score}</span>
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Match %</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-primary/10 text-primary font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest w-fit mb-3">
                          {analysis.matchStatus}
                        </div>
                        <p className="text-on-surface font-medium leading-relaxed italic">"{analysis.detailedAnalysis}"</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100">
                        <h4 className="flex items-center gap-2 font-black text-teal-700 text-sm mb-3">
                          <span className="material-symbols-outlined text-teal-600 text-base">check_circle</span>
                          Điểm cộng từ bạn
                        </h4>
                        <ul className="flex flex-col gap-2">
                          {analysis.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-teal-800 flex items-start gap-2">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                        <h4 className="flex items-center gap-2 font-black text-indigo-700 text-sm mb-3">
                          <span className="material-symbols-outlined text-indigo-600 text-base">lightbulb</span>
                          Lời khuyên từ AI
                        </h4>
                        <ul className="flex flex-col gap-2">
                          {analysis.tips.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-indigo-800 flex items-start gap-2">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                   </div>
                 </div>
               )}
            </section>
          )}
        </div>

        {/* Right column: Company Info & Action */}
        <div className="flex flex-col gap-6">
          <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm p-6 sticky top-24">
            <h2 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-6">Thông tin nhà tuyển dụng</h2>
            <div className="flex flex-col items-center text-center mb-6">
              {job.client.avatar ? (
                <img src={job.client.avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover mb-4 border border-outline-variant/10" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-black text-primary text-2xl mb-4 border border-outline-variant/10">
                  {job.client.companyName?.[0] || job.client.name?.[0]}
                </div>
              )}
              <h3 className="font-extrabold text-lg text-on-surface">{job.client.companyName || job.client.name}</h3>
              {job.client.location && (
                <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>{job.client.location}
                </p>
              )}
            </div>

            {job.client.companyDescription && (
              <p className="text-xs text-on-surface-variant mb-6 line-clamp-4 leading-relaxed italic">"{job.client.companyDescription}"</p>
            )}

            {job.client.companyWebsite && (
              <a href={job.client.companyWebsite} target="_blank" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1 mb-6">
                <span className="material-symbols-outlined text-sm">link</span> Truy cập website
              </a>
            )}

            {role === "FREELANCER" && (
              <div className="pt-6 border-t border-outline-variant/10">
                <ApplyButton jobId={job.id} />
              </div>
            )}
            {role === "CLIENT" && (
              <div className="pt-6 border-t border-outline-variant/10 text-center">
                <p className="text-xs text-on-surface-variant font-bold mb-4">Bạn là nhà tuyển dụng!</p>
                <Link href="/applications" className="bg-surface-container-high text-on-surface font-bold px-6 py-3 rounded-full text-xs hover:bg-surface-container transition-all flex items-center justify-center gap-2">
                   <span className="material-symbols-outlined text-sm">group</span>
                   Quản lý ứng viên
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
